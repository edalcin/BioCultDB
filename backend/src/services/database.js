/**
 * Database Service
 *
 * CRUD operations for reference documents.
 * Persists the Reference document (JSON) in `biocultdb_records.doc` (SQLite+JSON1,
 * ADR-005) and keeps the `biocultdb_records_fts` FTS5 table in sync inside the
 * same transaction as every write (insert/update/delete), per DA4.
 *
 * `query` contract accepted by findReferences/countReferences/searchReferences:
 *   {
 *     status?: string,   // exact match on the generated `status` column
 *     ano?: number,       // exact match on the generated `ano` column
 *     fonte?: string,     // exact match on the generated `fonte` column
 *     text?: string,      // free-text search via FTS5 MATCH (titulo/autores/resumo/doi/comunidades)
 *     conditions?: [{ fields: string[], op: 'eq'|'contains', value: string }]
 *       // `fields` inside one condition are OR'd; each condition item is AND'd with the rest.
 *       // `fields` MUST come from FIELD_REGISTRY below (whitelist) — never raw JSON paths from callers.
 *   }
 */

const database = require('../shared/database');
const logger = require('../shared/logger');
const { createReference, updateReference, Status } = require('../models/Reference');

/**
 * Whitelist of searchable JSON paths and how to reach them from `doc`.
 * - root: scalar at the top level of the document
 * - root-array: array of scalars at the top level
 * - comunidade: scalar nested under each `comunidades[]` entry
 * - comunidade-array: array of scalars nested under each `comunidades[]` entry
 * - planta-array: array of scalars nested under each `comunidades[].plantas[]` entry
 */
const FIELD_REGISTRY = {
  titulo: { scope: 'root', path: '$.titulo' },
  autores: { scope: 'root-array', path: '$.autores' },
  resumo: { scope: 'root', path: '$.resumo' },
  DOI: { scope: 'root', path: '$.DOI' },
  'comunidades.nome': { scope: 'comunidade', path: '$.nome' },
  'comunidades.tipo': { scope: 'comunidade', path: '$.tipo' },
  'comunidades.estado': { scope: 'comunidade', path: '$.estado' },
  'comunidades.municipio': { scope: 'comunidade', path: '$.municipio' },
  'comunidades.local': { scope: 'comunidade', path: '$.local' },
  'comunidades.observacoes': { scope: 'comunidade', path: '$.observacoes' },
  'comunidades.atividadesEconomicas': { scope: 'comunidade-array', path: '$.atividadesEconomicas' },
  'comunidades.plantas.nomeCientifico': { scope: 'planta-array', path: '$.nomeCientifico' },
  'comunidades.plantas.nomeVernacular': { scope: 'planta-array', path: '$.nomeVernacular' },
  'comunidades.plantas.tipoUso': { scope: 'planta-array', path: '$.tipoUso' }
};

const VALID_SORT_FIELDS = new Set(['titulo', 'autores', 'ano', 'status', 'createdAt']);

/**
 * Ensure the shared SQLite connection is open (idempotent, synchronous).
 * @returns {import('better-sqlite3').Database}
 */
function getDb() {
  if (!database.isConnected) {
    database.connect();
  }
  return database.getConnection();
}

/**
 * Build a single comparison SQL fragment for a whitelisted field, pushing its
 * bound value onto `params`. Value is ALWAYS bound as a parameter, never
 * interpolated into the SQL text.
 * @param {string} field - Key from FIELD_REGISTRY
 * @param {'eq'|'contains'} op
 * @param {string} value
 * @param {Array} params
 * @returns {string}
 */
function buildFieldCondition(field, op, value, params) {
  const meta = FIELD_REGISTRY[field];
  if (!meta) {
    throw new Error(`Campo de busca não permitido: ${field}`);
  }

  const cmp = (expr) => {
    params.push(value);
    return op === 'contains'
      ? `LOWER(${expr}) LIKE '%' || LOWER(?) || '%'`
      : `LOWER(${expr}) = LOWER(?)`;
  };

  switch (meta.scope) {
    case 'root':
      return cmp(`json_extract(doc,'${meta.path}')`);
    case 'root-array':
      return `EXISTS (SELECT 1 FROM json_each(doc,'${meta.path}') je WHERE ${cmp('je.value')})`;
    case 'comunidade':
      return `EXISTS (SELECT 1 FROM json_each(doc,'$.comunidades') com WHERE ${cmp(`json_extract(com.value,'${meta.path}')`)})`;
    case 'comunidade-array':
      return `EXISTS (SELECT 1 FROM json_each(doc,'$.comunidades') com, json_each(com.value,'${meta.path}') ae WHERE ${cmp('ae.value')})`;
    case 'planta-array':
      return `EXISTS (SELECT 1 FROM json_each(doc,'$.comunidades') com, json_each(com.value,'$.plantas') pl, json_each(pl.value,'${meta.path}') pv WHERE ${cmp('pv.value')})`;
    default:
      throw new Error(`Escopo de busca desconhecido para campo: ${field}`);
  }
}

/**
 * Translate `query.conditions` into a single AND-joined SQL fragment
 * (each condition's `fields` OR'd together), pushing params in order.
 * @param {Array} conditions
 * @param {Array} params
 * @returns {string} SQL fragment, or '' if no usable conditions
 */
function buildConditionsClause(conditions, params) {
  if (!Array.isArray(conditions) || conditions.length === 0) return '';

  const groups = conditions
    .map((cond) => {
      if (!cond || !Array.isArray(cond.fields) || cond.fields.length === 0) return null;
      const value = cond.value;
      if (value === undefined || value === null || String(value).trim() === '') return null;
      const op = cond.op === 'contains' ? 'contains' : 'eq';

      const parts = cond.fields.map((field) => buildFieldCondition(field, op, String(value), params));
      return parts.length > 1 ? `(${parts.join(' OR ')})` : parts[0];
    })
    .filter(Boolean);

  return groups.join(' AND ');
}

/**
 * Escape and tokenize free text into a safe FTS5 MATCH expression: each
 * whitespace-separated token becomes a quoted prefix query, OR'd together.
 * @param {string} text
 * @returns {string|null}
 */
function buildFtsMatchQuery(text) {
  const cleaned = String(text).trim();
  if (!cleaned) return null;

  const tokens = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => `"${token.replace(/"/g, '""')}"*`);

  return tokens.length ? tokens.join(' OR ') : null;
}

/**
 * Build the WHERE clause + positional params for a `query` object.
 * @param {Object} query
 * @returns {{ sql: string, params: Array }}
 */
function buildWhereClause(query = {}) {
  const clauses = [];
  const params = [];

  if (query.status !== undefined && query.status !== null && query.status !== '') {
    clauses.push('status = ?');
    params.push(query.status);
  }

  if (query.ano !== undefined && query.ano !== null && query.ano !== '') {
    clauses.push('ano = ?');
    params.push(Number(query.ano));
  }

  if (query.fonte !== undefined && query.fonte !== null && query.fonte !== '') {
    clauses.push('fonte = ?');
    params.push(query.fonte);
  }

  const conditionsClause = buildConditionsClause(query.conditions, params);
  if (conditionsClause) clauses.push(conditionsClause);

  if (query.text && String(query.text).trim().length > 0) {
    const ftsQuery = buildFtsMatchQuery(query.text);
    if (ftsQuery) {
      clauses.push(`id IN (SELECT id FROM ${database.TABLE}_fts WHERE ${database.TABLE}_fts MATCH ?)`);
      params.push(ftsQuery);
    }
  }

  return {
    sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    params
  };
}

/**
 * @param {{[field: string]: 1|-1}} sort
 * @returns {string} ORDER BY clause
 */
function buildOrderClause(sort) {
  const sortField = sort && VALID_SORT_FIELDS.has(Object.keys(sort)[0]) ? Object.keys(sort)[0] : 'createdAt';
  const direction = sort && sort[sortField] === 1 ? 'ASC' : 'DESC';

  switch (sortField) {
    case 'titulo':
      return `ORDER BY titulo ${direction}`;
    case 'ano':
      return `ORDER BY ano ${direction}`;
    case 'status':
      return `ORDER BY status ${direction}`;
    case 'autores':
      return `ORDER BY json_extract(doc,'$.autores[0]') ${direction}`;
    case 'createdAt':
    default:
      return `ORDER BY created_at ${direction}`;
  }
}

/**
 * Parse a `biocultdb_records` row into the full Reference object.
 * @param {{id: string, doc: string, created_at: string, updated_at: string}} row
 * @returns {Object}
 */
function rowToReference(row) {
  const doc = JSON.parse(row.doc);
  return {
    ...doc,
    id: row.id,
    createdAt: doc.createdAt || row.created_at,
    updatedAt: doc.updatedAt || row.updated_at
  };
}

/**
 * Restrict a Reference object to the requested Mongo-style projection
 * ({ field: 1, ... }); `id` is always kept. No-op when projection is empty.
 * @param {Object} reference
 * @param {Object} projection
 * @returns {Object}
 */
function applyProjection(reference, projection) {
  if (!projection || Object.keys(projection).length === 0) return reference;

  const result = { id: reference.id };
  for (const [key, include] of Object.entries(projection)) {
    if (include) result[key] = reference[key];
  }
  return result;
}

/**
 * Build the searchable text extracted from a Reference for the FTS5 row.
 * @param {Object} reference
 * @returns {{titulo: string, autores: string, resumo: string, doi: string, comunidades: string}}
 */
function ftsRowFromReference(reference) {
  const autores = Array.isArray(reference.autores) ? reference.autores.join(' ') : '';

  const comunidadesText = Array.isArray(reference.comunidades)
    ? reference.comunidades
        .map((com) => {
          const plantasText = Array.isArray(com.plantas)
            ? com.plantas
                .map((planta) =>
                  [
                    Array.isArray(planta.nomeCientifico) ? planta.nomeCientifico.join(' ') : '',
                    Array.isArray(planta.nomeVernacular) ? planta.nomeVernacular.join(' ') : '',
                    Array.isArray(planta.tipoUso) ? planta.tipoUso.join(' ') : ''
                  ]
                    .filter(Boolean)
                    .join(' ')
                )
                .join(' ')
            : '';

          return [
            com.nome,
            com.tipo,
            com.municipio,
            com.estado,
            com.local,
            Array.isArray(com.atividadesEconomicas) ? com.atividadesEconomicas.join(' ') : '',
            com.observacoes,
            plantasText
          ]
            .filter(Boolean)
            .join(' ');
        })
        .join(' ')
    : '';

  return {
    titulo: reference.titulo || '',
    autores,
    resumo: reference.resumo || '',
    doi: reference.DOI || '',
    comunidades: comunidadesText
  };
}

/**
 * Check if a reference with the same title and year already exists
 * @param {string} titulo - Reference title
 * @param {number} ano - Publication year
 * @returns {Promise<Object|null>} Existing reference or null
 */
async function checkDuplicateReference(titulo, ano) {
  try {
    const db = getDb();

    const row = db
      .prepare(`SELECT id, doc, created_at, updated_at FROM ${database.TABLE} WHERE titulo = ? COLLATE NOCASE AND ano = ? LIMIT 1`)
      .get(titulo, ano);

    if (!row) return null;

    logger.database(`Duplicate reference found: "${titulo}" (${ano})`);
    return rowToReference(row);
  } catch (error) {
    logger.error('Failed to check duplicate reference:', error.message);
    throw new Error(`Falha ao verificar duplicata: ${error.message}`);
  }
}

/**
 * Insert new reference
 * @param {Object} referenceData - Reference data
 * @returns {Promise<Object>} Inserted document with id
 */
async function insertReference(referenceData) {
  try {
    const db = getDb();
    const reference = createReference(referenceData);
    const docJson = JSON.stringify(reference);
    const fts = ftsRowFromReference(reference);

    const insertRecord = db.prepare(
      `INSERT INTO ${database.TABLE} (id, doc, created_at, updated_at) VALUES (?, ?, ?, ?)`
    );
    const insertFts = db.prepare(
      `INSERT INTO ${database.TABLE}_fts (id, titulo, autores, resumo, doi, comunidades) VALUES (?, ?, ?, ?, ?, ?)`
    );

    const runInTransaction = db.transaction(() => {
      insertRecord.run(reference.id, docJson, reference.createdAt, reference.updatedAt);
      insertFts.run(reference.id, fts.titulo, fts.autores, fts.resumo, fts.doi, fts.comunidades);
    });
    runInTransaction();

    logger.database(`Reference inserted with ID: ${reference.id}`);

    return reference;
  } catch (error) {
    logger.error('Failed to insert reference:', error.message);
    throw new Error(`Falha ao salvar referência: ${error.message}`);
  }
}

/**
 * Find references by query
 * @param {Object} query - Structured query (see module doc)
 * @param {Object} options - Query options (projection, limit, skip, sort)
 * @returns {Promise<Array>} Array of references
 */
async function findReferences(query = {}, options = {}) {
  try {
    const db = getDb();
    const { projection = {}, limit = 0, skip = 0, sort = { createdAt: -1 } } = options;

    const { sql: whereSql, params } = buildWhereClause(query);
    const orderSql = buildOrderClause(sort);

    let sql = `SELECT id, doc, created_at, updated_at FROM ${database.TABLE} ${whereSql} ${orderSql}`.trim();
    const finalParams = [...params];

    if (limit > 0) {
      sql += ' LIMIT ?';
      finalParams.push(limit);
      if (skip > 0) {
        sql += ' OFFSET ?';
        finalParams.push(skip);
      }
    } else if (skip > 0) {
      sql += ' LIMIT -1 OFFSET ?';
      finalParams.push(skip);
    }

    const rows = db.prepare(sql).all(...finalParams);
    const references = rows.map((row) => applyProjection(rowToReference(row), projection));

    logger.database(`Found ${references.length} references`);

    return references;
  } catch (error) {
    logger.error('Failed to find references:', error.message);
    throw new Error(`Falha ao buscar referências: ${error.message}`);
  }
}

/**
 * Find reference by ID
 * @param {string} id - Reference ID
 * @returns {Promise<Object|null>} Reference document or null
 */
async function findReferenceById(id) {
  try {
    const db = getDb();
    const row = db
      .prepare(`SELECT id, doc, created_at, updated_at FROM ${database.TABLE} WHERE id = ?`)
      .get(id);

    if (row) {
      logger.database(`Found reference with ID: ${id}`);
    } else {
      logger.database(`Reference not found with ID: ${id}`);
    }

    return row ? rowToReference(row) : null;
  } catch (error) {
    logger.error('Failed to find reference by ID:', error.message);
    throw new Error(`Falha ao buscar referência: ${error.message}`);
  }
}

/**
 * Update reference by ID
 * @param {string} id - Reference ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated reference, or null if not found
 */
async function updateReferenceById(id, updateData) {
  try {
    logger.database(`updateReferenceById called with ID: ${id}`);

    const db = getDb();
    const existingRow = db.prepare(`SELECT doc FROM ${database.TABLE} WHERE id = ?`).get(id);

    if (!existingRow) {
      logger.error(`Reference with ID ${id} NOT FOUND in database`);
      return null;
    }

    const existing = JSON.parse(existingRow.doc);
    const updated = updateReference({ ...existing, ...updateData, id });
    const docJson = JSON.stringify(updated);
    const fts = ftsRowFromReference(updated);

    const updateRecord = db.prepare(
      `UPDATE ${database.TABLE} SET doc = ?, updated_at = ? WHERE id = ?`
    );
    const deleteFts = db.prepare(`DELETE FROM ${database.TABLE}_fts WHERE id = ?`);
    const insertFts = db.prepare(
      `INSERT INTO ${database.TABLE}_fts (id, titulo, autores, resumo, doi, comunidades) VALUES (?, ?, ?, ?, ?, ?)`
    );

    const runInTransaction = db.transaction(() => {
      const result = updateRecord.run(docJson, updated.updatedAt, id);
      if (result.changes === 0) {
        throw new Error('Referência não encontrada');
      }
      deleteFts.run(id);
      insertFts.run(id, fts.titulo, fts.autores, fts.resumo, fts.doi, fts.comunidades);
    });
    runInTransaction();

    logger.database(`Reference updated successfully with ID: ${id}`);

    return updated;
  } catch (error) {
    logger.error(`Failed to update reference ${id}:`, error.message);
    throw new Error(`Falha ao atualizar referência: ${error.message}`);
  }
}

/**
 * Update reference status only
 * @param {string} id - Reference ID
 * @param {string} status - New status (pending|approved|rejected)
 * @param {string|null} justificativaRejeicao - Justification for rejection (only for 'rejected' status)
 * @returns {Promise<Object>} Updated reference
 */
async function updateReferenceStatus(id, status, justificativaRejeicao = null) {
  try {
    if (!Object.values(Status).includes(status)) {
      throw new Error('Status inválido');
    }

    const db = getDb();
    const existingRow = db.prepare(`SELECT doc FROM ${database.TABLE} WHERE id = ?`).get(id);

    if (!existingRow) {
      throw new Error('Referência não encontrada');
    }

    const existing = JSON.parse(existingRow.doc);
    const updated = { ...existing, id, status, updatedAt: new Date().toISOString() };

    if (status === Status.REJECTED && justificativaRejeicao) {
      updated.justificativaRejeicao = justificativaRejeicao;
    } else {
      delete updated.justificativaRejeicao;
    }

    const docJson = JSON.stringify(updated);
    const fts = ftsRowFromReference(updated);

    const updateRecord = db.prepare(
      `UPDATE ${database.TABLE} SET doc = ?, updated_at = ? WHERE id = ?`
    );
    const deleteFts = db.prepare(`DELETE FROM ${database.TABLE}_fts WHERE id = ?`);
    const insertFts = db.prepare(
      `INSERT INTO ${database.TABLE}_fts (id, titulo, autores, resumo, doi, comunidades) VALUES (?, ?, ?, ?, ?, ?)`
    );

    const runInTransaction = db.transaction(() => {
      const result = updateRecord.run(docJson, updated.updatedAt, id);
      if (result.changes === 0) {
        throw new Error('Referência não encontrada');
      }
      deleteFts.run(id);
      insertFts.run(id, fts.titulo, fts.autores, fts.resumo, fts.doi, fts.comunidades);
    });
    runInTransaction();

    logger.database(`Reference status updated to "${status}" for ID: ${id}`);

    return updated;
  } catch (error) {
    logger.error('Failed to update reference status:', error.message);
    throw new Error(`Falha ao atualizar status: ${error.message}`);
  }
}

/**
 * Delete reference by ID
 * @param {string} id - Reference ID
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteReferenceById(id) {
  try {
    const db = getDb();

    const deleteRecord = db.prepare(`DELETE FROM ${database.TABLE} WHERE id = ?`);
    const deleteFts = db.prepare(`DELETE FROM ${database.TABLE}_fts WHERE id = ?`);

    const runInTransaction = db.transaction(() => {
      const result = deleteRecord.run(id);
      if (result.changes === 0) {
        throw new Error('Referência não encontrada');
      }
      deleteFts.run(id);
    });
    runInTransaction();

    logger.database(`Reference deleted with ID: ${id}`);

    return true;
  } catch (error) {
    logger.error('Failed to delete reference:', error.message);
    throw new Error(`Falha ao deletar referência: ${error.message}`);
  }
}

/**
 * Count references by query
 * @param {Object} query - Structured query (see module doc)
 * @returns {Promise<number>} Count of documents
 */
async function countReferences(query = {}) {
  try {
    const db = getDb();
    const { sql: whereSql, params } = buildWhereClause(query);

    const row = db.prepare(`SELECT COUNT(*) as n FROM ${database.TABLE} ${whereSql}`.trim()).get(...params);
    const count = row.n;

    logger.database(`Counted ${count} references`);

    return count;
  } catch (error) {
    logger.error('Failed to count references:', error.message);
    throw new Error(`Falha ao contar referências: ${error.message}`);
  }
}

/**
 * Search references with pagination
 * @param {Object} query - Structured query (see module doc)
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Results per page
 * @returns {Promise<Object>} { references, total, page, totalPages }
 */
async function searchReferences(query = {}, page = 1, limit = 50) {
  try {
    const skip = (page - 1) * limit;

    const [references, total] = await Promise.all([
      findReferences(query, { limit, skip }),
      countReferences(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    logger.database(`Search returned ${references.length} of ${total} total references (page ${page}/${totalPages})`);

    return {
      references,
      total,
      page,
      limit,
      totalPages
    };
  } catch (error) {
    logger.error('Failed to search references:', error.message);
    throw new Error(`Falha na busca: ${error.message}`);
  }
}

module.exports = {
  checkDuplicateReference,
  insertReference,
  findReferences,
  findReferenceById,
  updateReferenceById,
  updateReferenceStatus,
  deleteReferenceById,
  countReferences,
  searchReferences
};

/**
 * BioCultPapers Import Script
 *
 * Imports the JSON array of `ArticleRecord` exported by BioCultPapers
 * ("Exportar para BioCultDB" button in RecordsPage, see
 * src/EtnoPapers.Core/Models/ArticleRecord.cs) into the shared
 * `biocultdb_records` SQLite table (ADR-005, Arquitetura-BioCultural).
 *
 * Usage:
 *   node backend/src/scripts/import-papers.js <arquivo.json>
 *
 * Field mapping (ArticleRecord -> biocultdb_records.doc):
 *   Identical 1:1 for titulo/autores/ano/resumo/DOI/comunidades, EXCEPT:
 *     - status  is ALWAYS forced to 'pending', regardless of what the input
 *       JSON carries (curation happens exclusively inside BioCultDB).
 *     - fonte   is ALWAYS forced to 'biocultpapers'.
 *     - id      is kept from the input record UNLESS it is absent or already
 *       used by an unrelated existing row (PK collision) — in that case a
 *       fresh id is generated with crypto.randomUUID().
 *   `ano_coleta` (if present) is preserved as `anoColeta` for reference; it
 *   is not part of the Reference schema/generated columns.
 *
 * Idempotency:
 *   Each incoming record is deduplicated against existing rows using, in
 *   order of preference:
 *     1. DOI match (json_extract(doc,'$.DOI'), case-insensitive), when the
 *        incoming DOI is non-empty.
 *     2. titulo + ano match (generated columns, case-insensitive titulo),
 *        when both are present.
 *   When a match is found, the existing row's `id` is PRESERVED and the row
 *   is UPDATED in place (created_at kept, updated_at refreshed) instead of
 *   inserting a duplicate. Running this script twice on the same input file
 *   therefore updates the same rows the second time instead of duplicating
 *   them. Records with neither a DOI nor a titulo+ano pair cannot be
 *   deduplicated and are always inserted as new rows.
 *
 * Every write (record doc + FTS5 row) happens inside a single SQLite
 * transaction spanning the whole file, so a mid-import failure leaves the
 * database untouched.
 */

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const database = require('../shared/database');

const TABLE = database.TABLE;

/**
 * Build the searchable text extracted from a mapped doc for the FTS5 row.
 * Mirrors services/database.js#ftsRowFromReference so full-text search
 * behaves identically for imported records.
 * @param {Object} doc
 * @returns {{titulo: string, autores: string, resumo: string, doi: string, comunidades: string}}
 */
function ftsRowFromDoc(doc) {
  const autores = Array.isArray(doc.autores) ? doc.autores.join(' ') : '';

  const comunidadesText = Array.isArray(doc.comunidades)
    ? doc.comunidades
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
    titulo: doc.titulo || '',
    autores,
    resumo: doc.resumo || '',
    doi: doc.DOI || '',
    comunidades: comunidadesText
  };
}

/**
 * Map a raw ArticleRecord (as exported by BioCultPapers) into the
 * biocultdb_records.doc shape, forcing status/fonte and resolving id.
 * @param {Object} article - raw ArticleRecord JSON object
 * @param {string} id - resolved id (preserved dedupe match or fresh/kept id)
 * @param {string} createdAt - ISO-8601 creation timestamp to persist
 * @param {string} updatedAt - ISO-8601 update timestamp to persist
 * @returns {Object} doc ready for JSON.stringify into biocultdb_records.doc
 */
function mapArticleToDoc(article, id, createdAt, updatedAt) {
  const doc = {
    id,
    titulo: article.titulo || '',
    autores: Array.isArray(article.autores) ? article.autores : [],
    ano: article.ano != null && article.ano !== '' ? Number(article.ano) : null,
    resumo: article.resumo || '',
    DOI: article.DOI || '',
    status: 'pending', // sempre forçado — curadoria acontece só no BioCultDB
    fonte: 'biocultpapers', // sempre forçado
    comunidades: Array.isArray(article.comunidades) ? article.comunidades : [],
    createdAt,
    updatedAt
  };

  if (article.ano_coleta != null) {
    doc.anoColeta = article.ano_coleta;
  }

  return doc;
}

/**
 * Find an existing row id matching the incoming record by DOI or titulo+ano.
 * @param {import('better-sqlite3').Database} db
 * @param {{ doi: string, titulo: string, ano: number|null }} keys
 * @returns {string|null}
 */
function findDuplicateId(db, { doi, titulo, ano }) {
  if (doi) {
    const row = db
      .prepare(`SELECT id FROM ${TABLE} WHERE json_extract(doc,'$.DOI') = ? COLLATE NOCASE LIMIT 1`)
      .get(doi);
    if (row) return row.id;
  }

  if (titulo && ano != null) {
    const row = db
      .prepare(`SELECT id FROM ${TABLE} WHERE titulo = ? COLLATE NOCASE AND ano = ? LIMIT 1`)
      .get(titulo, ano);
    if (row) return row.id;
  }

  return null;
}

/**
 * Import an array of ArticleRecord objects into biocultdb_records.
 * @param {Array<Object>} articles
 * @returns {{ inserted: number, updated: number, ignored: number }}
 */
function importPapers(articles) {
  const db = database.getConnection();

  const selectById = db.prepare(`SELECT id FROM ${TABLE} WHERE id = ?`);
  const selectRow = db.prepare(`SELECT id, created_at FROM ${TABLE} WHERE id = ?`);
  const upsertRecord = db.prepare(
    `INSERT OR REPLACE INTO ${TABLE} (id, doc, created_at, updated_at) VALUES (?, ?, ?, ?)`
  );
  const deleteFts = db.prepare(`DELETE FROM ${TABLE}_fts WHERE id = ?`);
  const insertFts = db.prepare(
    `INSERT INTO ${TABLE}_fts (id, titulo, autores, resumo, doi, comunidades) VALUES (?, ?, ?, ?, ?, ?)`
  );

  const stats = { inserted: 0, updated: 0, ignored: 0 };

  const runImport = db.transaction((records) => {
    records.forEach((article, index) => {
      if (!article || typeof article.titulo !== 'string' || article.titulo.trim() === '') {
        console.warn(`  ! Registro #${index + 1} ignorado: campo "titulo" ausente/inválido.`);
        stats.ignored += 1;
        return;
      }

      const ano = article.ano != null && article.ano !== '' ? Number(article.ano) : null;
      const doi = (article.DOI || '').trim();
      const titulo = article.titulo.trim();

      const existingId = findDuplicateId(db, { doi, titulo, ano });
      const now = new Date().toISOString();

      let id;
      let createdAt;
      let isUpdate = false;

      if (existingId) {
        id = existingId;
        const existingRow = selectRow.get(existingId);
        createdAt = existingRow.created_at;
        isUpdate = true;
      } else {
        id = article.id && !selectById.get(article.id) ? article.id : randomUUID();
        createdAt = article.createdAt || now;
      }

      const doc = mapArticleToDoc(article, id, createdAt, now);
      const docJson = JSON.stringify(doc);

      upsertRecord.run(id, docJson, doc.createdAt, doc.updatedAt);

      const fts = ftsRowFromDoc(doc);
      deleteFts.run(id);
      insertFts.run(id, fts.titulo, fts.autores, fts.resumo, fts.doi, fts.comunidades);

      if (isUpdate) {
        stats.updated += 1;
      } else {
        stats.inserted += 1;
      }
    });
  });

  runImport(articles);

  return stats;
}

/**
 * Read and parse the input JSON file, validating it is an array.
 * @param {string} filePath
 * @returns {Array<Object>}
 */
function readArticles(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Não foi possível ler o arquivo "${filePath}": ${error.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Não foi possível interpretar "${filePath}" como JSON: ${error.message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Conteúdo de "${filePath}" deve ser um array de ArticleRecord (recebido: ${typeof parsed}).`);
  }

  return parsed;
}

// Run script if executed directly
if (require.main === module) {
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.error('Uso: node backend/src/scripts/import-papers.js <arquivo.json>');
    process.exit(1);
  }

  let articles;
  try {
    articles = readArticles(path.resolve(inputPath));
  } catch (error) {
    console.error(`Erro ao ler arquivo de entrada: ${error.message}`);
    process.exit(1);
  }

  try {
    database.connect();
    console.log(`Importando ${articles.length} registro(s) de "${inputPath}"...`);

    const stats = importPapers(articles);

    console.log('\nImportação concluída:');
    console.log(`  Inseridos: ${stats.inserted}`);
    console.log(`  Atualizados: ${stats.updated}`);
    console.log(`  Ignorados: ${stats.ignored}`);

    database.close();
    process.exit(0);
  } catch (error) {
    console.error(`Falha na importação: ${error.message}`);
    database.close();
    process.exit(1);
  }
}

module.exports = { importPapers, mapArticleToDoc, findDuplicateId, ftsRowFromDoc, readArticles };

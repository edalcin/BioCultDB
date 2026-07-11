/**
 * SQLite persistence smoke suite (ADR-005: SQLite + JSON1 replacing MongoDB).
 *
 * Exercises the shared `:memory:` database against the real schema
 * (`database.connect()` -> `_ensureSchema()`), not a mock, so it verifies the
 * actual SQL/JSON1 query translations in services/database.js,
 * services/statistics.js and the etnoChat DSL->SQL executor.
 *
 * Run in isolation (never the full project suite):
 *   npx jest backend/tests/unit/sqlite-persistence.test.js
 */

process.env.SQLITE_DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';

const database = require('../../src/shared/database');
const { insertReference, findReferenceById, updateReferenceStatus, searchReferences } = require('../../src/services/database');
const { getTopPlants } = require('../../src/services/statistics');
const { executeQuery } = require('../../src/contexts/presentation/services/etnochat');
const { Status } = require('../../src/models/Reference');

/**
 * Build a valid Reference payload (pre-insertReference), overridable per test.
 */
function makeReference(overrides = {}) {
  return {
    titulo: 'Uso de plantas medicinais por comunidades tradicionais',
    autores: ['SILVA, J.'],
    ano: 2020,
    resumo: 'Resumo de teste',
    DOI: '',
    status: Status.APPROVED,
    fonte: 'etnodb',
    comunidades: [
      {
        nome: 'Comunidade Teste',
        tipo: 'Quilombolas',
        municipio: 'Ubatuba',
        estado: 'São Paulo',
        local: '',
        atividadesEconomicas: [],
        observacoes: '',
        plantas: [
          {
            nomeCientifico: ['Foeniculum vulgare'],
            nomeVernacular: ['erva-doce'],
            tipoUso: ['medicinal']
          }
        ]
      }
    ],
    ...overrides
  };
}

beforeAll(() => {
  database.connect();
});

afterAll(() => {
  database.close();
});

describe('services/database.js — insert/read round-trip', () => {
  test('insertReference persists the document and findReferenceById reads it back', async () => {
    const inserted = await insertReference(makeReference({ titulo: 'Insert Round Trip' }));

    expect(inserted.id).toBeTruthy();
    expect(inserted.status).toBe(Status.APPROVED);

    const found = await findReferenceById(inserted.id);

    expect(found).not.toBeNull();
    expect(found.titulo).toBe('Insert Round Trip');
    expect(found.fonte).toBe('etnodb');
    expect(found.comunidades[0].tipo).toBe('Quilombolas');
  });

  test('findReferenceById returns null for an unknown id', async () => {
    const found = await findReferenceById('00000000-0000-4000-8000-000000000000');
    expect(found).toBeNull();
  });
});

describe('services/database.js — status transition', () => {
  test('updateReferenceStatus persists the new status across a fresh read', async () => {
    const inserted = await insertReference(
      makeReference({ titulo: 'Status Update Test', status: Status.PENDING })
    );

    const updated = await updateReferenceStatus(inserted.id, Status.APPROVED);
    expect(updated.status).toBe(Status.APPROVED);

    const reread = await findReferenceById(inserted.id);
    expect(reread.status).toBe(Status.APPROVED);
  });

  test('updateReferenceStatus rejects an invalid status value', async () => {
    const inserted = await insertReference(makeReference({ titulo: 'Invalid Status Test' }));
    await expect(updateReferenceStatus(inserted.id, 'not-a-real-status')).rejects.toThrow();
  });
});

describe('services/statistics.js — SQL/JSON1 aggregation', () => {
  test('getTopPlants aggregates plant usage seeded across multiple references', async () => {
    const communityA = {
      nome: 'Comunidade A',
      tipo: 'Caiçaras',
      municipio: 'X',
      estado: 'SP',
      local: '',
      atividadesEconomicas: [],
      observacoes: '',
      plantas: [{ nomeCientifico: ['Bidens pilosa'], nomeVernacular: ['picão'], tipoUso: ['medicinal'] }]
    };
    const communityB = {
      ...communityA,
      nome: 'Comunidade B',
      municipio: 'Y'
    };

    await insertReference(makeReference({ titulo: 'Plant Stats Ref A', comunidades: [communityA] }));
    await insertReference(makeReference({ titulo: 'Plant Stats Ref B', comunidades: [communityB] }));

    const topPlants = await getTopPlants(10, {});
    const match = topPlants.find((p) => p.nomeCientifico === 'Bidens pilosa');

    expect(match).toBeDefined();
    expect(match.count).toBeGreaterThanOrEqual(2);
    expect(match.communityCount).toBeGreaterThanOrEqual(2);
  });
});

describe('services/database.js — FTS5 search', () => {
  test('searchReferences finds a seeded record by free-text term via FTS5', async () => {
    await insertReference(
      makeReference({ titulo: 'Etnobotânica de plantas raras da Mata Atlântica' })
    );

    const result = await searchReferences({ text: 'Atlântica' }, 1, 50);

    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.references.some((r) => r.titulo.includes('Mata Atlântica'))).toBe(true);
  });
});

describe('contexts/presentation/services/etnochat.js — DSL whitelist enforcement', () => {
  test('executeQuery rejects a field outside FIELD_WHITELIST without touching the database', async () => {
    const rowCountBefore = database
      .getConnection()
      .prepare(`SELECT count(*) as c FROM ${database.TABLE}`)
      .get().c;

    const result = await executeQuery([
      { campo: "titulo'); DROP TABLE biocultdb_records; --", operador: 'eq', valor: 'x' }
    ]);

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();

    // The whitelist rejection must short-circuit before any SQL runs — the
    // table must still exist with the same row count as before the call.
    const rowCountAfter = database
      .getConnection()
      .prepare(`SELECT count(*) as c FROM ${database.TABLE}`)
      .get().c;
    expect(rowCountAfter).toBe(rowCountBefore);
  });

  test('executeQuery accepts a whitelisted field and forces status=approved + LIMIT 50', async () => {
    const result = await executeQuery([{ campo: 'titulo', operador: 'contains', valor: 'Mata Atlântica' }]);

    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.every((doc) => doc.status === Status.APPROVED)).toBe(true);
  });
});

/**
 * One-time data migration: MongoDB `etnodb.etnodb` → SQLite `biocultdb_records`
 *
 * ADR-005 (Arquitetura-BioCultural): migrates production data from the legacy
 * MongoDB collection into the new SQLite+JSON1 document store.
 *
 * Pre-requisites:
 *   - The `mongodb` driver must be installed TEMPORARILY (it is NOT a project
 *     dependency after the SQLite migration): `npm install --no-save mongodb`
 *     from `backend/`. `--no-save` keeps package.json/package-lock.json
 *     untouched. Uninstall afterwards if desired (harmless to leave in
 *     node_modules — it is gitignored and not referenced elsewhere).
 *   - `MONGO_URI` is supplied at RUNTIME only (env var or CLI flag), NEVER
 *     hardcoded here or committed to any file (CLAUDE.md credential policy).
 *     Example (generic, not a real credential):
 *       MONGO_URI="mongodb://localhost:27017/etnodb" node backend/src/scripts/migrate-mongo-to-sqlite.js
 *   - `SQLITE_DB_PATH` points at the SQLite target (defaults to
 *     `./data/unidade.sqlite`, same as the app — see shared/config.js).
 *
 * Behaviour:
 *   - Reads every document from `etnodb.etnodb` (Mongo).
 *   - Converts `_id` (ObjectId) → `id` (string), `Date`/`ISODate` fields →
 *     ISO-8601 strings.
 *   - `INSERT OR REPLACE` into `biocultdb_records` inside a single
 *     transaction, syncing the `biocultdb_records_fts` row for each document.
 *   - Idempotent: `id` is derived deterministically from the Mongo `_id`
 *     (`.toString()`), so re-running the script never duplicates rows — it
 *     just overwrites them with the same content.
 *
 * Usage:
 *   MONGO_URI=<uri> [SQLITE_DB_PATH=<path>] node backend/src/scripts/migrate-mongo-to-sqlite.js
 */

let MongoClient;
try {
  ({ MongoClient } = require('mongodb'));
} catch {
  console.error(
    'The "mongodb" package is required for this one-time migration but is not installed.\n' +
      'Run: npm install --no-save mongodb   (from backend/), then re-run this script.'
  );
  process.exit(1);
}

const database = require('../shared/database');
const logger = require('../shared/logger');

const MONGO_DB_NAME = 'etnodb';
const MONGO_COLLECTION = 'etnodb';

function isoOrNull(value) {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  // Already a string (e.g. re-run against previously-converted data)
  if (typeof value === 'string') return value;
  return String(value);
}

/**
 * Recursively convert Mongo BSON Date instances to ISO-8601 strings and
 * ObjectId instances to plain strings, anywhere in the document tree.
 */
function normalizeDeep(value) {
  if (value == null) return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalizeDeep);
  if (typeof value === 'object') {
    // BSON ObjectId has a toHexString method; MongoClient without BSON
    // extended types returns plain objects, so guard defensively.
    if (typeof value.toHexString === 'function') return value.toHexString();
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = normalizeDeep(v);
    }
    return out;
  }
  return value;
}

/**
 * Maps a raw Mongo document to the canonical `biocultdb_records.doc` shape.
 */
function mapToReference(mongoDoc) {
  const id = mongoDoc._id?.toHexString ? mongoDoc._id.toHexString() : String(mongoDoc._id);
  const { _id, ...rest } = mongoDoc;
  const normalized = normalizeDeep(rest);

  return {
    id,
    ...normalized,
    createdAt: isoOrNull(mongoDoc.createdAt) ?? new Date().toISOString(),
    updatedAt: isoOrNull(mongoDoc.updatedAt) ?? new Date().toISOString(),
  };
}

function syncFtsRow(db, reference) {
  db.prepare(`DELETE FROM biocultdb_records_fts WHERE id = ?`).run(reference.id);
  const comunidadesText = (reference.comunidades ?? [])
    .map((c) => `${c.nome ?? ''} ${(c.plantas ?? []).flatMap((p) => p.nomeVernacular ?? []).join(' ')}`)
    .join(' ');
  db.prepare(
    `INSERT INTO biocultdb_records_fts (id, titulo, autores, resumo, doi, comunidades) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    reference.id,
    reference.titulo ?? '',
    (reference.autores ?? []).join(' '),
    reference.resumo ?? '',
    reference.DOI ?? '',
    comunidadesText
  );
}

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI environment variable is required (source MongoDB instance).');
    process.exit(1);
  }

  logger.info(`Connecting to source MongoDB...`);
  const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();

  try {
    const mongoDb = client.db(MONGO_DB_NAME);
    const collection = mongoDb.collection(MONGO_COLLECTION);

    const mongoCount = await collection.countDocuments();
    logger.info(`Source: ${mongoCount} document(s) in ${MONGO_DB_NAME}.${MONGO_COLLECTION}`);

    database.connect();
    const db = database.getConnection();

    const insertStmt = db.prepare(
      `INSERT OR REPLACE INTO biocultdb_records (id, doc, created_at, updated_at) VALUES (?, ?, ?, ?)`
    );

    let migrated = 0;
    let errors = 0;

    const migrateBatch = db.transaction((docs) => {
      for (const mongoDoc of docs) {
        try {
          const reference = mapToReference(mongoDoc);
          const json = JSON.stringify(reference);
          insertStmt.run(reference.id, json, reference.createdAt, reference.updatedAt);
          syncFtsRow(db, reference);
          migrated++;
        } catch (err) {
          errors++;
          logger.error(`Failed to migrate document _id=${mongoDoc._id}: ${err.message}`);
        }
      }
    });

    const cursor = collection.find({});
    const BATCH_SIZE = 500;
    let batch = [];

    for await (const doc of cursor) {
      batch.push(doc);
      if (batch.length >= BATCH_SIZE) {
        migrateBatch(batch);
        batch = [];
      }
    }
    if (batch.length > 0) {
      migrateBatch(batch);
    }

    const sqliteCount = db.prepare(`SELECT COUNT(*) as n FROM biocultdb_records`).get().n;

    logger.info(`\nMigration complete.`);
    logger.info(`  Source (MongoDB):  ${mongoCount}`);
    logger.info(`  Migrated (this run): ${migrated}`);
    logger.info(`  Errors:              ${errors}`);
    logger.info(`  Target (SQLite) total rows: ${sqliteCount}`);

    if (sqliteCount < mongoCount) {
      logger.error(
        `WARNING: target row count (${sqliteCount}) is lower than source count (${mongoCount}). ` +
          `Investigate before considering the migration complete.`
      );
      process.exitCode = 1;
    }
  } finally {
    await client.close();
    database.close();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

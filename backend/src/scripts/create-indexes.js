/**
 * SQLite Schema/Index Bootstrap Script
 *
 * `database.connect()` already ensures the `biocultdb_records` table, its
 * generated-column indexes and the FTS5 virtual table exist (idempotent,
 * called on every server boot — see backend/src/shared/database.js
 * `_ensureSchema()`). This script remains for manual operation:
 *
 *   node backend/src/scripts/create-indexes.js         # ensure schema (no-op if already present)
 *   node backend/src/scripts/create-indexes.js --drop  # drop indexes/FTS table and recreate them
 *
 * Usage: node backend/src/scripts/create-indexes.js [--drop]
 */

const database = require('../shared/database');
const logger = require('../shared/logger');

const TABLE = database.TABLE;

const GENERATED_COLUMNS = ['status', 'ano', 'fonte', 'titulo', 'created_at_idx'];
const INDEXES = [
  `idx_${TABLE}_status`,
  `idx_${TABLE}_ano`,
  `idx_${TABLE}_fonte`,
  `idx_${TABLE}_status_ano`,
  `idx_${TABLE}_created_at`
];

/**
 * Ensure the schema exists (idempotent). Delegates entirely to
 * database.connect(), which already ran `_ensureSchema()` internally.
 */
function createIndexes() {
  logger.info('Ensuring SQLite schema (table, generated columns, indexes, FTS5)...');

  database.connect();
  const db = database.getConnection();

  const existingIndexes = db
    .prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name=?")
    .all(TABLE)
    .map((row) => row.name);

  logger.info(`\nTotal indexes on table "${TABLE}": ${existingIndexes.length}`);
  existingIndexes.forEach((name) => logger.info(`  - ${name}`));

  const ftsExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(`${TABLE}_fts`);
  logger.info(`FTS5 table "${TABLE}_fts": ${ftsExists ? 'present' : 'MISSING'}`);

  logger.info('\n✓ Schema ensured');
}

/**
 * Drop the generated-column indexes and the FTS5 table, then recreate them
 * by re-running connect()'s idempotent schema logic. The generated columns
 * themselves are not dropped (SQLite has no DROP COLUMN for VIRTUAL columns
 * pre-3.35 semantics used here safely, and the columns are harmless/reused
 * by _ensureSchema on reconnect) — only the indexes and FTS table, which is
 * what the historical Mongo `dropIndexes()` equivalent covered.
 */
function dropIndexes() {
  logger.info('Dropping indexes and FTS table...');

  database.connect();
  const db = database.getConnection();

  for (const name of INDEXES) {
    db.exec(`DROP INDEX IF EXISTS ${name};`);
    logger.info(`  - dropped index ${name}`);
  }

  db.exec(`DROP TABLE IF EXISTS ${TABLE}_fts;`);
  logger.info(`  - dropped table ${TABLE}_fts`);

  logger.info('Recreating indexes and FTS table...');
  // _ensureSchema is idempotent and re-creates everything it owns, including
  // the indexes and FTS table just dropped. Generated columns are left as-is
  // (still declared on the table) — GENERATED_COLUMNS listed above for reference.
  database._ensureSchema();

  logger.info('✓ Indexes and FTS table dropped and recreated');
}

// Run script if executed directly
if (require.main === module) {
  const dropFlag = process.argv.includes('--drop') || process.argv[2] === 'drop';

  try {
    if (dropFlag) {
      dropIndexes();
    } else {
      createIndexes();
    }
    database.close();
    process.exit(0);
  } catch (error) {
    logger.error('Schema bootstrap failed:', error.message);
    database.close();
    process.exit(1);
  }
}

module.exports = { createIndexes, dropIndexes, GENERATED_COLUMNS, INDEXES };

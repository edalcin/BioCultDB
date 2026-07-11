/**
 * SQLite Connection Module (JSON1 document store)
 *
 * Opens the shared unit SQLite file (SQLITE_DB_PATH), applies WAL/foreign_keys/
 * busy_timeout PRAGMAs, and idempotently ensures the `biocultdb_records` table,
 * its generated-column indexes, and the `biocultdb_fts` FTS5 virtual table.
 *
 * ADR-005 (Arquitetura-BioCultural): each federated unit shares ONE SQLite file
 * across its tools (distinct tables). BioCultTermos opens the same file and only
 * reads `biocultdb_records` (never re-creates it).
 */

const path = require('path');
const fs = require('fs');
const SqliteDb = require('better-sqlite3');
const config = require('./config');
const logger = require('./logger');

const TABLE = 'biocultdb_records';

class Database {
  constructor() {
    this.db = null;
    this.isConnected = false;
  }

  /**
   * Open the SQLite file and ensure schema.
   * @returns {import('better-sqlite3').Database}
   */
  connect() {
    if (this.isConnected && this.db) {
      logger.database('Already connected to SQLite');
      return this.db;
    }

    try {
      logger.database(`Opening SQLite database at ${config.sqlitePath}`);

      fs.mkdirSync(path.dirname(config.sqlitePath), { recursive: true });

      this.db = new SqliteDb(config.sqlitePath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      this.db.pragma('busy_timeout = 5000');

      this._ensureSchema();

      this.isConnected = true;
      logger.database('Successfully connected to SQLite');
      return this.db;
    } catch (error) {
      logger.error('SQLite connection failed:', error.message);
      throw new Error(`Failed to connect to SQLite: ${error.message}`);
    }
  }

  /**
   * Idempotently create the records table, generated-column indexes and FTS5 table.
   * Safe to call on every boot.
   */
  _ensureSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        id         TEXT PRIMARY KEY,
        doc        TEXT NOT NULL CHECK (json_valid(doc)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    this._ensureGeneratedColumn('status', "json_extract(doc,'$.status')");
    this._ensureGeneratedColumn('ano', "CAST(json_extract(doc,'$.ano') AS INTEGER)");
    this._ensureGeneratedColumn('fonte', "json_extract(doc,'$.fonte')");
    this._ensureGeneratedColumn('titulo', "json_extract(doc,'$.titulo')");
    this._ensureGeneratedColumn('created_at_idx', 'created_at');

    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_${TABLE}_status ON ${TABLE}(status);`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_${TABLE}_ano ON ${TABLE}(ano);`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_${TABLE}_fonte ON ${TABLE}(fonte);`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_${TABLE}_status_ano ON ${TABLE}(status, ano);`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_${TABLE}_created_at ON ${TABLE}(created_at_idx);`);

    this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS ${TABLE}_fts USING fts5(
        id UNINDEXED,
        titulo,
        autores,
        resumo,
        doi,
        comunidades,
        tokenize='unicode61 remove_diacritics 2'
      );
    `);
  }

  _ensureGeneratedColumn(name, expression) {
    const columns = this.db.prepare(`PRAGMA table_info(${TABLE})`).all();
    if (!columns.some((c) => c.name === name)) {
      this.db.exec(`ALTER TABLE ${TABLE} ADD COLUMN ${name} GENERATED ALWAYS AS (${expression}) VIRTUAL;`);
    }
  }

  /**
   * Get the raw better-sqlite3 connection. Call connect() first.
   * @returns {import('better-sqlite3').Database}
   */
  getConnection() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Close the SQLite connection.
   */
  close() {
    if (this.db && this.isConnected) {
      logger.database('Closing SQLite connection');
      this.db.close();
      this.isConnected = false;
      this.db = null;
      logger.database('SQLite connection closed');
    }
  }
}

// Export singleton instance
module.exports = new Database();
module.exports.TABLE = TABLE;

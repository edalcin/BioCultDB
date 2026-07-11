/**
 * Configuration Loader
 *
 * Loads and validates environment variables from .env file
 */

require('dotenv').config();

const config = {
  // SQLite Configuration (ADR-005: one file per federated unit, shared by its tools)
  sqlitePath: process.env.SQLITE_DB_PATH || './data/unidade.sqlite',

  // Application Ports
  ports: {
    acquisition: parseInt(process.env.PORT_ACQUISITION) || 3001,
    curation: parseInt(process.env.PORT_CURATION) || 3002,
    presentation: parseInt(process.env.PORT_PRESENTATION) || 3003,
  },

  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validate required configuration
const requiredConfig = [
  'sqlitePath',
];

requiredConfig.forEach(key => {
  if (!config[key]) {
    throw new Error(`Missing required configuration: ${key}`);
  }
});

module.exports = config;

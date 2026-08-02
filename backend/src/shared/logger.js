/**
 * Logger Utility
 *
 * Provides debug logging for different application contexts
 * Usage: DEBUG=etnodb:* npm run dev
 */

const debug = require('debug');

const loggers = {
  // Context-specific loggers
  acquisition: debug('etnodb:acquisition'),
  curation: debug('etnodb:curation'),
  presentation: debug('etnodb:presentation'),

  // Infrastructure loggers
  database: debug('etnodb:database'),
  server: debug('etnodb:server'),
  validation: debug('etnodb:validation'),

  // Generic logger
  info: debug('etnodb:info'),
  error: debug('etnodb:error'),
};

// Always enable error logging
loggers.error.enabled = true;

/**
 * Strip API-key-shaped fragments from a string before it reaches a log line
 * or an error message shown to the user — including a provider's own
 * *partially masked* echo of the key (e.g. OpenAI's "sk-defin****-xyz" in
 * its 401 body), which is not a raw substring of the key we sent and so a
 * plain string-replace of the original key would miss it (ADR-002 D5:
 * "a chave nunca aparece em log algum, nem truncada").
 * @param {string} text
 * @returns {string}
 */
function redactApiKey(text) {
  return String(text).replace(/\b(sk-|sk-ant-|sk-or-|AIza)[A-Za-z0-9_\-*]{4,}\b/g, '[REDACTED]');
}

module.exports = { ...loggers, redactApiKey };

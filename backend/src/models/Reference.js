/**
 * Reference Data Model
 *
 * Schema definition for scientific reference documents stored as JSON in the
 * `biocultdb_records.doc` column (ADR-005, SQLite+JSON1 persistence).
 * Based on data-model.md specification.
 */

const { randomUUID } = require('crypto');

/**
 * Reference Schema
 * Represents a scientific publication documenting ethnobotanical knowledge.
 * Canonical shape of the JSON document stored in `biocultdb_records.doc`.
 */
const ReferenceSchema = {
  id: String,                       // UUID v4, generated at creation (crypto.randomUUID())
  titulo: String,                   // Publication title (required)
  autores: [String],                // List of author names (required, min: 1)
  ano: Number,                      // Publication year (required, 4-digit integer)
  resumo: String,                   // Abstract/summary (optional)
  DOI: String,                      // Digital Object Identifier (optional)
  status: String,                   // Workflow status (required: pending|approved|rejected)
  fonte: String,                    // Origin of the record (e.g. 'etnodb'|'biocultpapers')
  comunidades: [                    // Nested array of communities (required, min: 1)
    {
      nome: String,                 // Community name (required)
      tipo: String,                 // Community type (traditional-community taxonomy, required)
      municipio: String,            // Municipality (required)
      estado: String,               // State/province (required)
      local: String,                // Detailed location (optional)
      atividadesEconomicas: [String], // Economic activities (optional)
      observacoes: String,          // Additional notes (optional)
      plantas: [                    // Nested array of plants (required, min: 1)
        {
          nomeCientifico: [String], // Scientific names (required, min: 1)
          nomeVernacular: [String], // Vernacular names (required, min: 1)
          tipoUso: [String]         // Types of use (required, min: 1)
        }
      ]
    }
  ],
  createdAt: String,                // Creation timestamp, ISO-8601 (auto-generated)
  updatedAt: String                 // Last update timestamp, ISO-8601 (auto-generated)
};

/**
 * Status enum
 */
const Status = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

/**
 * Create new reference document with defaults
 * @param {Object} data - Reference data
 * @returns {Object} Reference document with timestamps and default status
 */
function createReference(data) {
  const now = new Date().toISOString();

  return {
    ...data,
    id: data.id || randomUUID(),
    status: data.status || Status.PENDING,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now
  };
}

/**
 * Update reference document with new timestamp
 * @param {Object} data - Updated reference data
 * @returns {Object} Reference document with updated timestamp
 */
function updateReference(data) {
  return {
    ...data,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Get field constraints for validation
 */
const Constraints = {
  titulo: { maxLength: 500 },
  resumo: { maxLength: 5000 },
  DOI: { maxLength: 100 },
  ano: { min: 1500, max: 2100 },
  fonte: { maxLength: 100 },
  comunidade: {
    nome: { maxLength: 200 },
    tipo: { maxLength: 200 },
    municipio: { maxLength: 100 },
    estado: { maxLength: 100 },
    local: { maxLength: 500 },
    observacoes: { maxLength: 2000 },
    atividadeEconomica: { maxLength: 100 }
  },
  planta: {
    nomeCientifico: { maxLength: 200 },
    nomeVernacular: { maxLength: 100 },
    tipoUso: { maxLength: 100 }
  }
};

module.exports = {
  ReferenceSchema,
  Status,
  Constraints,
  createReference,
  updateReference
};

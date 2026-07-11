# Data Model

**Feature**: Ethnobotanical Database Web Interface
**Date**: 2025-12-25
**Status**: Complete

## Overview

This document defines the data model for the ethnobotanical database interface, based on the SQLite JSON1 document store (`biocultdb_records` table, ADR-005) and functional requirements from spec.md.

## Entity Definitions

### Reference

**Purpose**: Represents a scientific publication documenting ethnobotanical knowledge from traditional communities.

**Schema**:
```javascript
// Stored as JSON in biocultdb_records.doc (TEXT column, id/created_at/updated_at are sibling columns)
{
  id: String,                       // UUID v4, application-generated (crypto.randomUUID())
  titulo: String,                   // Publication title (required)
  autores: [String],                // List of author names (required, min: 1)
  ano: Number,                      // Publication year (required, 4-digit integer)
  resumo: String,                   // Abstract/summary (optional)
  DOI: String,                      // Digital Object Identifier (optional, empty string if none)
  status: String,                   // Workflow status (required, enum: "pending" | "approved" | "rejected")
  fonte: String,                    // Origin system (required, enum: "etnodb" | "biocultpapers")
  comunidades: [Community],         // Nested array of communities (required, min: 1)
  createdAt: String,                // Creation timestamp, ISO-8601 (auto-generated)
  updatedAt: String                 // Last update timestamp, ISO-8601 (auto-generated)
}
```

**Validation Rules**:
- `titulo`: Non-empty string, max 500 characters
- `autores`: Array with at least 1 non-empty string
- `ano`: Integer between 1500-2100 (historical to near-future publications)
- `resumo`: Optional string, max 5000 characters
- `DOI`: Optional string, max 100 characters, empty string if not available
- `status`: Must be one of: "pending", "approved", "rejected"
- `fonte`: Must be one of: "etnodb", "biocultpapers" (identifies the originating acquisition source)
- `comunidades`: Array with at least 1 community object

**State Transitions**:
```
[New Submission] → status: "pending"
       ↓
[Curator Review]
       ↓
  ┌────┴────┐
  ↓         ↓
approved  rejected
  ↓         ↓
[Public]  [Hidden]
```

**Indexes**:
```sql
-- Generated columns projected from doc via json_extract (see ADR-005)
ALTER TABLE biocultdb_records ADD COLUMN status TEXT GENERATED ALWAYS AS (json_extract(doc, '$.status')) VIRTUAL;
ALTER TABLE biocultdb_records ADD COLUMN ano INTEGER GENERATED ALWAYS AS (json_extract(doc, '$.ano')) VIRTUAL;
ALTER TABLE biocultdb_records ADD COLUMN fonte TEXT GENERATED ALWAYS AS (json_extract(doc, '$.fonte')) VIRTUAL;
ALTER TABLE biocultdb_records ADD COLUMN titulo TEXT GENERATED ALWAYS AS (json_extract(doc, '$.titulo')) VIRTUAL;

-- Status filter for curation context
CREATE INDEX idx_biocultdb_records_status ON biocultdb_records(status);

-- Recent references for curation list (created_at is a native column, not generated)
CREATE INDEX idx_biocultdb_records_created_at ON biocultdb_records(created_at DESC);

-- Composite index for status + year filters (presentation/curation)
CREATE INDEX idx_biocultdb_records_status_ano ON biocultdb_records(status, ano);

-- Full-text search on title (see FTS5 virtual table, biocultdb_records_fts)
CREATE VIRTUAL TABLE biocultdb_records_fts USING fts5(
  id UNINDEXED, titulo, autores, resumo, doi, comunidades,
  tokenize = 'unicode61 remove_diacritics 2'
);
```

---

### Community

**Purpose**: Represents a traditional community studied in a scientific reference.

**Schema**:
```javascript
{
  nome: String,                     // Community name (required)
  tipo: String,                     // Community type taxonomy (required, e.g. "indigena", "quilombola", "ribeirinha", "tradicional")
  municipio: String,                // Municipality (required)
  estado: String,                   // State/province (required)
  local: String,                    // Detailed location description (optional)
  atividadesEconomicas: [String],   // Economic activities (optional)
  observacoes: String,              // Additional notes/observations (optional)
  plantas: [Plant]                  // Nested array of plants (required, min: 1)
}
```

**Validation Rules**:
- `nome`: Non-empty string, max 200 characters
- `tipo`: Non-empty string, max 100 characters (community type taxonomy)
- `municipio`: Non-empty string, max 100 characters
- `estado`: Non-empty string, max 100 characters (should match Brazilian state names)
- `local`: Optional string, max 500 characters
- `atividadesEconomicas`: Optional array of strings, each max 100 characters
- `observacoes`: Optional string, max 2000 characters
- `plantas`: Array with at least 1 plant object

**Nested Within**: Reference (comunidades array)

**Indexes** (queried via JSON1 table-valued functions over `biocultdb_records.doc`):
```sql
-- State/municipality filters for presentation search
-- (no direct column index possible on nested array elements; json_each scans doc per row)
SELECT r.id FROM biocultdb_records r
WHERE EXISTS (
  SELECT 1 FROM json_each(r.doc, '$.comunidades') c
  WHERE json_extract(c.value, '$.estado') = ?
);

SELECT r.id FROM biocultdb_records r
WHERE EXISTS (
  SELECT 1 FROM json_each(r.doc, '$.comunidades') c
  WHERE json_extract(c.value, '$.municipio') = ?
);

-- Community name search delegated to FTS5 (comunidades column aggregates community names)
SELECT r.* FROM biocultdb_records r
JOIN biocultdb_records_fts f ON f.id = r.id
WHERE biocultdb_records_fts MATCH ?;
```

---

### Plant

**Purpose**: Represents a plant species used by a community, with botanical and local knowledge.

**Schema**:
```javascript
{
  nomeCientifico: [String],         // Scientific names (required, min: 1)
  nomeVernacular: [String],         // Vernacular/common names (required, min: 1)
  tipoUso: [String]                 // Types of use (required, min: 1)
}
```

**Validation Rules**:
- `nomeCientifico`: Array with at least 1 non-empty string, each max 200 characters
  - Format: Genus species (e.g., "Foeniculum vulgare")
  - May include botanical authority (e.g., "Bidens pilosa L.")
- `nomeVernacular`: Array with at least 1 non-empty string, each max 100 characters
  - Local names in Portuguese or indigenous languages
- `tipoUso`: Array with at least 1 non-empty string, each max 100 characters
  - Examples: "medicinal", "alimentício", "artesanato", "construção"

**Nested Within**: Community (plantas array)

**Indexes** (via FTS5, `biocultdb_records_fts`):
```sql
-- Plant name searches (scientific and vernacular) piggyback on the FTS5 `comunidades`
-- column, which aggregates every nested community/plant name into the indexed text
-- at write time (application-level sync, same transaction as the doc write).
SELECT r.* FROM biocultdb_records r
JOIN biocultdb_records_fts f ON f.id = r.id
WHERE biocultdb_records_fts MATCH ?;
```

---

## Data Relationships

```
Reference (1)
  ├── titulo
  ├── autores[]
  ├── ano
  ├── resumo
  ├── DOI
  ├── status
  ├── fonte
  └── comunidades[] (1..n)
        ├── nome
        ├── tipo
        ├── municipio
        ├── estado
        ├── local
        ├── atividadesEconomicas[]
        ├── observacoes
        └── plantas[] (1..n)
              ├── nomeCientifico[]
              ├── nomeVernacular[]
              └── tipoUso[]
```

**Cardinality**:
- 1 Reference contains 1-n Communities
- 1 Community contains 1-n Plants
- All relationships are containment (no external references)

---

## Query Patterns

### Acquisition Context

**Insert New Reference**:
```javascript
// Application builds the JS object, then serializes it for the doc column
const reference = {
  id: crypto.randomUUID(),
  titulo: "...",
  autores: ["...", "..."],
  ano: 2024,
  resumo: "...",
  DOI: "",
  status: "pending",  // Always "pending" on creation
  fonte: "etnodb",    // or "biocultpapers", identifies the originating acquisition source
  comunidades: [
    {
      nome: "...",
      tipo: "...",
      municipio: "...",
      estado: "...",
      local: "...",
      atividadesEconomicas: ["...", "..."],
      observacoes: "...",
      plantas: [
        {
          nomeCientifico: ["...", "..."],
          nomeVernacular: ["...", "..."],
          tipoUso: ["...", "..."]
        }
      ]
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```
```sql
INSERT INTO biocultdb_records (id, doc, created_at, updated_at)
VALUES (?, ?, ?, ?);
-- params: [reference.id, JSON.stringify(reference), reference.createdAt, reference.updatedAt]
-- and the same transaction inserts/updates the matching biocultdb_records_fts row.
```

---

### Curation Context

**List All References with Status**:
```sql
SELECT id, titulo, autores, ano, status, created_at
FROM biocultdb_records
ORDER BY created_at DESC;
-- titulo/autores/ano/status are generated columns (json_extract); autores stays JSON text
-- and is parsed in the application layer after the row is read.
```

**Get Single Reference for Editing**:
```sql
SELECT id, doc, created_at, updated_at FROM biocultdb_records WHERE id = ?;
```

**Update Reference Content**:
```javascript
// The doc object is fetched, merged with the incoming edits in JS
// (comunidades[] is replaced wholesale), then rewritten.
const updated = { ...existingReference, ...edits, updatedAt: new Date().toISOString() };
```
```sql
UPDATE biocultdb_records SET doc = ?, updated_at = ? WHERE id = ?;
-- params: [JSON.stringify(updated), updated.updatedAt, updated.id]
```

**Change Reference Status**:
```javascript
const updated = { ...existingReference, status: "approved", updatedAt: new Date().toISOString() };
```
```sql
UPDATE biocultdb_records SET doc = ?, updated_at = ? WHERE id = ?;
-- params: [JSON.stringify(updated), updated.updatedAt, updated.id]
```

---

### Presentation Context

**Search by Community Name**:
```sql
SELECT r.id, r.titulo, r.autores, r.ano, r.doc
FROM biocultdb_records r
JOIN biocultdb_records_fts f ON f.id = r.id
WHERE r.status = 'approved' AND biocultdb_records_fts MATCH ?;
-- MATCH query targets the fts `comunidades` column; app scopes the query, e.g. 'comunidades:searchTerm*'
```

**Search by Plant Name (Scientific or Vernacular)**:
```sql
SELECT r.* FROM biocultdb_records r
JOIN biocultdb_records_fts f ON f.id = r.id
WHERE r.status = 'approved' AND biocultdb_records_fts MATCH ?;
-- Scientific and vernacular plant names are both folded into the fts `comunidades`
-- column at write time, so one MATCH covers both.
```

**Filter by State**:
```sql
SELECT r.* FROM biocultdb_records r
WHERE r.status = 'approved'
  AND EXISTS (
    SELECT 1 FROM json_each(r.doc, '$.comunidades') c
    WHERE json_extract(c.value, '$.estado') = ?
  );
```

**Filter by Municipality**:
```sql
SELECT r.* FROM biocultdb_records r
WHERE r.status = 'approved'
  AND EXISTS (
    SELECT 1 FROM json_each(r.doc, '$.comunidades') c
    WHERE json_extract(c.value, '$.municipio') = ?
  );
```

**Combined Filters (AND logic)**:
```sql
SELECT r.* FROM biocultdb_records r
JOIN biocultdb_records_fts f ON f.id = r.id
WHERE r.status = 'approved'
  AND EXISTS (
    SELECT 1 FROM json_each(r.doc, '$.comunidades') c
    WHERE json_extract(c.value, '$.estado') = ?
      AND json_extract(c.value, '$.municipio') = ?
  )
  AND biocultdb_records_fts MATCH ?;
-- last param targets the fts `comunidades` column, e.g. 'comunidades:erva*'
```

---

## Validation Implementation

### Server-Side Validation (Node.js)

**Reference Validation Function**:
```javascript
function validateReference(data) {
  const errors = [];

  // Title validation
  if (!data.titulo || data.titulo.trim().length === 0) {
    errors.push("Título é obrigatório");
  } else if (data.titulo.length > 500) {
    errors.push("Título deve ter no máximo 500 caracteres");
  }

  // Authors validation
  if (!Array.isArray(data.autores) || data.autores.length === 0) {
    errors.push("Pelo menos um autor é obrigatório");
  }

  // Year validation
  if (!data.ano || !Number.isInteger(data.ano)) {
    errors.push("Ano é obrigatório e deve ser um número inteiro");
  } else if (data.ano < 1500 || data.ano > 2100) {
    errors.push("Ano deve estar entre 1500 e 2100");
  }

  // Communities validation
  if (!Array.isArray(data.comunidades) || data.comunidades.length === 0) {
    errors.push("Pelo menos uma comunidade é obrigatória");
  } else {
    data.comunidades.forEach((comunidade, idx) => {
      if (!comunidade.nome || comunidade.nome.trim().length === 0) {
        errors.push(`Comunidade ${idx + 1}: Nome é obrigatório`);
      }
      if (!comunidade.tipo || comunidade.tipo.trim().length === 0) {
        errors.push(`Comunidade ${idx + 1}: Tipo é obrigatório`);
      }
      if (!comunidade.municipio || comunidade.municipio.trim().length === 0) {
        errors.push(`Comunidade ${idx + 1}: Município é obrigatório`);
      }
      if (!comunidade.estado || comunidade.estado.trim().length === 0) {
        errors.push(`Comunidade ${idx + 1}: Estado é obrigatório`);
      }

      // Plants validation
      if (!Array.isArray(comunidade.plantas) || comunidade.plantas.length === 0) {
        errors.push(`Comunidade ${idx + 1}: Pelo menos uma planta é obrigatória`);
      } else {
        comunidade.plantas.forEach((planta, pIdx) => {
          if (!Array.isArray(planta.nomeCientifico) || planta.nomeCientifico.length === 0) {
            errors.push(`Comunidade ${idx + 1}, Planta ${pIdx + 1}: Nome científico é obrigatório`);
          }
          if (!Array.isArray(planta.nomeVernacular) || planta.nomeVernacular.length === 0) {
            errors.push(`Comunidade ${idx + 1}, Planta ${pIdx + 1}: Nome vernacular é obrigatório`);
          }
          if (!Array.isArray(planta.tipoUso) || planta.tipoUso.length === 0) {
            errors.push(`Comunidade ${idx + 1}, Planta ${pIdx + 1}: Tipo de uso é obrigatório`);
          }
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

---

## Edge Cases & Handling

### Empty/Optional Fields

| Field | Empty Value | Handling |
|-------|-------------|----------|
| DOI | No DOI available | Store as empty string `""` (not null) |
| resumo | No abstract | Store as empty string `""` or omit field |
| local | No specific location | Store as empty string `""` or omit field |
| atividadesEconomicas | No economic data | Store as empty array `[]` or omit field |
| observacoes | No observations | Store as empty string `""` or omit field |

### Duplicate Detection

**Plant Duplicates**: Multiple plants with same scientific name within one community
- **Handling**: Allow at data entry (acquisition), flag for curator review (curation)
- **Validation**: Warning message but not blocking

**Reference Duplicates**: Same publication entered twice
- **Handling**: Check title + year before insert (case-insensitive)
- **Query**: `SELECT id FROM biocultdb_records WHERE titulo = ? COLLATE NOCASE AND ano = ?`

### Special Characters

**Botanical Authorities**: Scientific names may include special characters
- Examples: "Foeniculum vulgare L.", "Astrocaryum aculeatissimum (Schott) Burret"
- **Handling**: No character restrictions, store as UTF-8

**Portuguese Characters**: Accents and special letters in vernacular names
- Examples: "erva-doce", "jiçara", "brejaúva"
- **Handling**: Full UTF-8 support; case/diacritic-insensitive search via the FTS5
  `unicode61 remove_diacritics 2` tokenizer

### Inconsistent Geographic Names

**State/Municipality Spelling Variations**:
- Example: "São Paulo" vs "Sao Paulo" vs "SP"
- **Handling**:
  - Acquisition: Accept any input (free text)
  - Curation: Curator standardizes during review
  - Future: Consider autocomplete/dropdown for standardization

---

## Data Migration

**Status**: No migration needed - database already exists with structure matching /docs/dataStructure.json

**Index Creation**: Execute index/generated-column creation commands once on deployment:
```sql
-- Run once during deployment
ALTER TABLE biocultdb_records ADD COLUMN status TEXT GENERATED ALWAYS AS (json_extract(doc, '$.status')) VIRTUAL;
ALTER TABLE biocultdb_records ADD COLUMN ano INTEGER GENERATED ALWAYS AS (json_extract(doc, '$.ano')) VIRTUAL;
ALTER TABLE biocultdb_records ADD COLUMN fonte TEXT GENERATED ALWAYS AS (json_extract(doc, '$.fonte')) VIRTUAL;
ALTER TABLE biocultdb_records ADD COLUMN titulo TEXT GENERATED ALWAYS AS (json_extract(doc, '$.titulo')) VIRTUAL;

CREATE INDEX idx_biocultdb_records_status ON biocultdb_records(status);
CREATE INDEX idx_biocultdb_records_created_at ON biocultdb_records(created_at DESC);
CREATE INDEX idx_biocultdb_records_status_ano ON biocultdb_records(status, ano);

CREATE VIRTUAL TABLE biocultdb_records_fts USING fts5(
  id UNINDEXED, titulo, autores, resumo, doi, comunidades,
  tokenize = 'unicode61 remove_diacritics 2'
);
```

---

## Performance Considerations

### Index Strategy

**FTS5 Index**: Full-text search on titulo, autores, resumo, DOI, and the aggregated
`comunidades` text (community names + plant scientific/vernacular names)
- **Tradeoff**: Slightly slower writes (application must sync `biocultdb_records_fts`
  in the same transaction as `doc`), faster reads (acceptable for read-heavy
  presentation context)

**Compound Indexes**: `(status, ano)` covers the common curation/presentation filter
combination; no further compound indexes needed at current scale

### Query Optimization

**Column Selection**: Limit returned columns in presentation context
```sql
-- Only return necessary columns for card display
SELECT id, titulo, autores, ano, doc FROM biocultdb_records WHERE status = 'approved';
-- comunidades.nome / comunidades.plantas are extracted from `doc` in the application layer
```

**Pagination**: Limit results to prevent large result sets
```sql
SELECT id, doc, created_at FROM biocultdb_records
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT ? OFFSET ?;
-- params: [50, page * 50]
```

### Denormalization Considerations

**Current**: Fully nested structure (reference → communities → plants), stored as one
JSON document per row
- **Pros**: Matches domain model, atomic single-row writes, consistency
- **Cons**: Deep nesting in queries (`json_each`/`json_tree` for nested filters),
  potential duplication of plant data across communities

**Future**: If performance degrades, consider:
- Separate normalized tables (communities, plants) with foreign keys
- Caching layer for frequent searches
- **Decision**: Defer until proven necessary (YAGNI principle)

---

## Summary

The data model directly reflects the SQLite JSON1 document store defined in /docs/dataStructure.json with added:
- Status field for curation workflow
- Fonte field identifying the originating acquisition source
- Timestamps for tracking
- Validation rules for data integrity
- Generated-column and FTS5 indexes for search performance
- Query patterns for three contexts

All entities and relationships align with functional requirements from spec.md.

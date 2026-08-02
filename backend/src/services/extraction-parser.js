/**
 * Extraction Parser Service
 *
 * Pure function, no I/O: turns the raw text an AI provider returned for the
 * Extração por IA prompt into an Evidence-shaped document, or a descriptive
 * failure. This is the tracer-bullet's test seam (ticket 05) — every case
 * below is a bug the desktop app (BioCultPapers) actually hit, not a
 * hypothetical:
 *
 * - The model wraps its JSON in a ```json ... ``` fence, or writes prose
 *   before/after the JSON block.
 * - The JSON itself is malformed — a parse failure, not a thrown exception.
 * - Required fields (titulo/autores/ano/resumo) are missing — per ADR-002
 *   D9, that produces a partial Evidence, never a rejection: the extraction
 *   doesn't know if a field is missing because the AI failed or because the
 *   article never had it, and Curadoria — not the extractor — makes that
 *   call.
 * - List fields (autores, nomeCientifico, ...) sometimes arrive as a single
 *   comma-separated string instead of a JSON array.
 */

const { Status } = require('../models/Evidence');

/**
 * Extract the JSON object substring from a raw AI response: strips a
 * ```json fence when present, then takes the outermost {...} span so
 * leading/trailing prose around the block is ignored either way.
 * @param {string} rawText
 * @returns {string|null}
 */
function extractJsonSubstring(rawText) {
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1] : rawText;

  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;

  return candidate.slice(start, end + 1);
}

/**
 * @param {*} value
 * @returns {string|null} Trimmed string, or null if empty/not a string.
 */
function normalizeString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

/**
 * Accepts a real array OR a comma-separated string (a bug class the
 * desktop app had a dedicated converter for) and normalizes to a trimmed,
 * non-empty string array.
 * @param {*} value
 * @returns {string[]}
 */
function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((v) => v.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Vernacular names follow the project convention: lowercase, spaces
 * replaced by hyphens (same rule `routes.js#formatVernacularName` applies
 * to manually-entered data).
 * @param {*} value
 * @returns {string[]}
 */
function normalizeVernacularArray(value) {
  return normalizeStringArray(value).map((name) => name.toLowerCase().replace(/\s+/g, '-'));
}

function normalizeYear(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function normalizePlanta(planta) {
  const p = planta && typeof planta === 'object' ? planta : {};
  return {
    nomeCientifico: normalizeStringArray(p.nomeCientifico),
    nomeVernacular: normalizeVernacularArray(p.nomeVernacular),
    tipoUso: normalizeStringArray(p.tipoUso)
  };
}

function normalizeComunidade(comunidade) {
  const c = comunidade && typeof comunidade === 'object' ? comunidade : {};
  const plantas = Array.isArray(c.plantas) ? c.plantas.map(normalizePlanta) : [];

  return {
    nome: normalizeString(c.nome),
    tipo: normalizeString(c.tipo),
    municipio: normalizeString(c.municipio),
    estado: normalizeString(c.estado),
    local: normalizeString(c.local),
    atividadesEconomicas: normalizeStringArray(c.atividadesEconomicas),
    observacoes: normalizeString(c.observacoes),
    plantas
  };
}

/**
 * Parse an AI provider's raw text response into an Evidence document ready
 * for `insertEvidence` (id/createdAt/updatedAt are still added there).
 * Never throws — parse/shape failures come back as `{ success: false }`.
 *
 * @param {string} rawText - Raw text the AI provider returned.
 * @param {{provider: string, model: string}} meta - Stamps `fonte`.
 * @returns {{success: true, evidence: object}|{success: false, error: string}}
 */
function parseExtractionResponse(rawText, meta = {}) {
  if (!rawText || !rawText.trim()) {
    return { success: false, error: 'Resposta vazia do provedor de IA' };
  }

  const jsonText = extractJsonSubstring(rawText);
  if (!jsonText) {
    return { success: false, error: 'Não foi possível localizar um bloco JSON na resposta da IA' };
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    return { success: false, error: `Resposta da IA não é um JSON válido: ${error.message}` };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { success: false, error: 'JSON da resposta não corresponde a uma Evidência (esperado um objeto)' };
  }

  const { provider, model } = meta;
  const comunidades = Array.isArray(parsed.comunidades) ? parsed.comunidades.map(normalizeComunidade) : [];

  const evidence = {
    titulo: normalizeString(parsed.titulo),
    autores: normalizeStringArray(parsed.autores),
    ano: normalizeYear(parsed.ano),
    resumo: normalizeString(parsed.resumo),
    DOI: normalizeString(parsed.DOI ?? parsed.doi),
    comunidades,
    status: Status.PENDING,
    fonte: `extração IA — ${provider}/${model}`
  };

  return { success: true, evidence };
}

module.exports = { parseExtractionResponse };

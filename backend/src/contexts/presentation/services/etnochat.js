/**
 * etnoChat Service
 *
 * AI chat service with multi-provider support (Claude, OpenAI, Gemini)
 * Handles API key validation, model listing, and chat streaming
 */

const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const database = require('../../../shared/database');
const { Status } = require('../../../models/Reference');
const logger = require('../../../shared/logger');

// Load system prompt
const systemPromptPath = path.join(__dirname, '../prompts/etnochat-system.md');
const systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8');

/**
 * Provider configurations
 */
const PROVIDERS = {
  claude: {
    name: 'Claude (Anthropic)',
    models: [
      { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5' },
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude Haiku 3.5' }
    ]
  },
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
    ]
  },
  gemini: {
    name: 'Google Gemini',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.0-flash-thinking-exp-01-21', name: 'Gemini 2.0 Flash Thinking (Experimental)' }
    ]
  }
};

/**
 * Validate API key by making a minimal API call
 * @param {string} provider - Provider name (claude, openai, gemini)
 * @param {string} apiKey - API key to validate
 * @param {string} model - Model ID to test (optional, uses default if not provided)
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
async function validateApiKey(provider, apiKey, model = null) {
  try {
    // Get default model if not provided
    if (!model) {
      const providerConfig = PROVIDERS[provider];
      if (!providerConfig || !providerConfig.models || providerConfig.models.length === 0) {
        return { valid: false, error: 'Provedor desconhecido ou sem modelos' };
      }
      model = providerConfig.models[0].id;
    }

    // Verify model is available for this provider
    const providerConfig = PROVIDERS[provider];
    if (providerConfig) {
      const modelExists = providerConfig.models.some(m => m.id === model);
      if (!modelExists) {
        return { valid: false, error: `Modelo ${model} não disponível para ${providerConfig.name}` };
      }
    }

    switch (provider) {
      case 'claude': {
        const client = new Anthropic({ apiKey });
        await client.messages.create({
          model: model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }]
        });
        return { valid: true };
      }

      case 'openai': {
        const client = new OpenAI({ apiKey });
        await client.chat.completions.create({
          model: model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }]
        });
        return { valid: true };
      }

      case 'gemini': {
        const client = new GoogleGenAI({ apiKey });
        await client.models.generateContent({
          model: model,
          contents: 'Hi'
        });
        return { valid: true };
      }

      default:
        return { valid: false, error: 'Provedor desconhecido' };
    }
  } catch (error) {
    logger.error(`API key validation failed for ${provider} with model ${model}:`, error.message);
    return { valid: false, error: error.message };
  }
}

/**
 * Get available models for a provider
 * @param {string} provider - Provider name
 * @returns {Array<{id: string, name: string}>}
 */
function getModels(provider) {
  const providerConfig = PROVIDERS[provider];
  return providerConfig ? providerConfig.models : [];
}

/**
 * Get all available providers
 * @returns {Array<{id: string, name: string}>}
 */
function getProviders() {
  return Object.entries(PROVIDERS).map(([id, config]) => ({
    id,
    name: config.name
  }));
}

/**
 * Extract the restricted filter DSL emitted by the LLM (hidden format).
 * The LLM never emits SQL or a query language — only a whitelisted JSON
 * filter array (see FIELD_WHITELIST/executeQuery below), which is the sole
 * input translated into parameterized SQL.
 * @param {string} text - AI response text
 * @returns {{query: Array|null, cleanText: string}} Parsed filter conditions and cleaned text
 */
function extractFilterQuery(text) {
  const hiddenRegex = /<!--QUERY\s*([\s\S]*?)QUERY-->/g;

  const match = hiddenRegex.exec(text);
  let query = null;
  let cleanText = text;

  if (match) {
    try {
      const parsed = JSON.parse(match[1].trim());
      query = Array.isArray(parsed) ? parsed : [parsed];
      cleanText = text.replace(hiddenRegex, '').trim();
    } catch (e) {
      logger.error('Failed to parse hidden filter query:', e.message);
    }
  }

  return { query, cleanText };
}

/**
 * Safely convert any value to a displayable string
 * Handles arrays, objects, and primitives
 * @param {*} value - Value to convert
 * @returns {string} String representation
 */
function safeStringify(value) {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    // Flatten nested arrays and join with comma
    const flattened = value.flat(Infinity).filter(v => v !== null && v !== undefined);
    return flattened.map(v => safeStringify(v)).join(', ');
  }
  if (typeof value === 'object') {
    // Handle Date objects
    if (value instanceof Date) {
      return value.toLocaleDateString('pt-BR');
    }
    // For other objects, try to extract meaningful values
    const meaningfulKeys = ['nome', 'titulo', 'name', 'title', 'value'];
    for (const key of meaningfulKeys) {
      if (value[key]) {
        return safeStringify(value[key]);
      }
    }
    // Last resort: JSON stringify
    try {
      return JSON.stringify(value);
    } catch {
      return '[objeto complexo]';
    }
  }
  return String(value);
}

/**
 * Format query results in a human-readable way
 * @param {Array} data - Query results
 * @returns {string} Formatted text
 */
function formatQueryResults(data) {
  if (!data || data.length === 0) {
    return 'Nenhum resultado encontrado.';
  }

  // The filter DSL only ever returns Reference documents (titulo, autores, ano, ...)
  if (data[0].titulo !== undefined) {
    const lines = data.map((item, i) => {
      const autores = Array.isArray(item.autores) ? item.autores.join(', ') : safeStringify(item.autores);
      let line = `${i + 1}. **${safeStringify(item.titulo)}**`;
      if (autores) line += ` - ${autores}`;
      if (item.ano) line += ` (${item.ano})`;
      return line;
    });
    return `**Referências encontradas (${data.length}):**\n\n` + lines.join('\n');
  }

  // Generic fallback formatting for any other result shape
  const lines = data.slice(0, 20).map((item, i) => {
    const displayValue = safeStringify(item.nome) ||
                         safeStringify(item.id) ||
                         safeStringify(item.titulo) ||
                         JSON.stringify(item);
    return `${i + 1}. ${displayValue}`;
  });

  let result = lines.join('\n');
  if (data.length > 20) {
    result += `\n\n_...e mais ${data.length - 20} resultados_`;
  }

  return result;
}

/**
 * Restricted filter DSL (DA8) — whitelisted queryable fields for etnoChat.
 * Each entry describes how to reach the compared value inside the stored
 * `doc` JSON: `arrays` are json paths walked through EXISTS(json_each(...))
 * joins (relative to the previous hop's `.value`, or `doc` for the first
 * hop); `leaf` is the json path of the scalar/array compared at the end
 * (relative to the last join, or `doc` when `arrays` is empty); `leafIsArray`
 * means the leaf itself is a JSON array of strings needing one more
 * json_each hop before comparing.
 */
const FIELD_WHITELIST = {
  titulo:  { leaf: "$.titulo" },
  ano:     { leaf: "$.ano", numeric: true },
  status:  { leaf: "$.status" },
  fonte:   { leaf: "$.fonte" },
  autores: { leaf: "$.autores", leafIsArray: true },
  'comunidades.nome':      { arrays: ["$.comunidades"], leaf: "$.nome" },
  'comunidades.municipio': { arrays: ["$.comunidades"], leaf: "$.municipio" },
  'comunidades.estado':    { arrays: ["$.comunidades"], leaf: "$.estado" },
  'comunidades.plantas.nomeVernacular': { arrays: ["$.comunidades", "$.plantas"], leaf: "$.nomeVernacular", leafIsArray: true },
  'comunidades.plantas.tipoUso':        { arrays: ["$.comunidades", "$.plantas"], leaf: "$.tipoUso", leafIsArray: true }
};

const SUPPORTED_OPERATORS = new Set(['eq', 'contains', 'in', 'gte', 'lte']);

/**
 * Resolve a whitelisted field definition into its EXISTS(json_each(...))
 * join clauses (if any) and the final value expression to compare.
 */
function resolveValueExpr(fieldDef) {
  const arrays = fieldDef.arrays || [];
  const joins = [];
  let prevAlias = null;

  arrays.forEach((arrayPath, i) => {
    const alias = `j${i}`;
    joins.push(
      prevAlias
        ? `json_each(json_extract(${prevAlias}.value, '${arrayPath}')) ${alias}`
        : `json_each(doc, '${arrayPath}') ${alias}`
    );
    prevAlias = alias;
  });

  if (fieldDef.leafIsArray) {
    const leafSource = prevAlias
      ? `json_extract(${prevAlias}.value, '${fieldDef.leaf}')`
      : `json_extract(doc, '${fieldDef.leaf}')`;
    joins.push(`json_each(${leafSource}) jleaf`);
    return { joins, leafExpr: 'jleaf.value' };
  }

  const leafExpr = prevAlias
    ? `json_extract(${prevAlias}.value, '${fieldDef.leaf}')`
    : `json_extract(doc, '${fieldDef.leaf}')`;
  return { joins, leafExpr };
}

/**
 * Build the parameterized comparison SQL for one condition. `valor` is
 * NEVER concatenated into the SQL string — it is only ever pushed onto
 * `params` and bound through `?` placeholders.
 */
function buildComparison(leafExpr, operador, valor, numeric, params) {
  switch (operador) {
    case 'eq':
      params.push(valor);
      return numeric ? `${leafExpr} = ?` : `LOWER(${leafExpr}) = LOWER(?)`;
    case 'contains':
      params.push(valor);
      return `LOWER(${leafExpr}) LIKE '%' || LOWER(?) || '%'`;
    case 'gte':
      params.push(valor);
      return `${leafExpr} >= ?`;
    case 'lte':
      params.push(valor);
      return `${leafExpr} <= ?`;
    case 'in': {
      if (!Array.isArray(valor) || valor.length === 0) {
        throw new Error('Operador "in" requer um array de valores não vazio');
      }
      valor.forEach((v) => params.push(v));
      const placeholders = valor.map(() => (numeric ? '?' : 'LOWER(?)')).join(', ');
      return numeric ? `${leafExpr} IN (${placeholders})` : `LOWER(${leafExpr}) IN (${placeholders})`;
    }
    default:
      throw new Error(`Operador não permitido no filtro etnoChat: "${operador}"`);
  }
}

/**
 * Translate one `{ campo, operador, valor }` condition into parameterized
 * SQL. Throws if `campo`/`operador` are not in the whitelist — this check
 * runs BEFORE any database access, so a rejected field never reaches SQLite.
 */
function buildConditionSql(condition, params) {
  const { campo, operador, valor } = condition || {};
  const fieldDef = FIELD_WHITELIST[campo];
  if (!fieldDef) {
    throw new Error(
      `Campo não permitido no filtro etnoChat: "${campo}". Campos disponíveis: ${Object.keys(FIELD_WHITELIST).join(', ')}`
    );
  }
  if (!SUPPORTED_OPERATORS.has(operador)) {
    throw new Error(`Operador não permitido no filtro etnoChat: "${operador}"`);
  }

  const { joins, leafExpr } = resolveValueExpr(fieldDef);
  const comparison = buildComparison(leafExpr, operador, valor, fieldDef.numeric, params);

  return joins.length > 0 ? `EXISTS (SELECT 1 FROM ${joins.join(', ')} WHERE ${comparison})` : comparison;
}

/**
 * Execute the restricted filter DSL (DA8) as parameterized SQL — read-only.
 * `conditions` is an array of `{ campo, operador, valor }` combined with AND.
 * Every `campo`/`operador` is validated against FIELD_WHITELIST/SUPPORTED_OPERATORS
 * before any SQL runs; an invalid one throws and is caught below without ever
 * touching the database. Values are always bound via `?` parameters, never
 * concatenated. This function only ever builds and runs a single SELECT — there
 * is no code path here that can emit INSERT/UPDATE/DELETE.
 * @param {Array<{campo: string, operador: string, valor: *}>} conditions
 * @returns {Promise<Object>} Query results
 */
async function executeQuery(conditions) {
  try {
    if (!Array.isArray(conditions)) {
      return { success: false, error: 'Filtro inválido: esperado um array de condições.' };
    }

    if (!database.isConnected) {
      database.connect();
    }

    const params = [];
    const clauses = conditions.map((condition) => buildConditionSql(condition, params));

    // Always force approved-only results and cap the result set.
    clauses.push(`json_extract(doc, '$.status') = ?`);
    params.push(Status.APPROVED);

    const sql = `SELECT doc FROM ${database.TABLE} WHERE ${clauses.join(' AND ')} LIMIT 50`;

    const rows = database.getConnection().prepare(sql).all(...params);
    const results = rows.map((row) => JSON.parse(row.doc));

    return { success: true, data: results, count: results.length };
  } catch (error) {
    logger.error('Query execution failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Stream chat response from AI provider
 * @param {Object} params - Chat parameters
 * @param {string} params.provider - AI provider
 * @param {string} params.apiKey - API key
 * @param {string} params.model - Model ID
 * @param {Array} params.messages - Chat messages
 * @param {Function} params.onText - Callback for text chunks
 * @param {Function} params.onEnd - Callback when done
 * @param {Function} params.onError - Callback for errors
 */
async function streamChat({ provider, apiKey, model, messages, onText, onEnd, onError }) {
  try {
    logger.info(`Starting chat stream for provider: ${provider}, model: ${model}`);

    // Format messages with system prompt
    const formattedMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    let fullResponse = '';

    switch (provider) {
      case 'claude': {
        const client = new Anthropic({ apiKey });
        const stream = client.messages
          .stream({
            model,
            max_tokens: 4096,
            system: systemPrompt,
            messages: formattedMessages
          })
          .on('text', (text) => {
            fullResponse += text;
            onText(text);
          })
          .on('error', (error) => {
            logger.error('Claude stream error:', error.message);
            throw error;
          });

        await stream.finalMessage();
        logger.info(`Claude stream completed, response length: ${fullResponse.length}`);
        break;
      }

      case 'openai': {
        const client = new OpenAI({ apiKey });
        const stream = await client.chat.completions.create({
          model,
          max_tokens: 4096,
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            ...formattedMessages
          ]
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            fullResponse += text;
            onText(text);
          }
        }
        break;
      }

      case 'gemini': {
        const client = new GoogleGenAI({ apiKey });

        // Convert messages to Gemini format
        const geminiContents = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Entendido. Sou o etnoChat, assistente especializado em dados etnobotanicos do BioCultDB. Estou pronto para ajudar.' }] }
        ];

        for (const m of formattedMessages) {
          geminiContents.push({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          });
        }

        const result = await client.models.generateContentStream({
          model,
          contents: geminiContents
        });

        for await (const chunk of result) {
          const text = chunk.text;
          if (text) {
            fullResponse += text;
            onText(text);
          }
        }
        break;
      }

      default:
        throw new Error('Provedor desconhecido');
    }

    // Check for a hidden filter query in the response and execute it (DA8)
    let { query: querySpec, cleanText } = extractFilterQuery(fullResponse);

    // Clean any patterns that shouldn't appear in the response
    cleanText = cleanText
      .replace(/\[object Object\]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (querySpec) {
      // Execute the query but DON'T add results to response
      // The LLM already formats the data in its response
      // We only execute to validate the query works
      const queryResult = await executeQuery(querySpec);

      if (!queryResult.success) {
        logger.error('Query execution failed:', queryResult.error);
      }

      // Just use the clean text (LLM response without the query block)
      fullResponse = cleanText;
    }

    // Clean any remaining unwanted patterns from the response
    fullResponse = fullResponse
      .replace(/\[object Object\]/g, '')
      .replace(/\{"[^"]+"\s*:/g, '')  // Remove JSON-like patterns
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    logger.info(`Stream completed successfully, final response length: ${fullResponse.length}`);
    onEnd(fullResponse);
  } catch (error) {
    logger.error('Stream chat failed:', error.message);
    logger.error('Error stack:', error.stack);
    onError(error);
  }
}

/**
 * Non-streaming chat for simpler use cases
 * @param {Object} params - Chat parameters
 * @returns {Promise<string>} AI response
 */
async function chat({ provider, apiKey, model, messages }) {
  return new Promise((resolve, reject) => {
    let response = '';
    streamChat({
      provider,
      apiKey,
      model,
      messages,
      onText: (text) => { response += text; },
      onEnd: () => resolve(response),
      onError: (error) => reject(error)
    });
  });
}

module.exports = {
  validateApiKey,
  getModels,
  getProviders,
  streamChat,
  chat,
  extractFilterQuery,
  executeQuery,
  FIELD_WHITELIST,
  PROVIDERS
};

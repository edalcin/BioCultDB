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
const config = require('../../../shared/config');
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
 * Extract MongoDB query from AI response (hidden format)
 * @param {string} text - AI response text
 * @returns {{query: Object|null, cleanText: string}} Parsed query and cleaned text
 */
function extractMongoQuery(text) {
  // New hidden format: <!--QUERY ... QUERY-->
  const hiddenRegex = /<!--QUERY\s*([\s\S]*?)QUERY-->/g;
  // Legacy format: ```mongodb ... ```
  const legacyRegex = /```mongodb\s*([\s\S]*?)```/g;

  let match = hiddenRegex.exec(text);
  let query = null;
  let cleanText = text;

  if (match) {
    try {
      query = JSON.parse(match[1].trim());
      // Remove the query block from visible text
      cleanText = text.replace(hiddenRegex, '').trim();
    } catch (e) {
      logger.error('Failed to parse hidden MongoDB query:', e.message);
    }
  } else {
    // Try legacy format
    match = legacyRegex.exec(text);
    if (match) {
      try {
        query = JSON.parse(match[1].trim());
        // Remove the query block from visible text
        cleanText = text.replace(legacyRegex, '').trim();
      } catch (e) {
        logger.error('Failed to parse legacy MongoDB query:', e.message);
      }
    }
  }

  return { query, cleanText };
}

/**
 * Safely convert any value to a displayable string
 * Handles arrays, objects, ObjectIds, and primitives
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
    // Handle MongoDB ObjectId
    if (value._bsontype === 'ObjectId' || value.constructor?.name === 'ObjectId') {
      return value.toString();
    }
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

  // Check if it's a count result
  if (data.length === 1 && data[0].total !== undefined) {
    return `**Total:** ${data[0].total} registros`;
  }

  // Check if it's a grouped count result (e.g., tipos de uso)
  if (data[0]._id !== undefined && data[0].count !== undefined) {
    const lines = data.map((item, i) => {
      const name = safeStringify(item._id) || 'Não especificado';
      return `${i + 1}. **${name}**: ${item.count} ocorrências`;
    });
    return lines.join('\n');
  }

  // Check if it's a community list
  if (data[0]._id !== undefined && (data[0].estado !== undefined || data[0].municipio !== undefined)) {
    const lines = data.map((item, i) => {
      const parts = [safeStringify(item._id)];
      if (item.municipio) parts.push(safeStringify(item.municipio));
      if (item.estado) parts.push(safeStringify(item.estado));
      return `${i + 1}. **${parts.join('** - ')}`;
    });
    return `**Comunidades encontradas (${data.length}):**\n\n` + lines.join('\n');
  }

  // Check if it's a reference list
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

  // Generic formatting for other results
  const lines = data.slice(0, 20).map((item, i) => {
    // Try to find a meaningful display value
    const displayValue = safeStringify(item.nome) ||
                         safeStringify(item._id) ||
                         safeStringify(item.titulo) ||
                         safeStringify(item.nomeCientifico) ||
                         safeStringify(item.nomeVernacular) ||
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
 * Execute MongoDB query safely (read-only)
 * @param {Object} querySpec - Query specification
 * @returns {Promise<Object>} Query results
 */
async function executeQuery(querySpec) {
  // Security: Always enforce approved status
  const ensureApproved = (query) => {
    if (!query.status) {
      query.status = 'approved';
    }
    return query;
  };

  try {
    // Ensure database connection
    if (!database.isConnected) {
      await database.connect();
    }

    const collection = database.getCollection(config.database.collection);
    if (querySpec.operation === 'find') {
      const query = ensureApproved(querySpec.query || {});
      const options = querySpec.options || {};

      let cursor = collection.find(query);

      if (options.sort) cursor = cursor.sort(options.sort);
      if (options.limit) cursor = cursor.limit(options.limit);
      else cursor = cursor.limit(20); // Default limit

      const results = await cursor.toArray();
      return { success: true, data: results, count: results.length };
    }

    if (querySpec.operation === 'aggregate') {
      let pipeline = querySpec.pipeline || [];

      // Ensure $match with approved status at the start
      if (pipeline.length === 0 || !pipeline[0].$match) {
        pipeline = [{ $match: { status: 'approved' } }, ...pipeline];
      } else if (!pipeline[0].$match.status) {
        pipeline[0].$match.status = 'approved';
      }

      // Add limit if not present
      const hasLimit = pipeline.some(stage => stage.$limit);
      if (!hasLimit) {
        pipeline.push({ $limit: 50 });
      }

      const results = await collection.aggregate(pipeline).toArray();
      return { success: true, data: results, count: results.length };
    }

    return { success: false, error: 'Operacao nao permitida. Use apenas find ou aggregate.' };
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
          });

        await stream.finalMessage();
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
          { role: 'model', parts: [{ text: 'Entendido. Sou o etnoChat, assistente especializado em dados etnobotanicos do etnoDB. Estou pronto para ajudar.' }] }
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

    // Check for MongoDB query in response and execute if found
    let { query: querySpec, cleanText } = extractMongoQuery(fullResponse);

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

    onEnd(fullResponse);
  } catch (error) {
    logger.error('Stream chat failed:', error.message);
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
  executeQuery,
  PROVIDERS
};

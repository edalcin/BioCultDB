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
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' }
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
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
    ]
  }
};

/**
 * Validate API key by making a minimal API call
 * @param {string} provider - Provider name (claude, openai, gemini)
 * @param {string} apiKey - API key to validate
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
async function validateApiKey(provider, apiKey) {
  try {
    switch (provider) {
      case 'claude': {
        const client = new Anthropic({ apiKey });
        await client.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }]
        });
        return { valid: true };
      }

      case 'openai': {
        const client = new OpenAI({ apiKey });
        await client.chat.completions.create({
          model: 'gpt-4o-mini',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }]
        });
        return { valid: true };
      }

      case 'gemini': {
        const client = new GoogleGenAI({ apiKey });
        await client.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: 'Hi'
        });
        return { valid: true };
      }

      default:
        return { valid: false, error: 'Provedor desconhecido' };
    }
  } catch (error) {
    logger.error(`API key validation failed for ${provider}:`, error.message);
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
 * Extract MongoDB query from AI response
 * @param {string} text - AI response text
 * @returns {Object|null} Parsed query or null
 */
function extractMongoQuery(text) {
  const regex = /```mongodb\s*([\s\S]*?)```/g;
  const match = regex.exec(text);

  if (match) {
    try {
      return JSON.parse(match[1].trim());
    } catch (e) {
      logger.error('Failed to parse MongoDB query:', e.message);
      return null;
    }
  }
  return null;
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
    const querySpec = extractMongoQuery(fullResponse);
    if (querySpec) {
      const queryResult = await executeQuery(querySpec);

      // Send query results
      const resultText = `\n\n**Resultados da consulta (${queryResult.count} registros):**\n\`\`\`json\n${JSON.stringify(queryResult.data, null, 2)}\n\`\`\``;
      onText(resultText);
      fullResponse += resultText;
    }

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

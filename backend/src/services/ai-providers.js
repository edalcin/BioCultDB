/**
 * AI Providers Service
 *
 * Shared registry of AI Providers (Claude, OpenAI, Gemini): provider/model
 * catalog, API key validation and SDK client construction. Consumed by the
 * etnoChat service and by the Extração por IA feature — one source of truth
 * so the two never drift apart (ADR-002, D4).
 */

const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const { GoogleGenAI } = require('@google/genai');
const logger = require('../shared/logger');

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
 * Build an SDK client for the given provider.
 * @param {string} provider - Provider name (claude, openai, gemini)
 * @param {string} apiKey - API key for the client
 * @returns {object} Provider SDK client instance
 */
function createClient(provider, apiKey) {
  switch (provider) {
    case 'claude':
      return new Anthropic({ apiKey });
    case 'openai':
      return new OpenAI({ apiKey });
    case 'gemini':
      return new GoogleGenAI({ apiKey });
    default:
      throw new Error('Provedor desconhecido');
  }
}

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
        const client = createClient(provider, apiKey);
        await client.messages.create({
          model: model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }]
        });
        return { valid: true };
      }

      case 'openai': {
        const client = createClient(provider, apiKey);
        await client.chat.completions.create({
          model: model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }]
        });
        return { valid: true };
      }

      case 'gemini': {
        const client = createClient(provider, apiKey);
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
  return providerConfig ? [...providerConfig.models] : [];
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

module.exports = {
  createClient,
  validateApiKey,
  getModels,
  getProviders
};

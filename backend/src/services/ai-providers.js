/**
 * AI Providers Service
 *
 * Shared registry of AI Providers (Claude, OpenAI, Gemini, OpenRouter):
 * provider/model catalog, API key validation and SDK client construction.
 * Consumed by the etnoChat service and by the Extração por IA feature — one
 * source of truth so the two never drift apart (ADR-002, D4).
 *
 * OpenRouter (D11) has no curated model list: it speaks the OpenAI protocol
 * (same SDK, different `baseURL`), and its live catalog of 300+ models is
 * fetched by the browser directly from OpenRouter's public, CORS-enabled
 * endpoint — `getModels('openrouter')` always returns `[]` by design.
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
  },
  openrouter: {
    name: 'OpenRouter',
    // No curated list (D11) — models come live from the browser.
    models: []
  }
};

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

/**
 * Build an SDK client for the given provider.
 * @param {string} provider - Provider name (claude, openai, gemini, openrouter)
 * @param {string} apiKey - API key for the client
 * @returns {object} Provider SDK client instance
 */
function createClient(provider, apiKey) {
  switch (provider) {
    case 'claude':
      return new Anthropic({ apiKey });
    case 'openai':
      return new OpenAI({ apiKey });
    case 'openrouter':
      // OpenRouter speaks the OpenAI protocol (ADR-002 D4) — same SDK, different base URL.
      return new OpenAI({ apiKey, baseURL: OPENROUTER_BASE_URL });
    case 'gemini':
      return new GoogleGenAI({ apiKey });
    default:
      throw new Error('Provedor desconhecido');
  }
}

/**
 * Validate API key by making a minimal API call
 * @param {string} provider - Provider name (claude, openai, gemini, openrouter)
 * @param {string} apiKey - API key to validate
 * @param {string} model - Model ID to test (required for openrouter, which has
 *   no curated default — optional for the other providers)
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
async function validateApiKey(provider, apiKey, model = null) {
  try {
    const providerConfig = PROVIDERS[provider];
    if (!providerConfig) {
      return { valid: false, error: 'Provedor desconhecido' };
    }

    // Get default model if not provided — openrouter has no curated list to
    // default from (D11), so the caller must always pass one.
    if (!model) {
      if (providerConfig.models.length === 0) {
        return { valid: false, error: `Informe um modelo para ${providerConfig.name}` };
      }
      model = providerConfig.models[0].id;
    } else if (providerConfig.models.length > 0) {
      // Curated providers: verify the model is one of the known ones.
      // openrouter's list is live, not curated — any id is accepted here.
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

      case 'openai':
      case 'openrouter': {
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

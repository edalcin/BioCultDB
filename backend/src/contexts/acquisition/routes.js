/**
 * Acquisition Context Routes
 *
 * Routes for data entry workflow:
 * - GET /: Main form page
 * - POST /community/add: Add community form fragment (HTMX)
 * - POST /plant/add/:communityIndex: Add plant form fragment (HTMX)
 * - POST /evidence/submit: Submit complete evidence
 * - GET /extraction-prompt: Prompt de Extração editor (ADR-002 D6)
 * - POST /extraction-prompt: Save an edited prompt
 * - POST /extraction-prompt/reset: Restore the versioned default prompt
 * - GET /extracao-ia: Extração por IA screen (ADR-002 D5/D9)
 * - GET /extracao-ia/api/providers, /api/models, POST /api/validate-key:
 *   same shared ai-providers module the etnoChat routes use
 * - POST /extracao-ia/api/consultar: call the AI provider, return raw text
 * - POST /extracao-ia/api/gravar: parse the raw text, save a pending Evidence
 */

const express = require('express');
const router = express.Router();
const { validateEvidence } = require('../../services/validation');
const {
  checkDuplicateEvidence,
  insertEvidence,
  getExtractionPrompt,
  saveExtractionPrompt,
  restoreDefaultExtractionPrompt
} = require('../../services/database');
const { validateApiKey, completeText, getModels, getProviders } = require('../../services/ai-providers');
const { parseExtractionResponse } = require('../../services/extraction-parser');
const logger = require('../../shared/logger');

/**
 * GET / - Main data entry form
 */
router.get('/', (req, res) => {
  logger.acquisition('Loading data entry form');

  res.render('index', {
    pageTitle: 'Entrada de Dados',
    contextName: 'Entrada de Dados Etnobotânicos',
    contextDescription: 'Cadastro de evidências científicas com dados de comunidades e plantas',
    showNavigation: true,
    errors: null,
    formData: null
  });
});

/**
 * GET /extraction-prompt - Prompt de Extração editor
 */
router.get('/extraction-prompt', (req, res) => {
  const prompt = getExtractionPrompt();

  res.render('extraction-prompt', {
    pageTitle: 'Prompt de Extração',
    contextName: 'Prompt de Extração',
    contextDescription: 'Edite o texto que instrui a IA na Extração por IA',
    prompt: prompt.value,
    updatedAt: prompt.updatedAt,
    saved: false
  });
});

/**
 * POST /extraction-prompt - Save the edited prompt (preserved byte-for-byte)
 */
router.post('/extraction-prompt', (req, res) => {
  const { prompt: value } = req.body;
  const saved = saveExtractionPrompt(value || '');
  logger.acquisition('Extraction prompt saved');

  res.render('extraction-prompt', {
    pageTitle: 'Prompt de Extração',
    contextName: 'Prompt de Extração',
    contextDescription: 'Edite o texto que instrui a IA na Extração por IA',
    prompt: saved.value,
    updatedAt: saved.updatedAt,
    saved: true
  });
});

/**
 * POST /extraction-prompt/reset - Restore the versioned default prompt
 */
router.post('/extraction-prompt/reset', (req, res) => {
  const restored = restoreDefaultExtractionPrompt();
  logger.acquisition('Extraction prompt restored to default');

  res.render('extraction-prompt', {
    pageTitle: 'Prompt de Extração',
    contextName: 'Prompt de Extração',
    contextDescription: 'Edite o texto que instrui a IA na Extração por IA',
    prompt: restored.value,
    updatedAt: restored.updatedAt,
    saved: true
  });
});

/**
 * GET /extracao-ia - Extração por IA screen
 */
router.get('/extracao-ia', (req, res) => {
  res.render('extracao-ia', {
    pageTitle: 'Extração por IA',
    contextName: 'Extração por IA',
    contextDescription: 'Extraia uma Evidência a partir do texto de um artigo'
  });
});

/**
 * GET /extracao-ia/api/providers - List available AI providers
 */
router.get('/extracao-ia/api/providers', (req, res) => {
  res.json(getProviders());
});

/**
 * GET /extracao-ia/api/models - List curated models for a provider
 */
router.get('/extracao-ia/api/models', (req, res) => {
  const { provider } = req.query;
  if (!provider) {
    return res.status(400).json({ error: 'Provedor é obrigatório' });
  }
  res.json(getModels(provider));
});

/**
 * POST /extracao-ia/api/validate-key - Validate an API key
 */
router.post('/extracao-ia/api/validate-key', async (req, res) => {
  try {
    const { provider, apiKey, model } = req.body;
    if (!provider || !apiKey) {
      return res.status(400).json({ valid: false, error: 'Provedor e chave são obrigatórios' });
    }
    const result = await validateApiKey(provider, apiKey, model);
    res.json(result);
  } catch (error) {
    logger.error('Extração por IA — validate-key error:', error.message);
    res.status(500).json({ valid: false, error: 'Erro ao validar chave' });
  }
});

/**
 * Translate a raw provider error into a message the user can act on.
 * Never includes the API key. `error.status`/`error.message` cover the
 * three SDKs (`@anthropic-ai/sdk`, `openai`, `@google/genai`) in this repo.
 * @param {Error} error
 * @returns {string}
 */
function classifyProviderError(error) {
  const status = error?.status || error?.response?.status;
  const message = logger.redactApiKey(error?.message || '');

  if (status === 429 || /rate.?limit|quota/i.test(message)) {
    return 'Limite de uso do provedor de IA atingido. Aguarde um pouco e tente novamente.';
  }
  if (/context length|maximum.*tokens?|token limit|too long/i.test(message)) {
    return 'O texto excede a janela de contexto do modelo escolhido. Tente um modelo com contexto maior ou reduza o texto.';
  }
  return `Falha ao consultar o provedor de IA: ${message || 'erro desconhecido'}`;
}

/**
 * POST /extracao-ia/api/consultar - Ask the AI provider to extract from
 * the pasted text. The API key transits here and is never persisted or
 * logged (ADR-002 D5) — only `error.message` is logged on failure.
 */
router.post('/extracao-ia/api/consultar', async (req, res) => {
  const { provider, apiKey, model, texto } = req.body;

  if (!provider || !apiKey || !model || !texto || !String(texto).trim()) {
    return res.status(400).json({ success: false, error: 'Provedor, chave, modelo e texto são obrigatórios' });
  }

  try {
    const extractionPrompt = getExtractionPrompt().value;
    const rawResponse = await completeText(provider, apiKey, model, extractionPrompt, texto);
    res.json({ success: true, rawResponse });
  } catch (error) {
    logger.error(`Extração por IA — consulta falhou (${provider}/${model}):`, logger.redactApiKey(error.message));
    res.json({ success: false, error: classifyProviderError(error) });
  }
});

/**
 * POST /extracao-ia/api/gravar - Parse the raw AI response and save a
 * pending Evidence. Always saves, even incomplete (ADR-002 D9) — only a
 * response the parser cannot make sense of fails this step.
 */
router.post('/extracao-ia/api/gravar', (req, res) => {
  const { rawResponse, provider, model } = req.body;

  if (!rawResponse) {
    return res.status(400).json({ success: false, error: 'Nenhuma resposta da IA para processar' });
  }

  const parsed = parseExtractionResponse(rawResponse, { provider, model });
  if (!parsed.success) {
    return res.json({ success: false, error: parsed.error });
  }

  insertEvidence(parsed.evidence)
    .then((evidence) => {
      logger.acquisition(`Extração por IA gravou Evidência pendente ${evidence.id} (${evidence.fonte})`);
      res.json({ success: true, id: evidence.id });
    })
    .catch((error) => {
      logger.error('Extração por IA — falha ao gravar Evidência:', error.message);
      res.json({ success: false, error: 'Falha ao salvar a Evidência extraída' });
    });
});

/**
 * POST /community/add - Return community form fragment for HTMX
 */
router.post('/community/add', (req, res) => {
  const communityIndex = parseInt(req.body.communityIndex) || 0;

  logger.acquisition(`Adding community form fragment #${communityIndex}`);

  res.render('partials/community-form', {
    communityIndex,
    community: null
  });
});

/**
 * POST /plant/add/:communityIndex - Return plant form fragment for HTMX
 */
router.post('/plant/add/:communityIndex', (req, res) => {
  const communityIndex = parseInt(req.params.communityIndex);
  const plantIndex = parseInt(req.body.plantIndex) || 0;

  logger.acquisition(`Adding plant form fragment to community #${communityIndex}, plant #${plantIndex}`);

  // Return HTML directly to avoid EJS include issues with nested partials
  const html = `
<div class="bg-gray-50 p-4 rounded border">
  <div class="flex items-center justify-between mb-3">
    <h5 class="text-sm font-semibold text-gray-700">Planta ${plantIndex + 1}</h5>
    <button
      type="button"
      class="text-red-600 hover:text-red-800 text-xs"
      @click="$el.closest('.bg-gray-50').remove()"
    >
      Remover
    </button>
  </div>

  <div class="space-y-3">
    <!-- Scientific Name -->
    <div>
      <label class="form-label text-sm" for="comunidades[${communityIndex}][plantas][${plantIndex}][nomeCientifico]">
        Nome Científico
        <span class="text-gray-500 text-xs">(separados por vírgula)</span>
      </label>
      <input
        type="text"
        id="comunidades[${communityIndex}][plantas][${plantIndex}][nomeCientifico]"
        name="comunidades[${communityIndex}][plantas][${plantIndex}][nomeCientifico]"
        class="form-input text-sm"
        placeholder="Foeniculum vulgare, Bidens pilosa L."
      >
    </div>

    <!-- Vernacular Name -->
    <div>
      <label class="form-label text-sm" for="comunidades[${communityIndex}][plantas][${plantIndex}][nomeVernacular]">
        Nome Vernacular
        <span class="text-gray-500 text-xs">(separados por vírgula)</span>
      </label>
      <input
        type="text"
        id="comunidades[${communityIndex}][plantas][${plantIndex}][nomeVernacular]"
        name="comunidades[${communityIndex}][plantas][${plantIndex}][nomeVernacular]"
        class="form-input text-sm"
        placeholder="erva-doce, picão, jiçara"
      >
    </div>

    <p class="text-xs text-gray-600 italic">* Pelo menos um nome (científico ou vernacular) é obrigatório</p>

    <!-- Type of Use -->
    <div>
      <label class="form-label text-sm" for="comunidades[${communityIndex}][plantas][${plantIndex}][tipoUso]">
        Tipo de Uso
        <span class="text-gray-500 text-xs">(separados por vírgula)</span>
      </label>
      <input
        type="text"
        id="comunidades[${communityIndex}][plantas][${plantIndex}][tipoUso]"
        name="comunidades[${communityIndex}][plantas][${plantIndex}][tipoUso]"
        class="form-input text-sm"
        placeholder="medicinal, alimentício, artesanato"
      >
    </div>
  </div>
</div>
  `;

  res.send(html);
});

/**
 * POST /evidence/submit - Submit complete evidence
 */
router.post('/evidence/submit', async (req, res) => {
  try {
    logger.acquisition('Processing evidence submission');

    // Parse form data into evidence structure
    const evidenceData = parseFormData(req.body);

    // Validate evidence data
    const validation = validateEvidence(evidenceData);

    if (!validation.isValid) {
      logger.acquisition(`Validation failed: ${validation.errors.length} errors`);

      return res.render('index', {
        pageTitle: 'Entrada de Dados',
        contextName: 'Entrada de Dados Etnobotânicos',
        contextDescription: 'Cadastro de evidências científicas com dados de comunidades e plantas',
        showNavigation: true,
        errors: validation.errors,
        formData: req.body
      });
    }

    // Check for duplicate evidence (title + year)
    const existingEvidence = await checkDuplicateEvidence(evidenceData.titulo, evidenceData.ano);

    if (existingEvidence) {
      logger.acquisition(`Duplicate evidence detected: "${evidenceData.titulo}" (${evidenceData.ano})`);

      return res.render('index', {
        pageTitle: 'Entrada de Dados',
        contextName: 'Entrada de Dados Etnobotânicos',
        contextDescription: 'Cadastro de evidências científicas com dados de comunidades e plantas',
        showNavigation: true,
        errors: [`Evidência duplicada: Já existe uma evidência com o título "${evidenceData.titulo}" e ano ${evidenceData.ano} na base de dados.`],
        formData: req.body
      });
    }

    // Filter empty plants before saving (only after validation passes)
    evidenceData.comunidades = evidenceData.comunidades.map(com => ({
      ...com,
      plantas: filterEmptyPlants(com.plantas)
    }));

    // Insert evidence into database
    const inserted = await insertEvidence(evidenceData);

    logger.acquisition(`Evidence inserted successfully: ${inserted.id}`);

    // Render success page
    res.render('success', {
      pageTitle: 'Sucesso',
      contextName: 'Entrada de Dados Etnobotânicos',
      contextDescription: 'Cadastro de evidências científicas',
      showNavigation: true,
      evidenceId: inserted.id
    });

  } catch (error) {
    logger.error('Failed to submit evidence:', error.message);

    res.render('index', {
      pageTitle: 'Entrada de Dados',
      contextName: 'Entrada de Dados Etnobotânicos',
      contextDescription: 'Cadastro de evidências científicas',
      showNavigation: true,
      errors: ['Erro ao salvar: ' + error.message],
      formData: req.body
    });
  }
});

/**
 * Filter out empty plants (plants without any names)
 * @param {Array} plantas - Array of plants
 * @returns {Array} Filtered array of plants
 */
function filterEmptyPlants(plantas) {
  return plantas.filter(plant => {
    const hasScientificName = Array.isArray(plant.nomeCientifico) &&
      plant.nomeCientifico.some(n => n && typeof n === 'string' && n.trim().length > 0);

    const hasVernacularName = Array.isArray(plant.nomeVernacular) &&
      plant.nomeVernacular.some(n => n && typeof n === 'string' && n.trim().length > 0);

    return hasScientificName || hasVernacularName;
  });
}

/**
 * Parse form data into evidence structure
 * Handles nested arrays from HTML form (comunidades[0][plantas][0][field])
 * Converts comma-separated strings to arrays
 */
function parseFormData(formData) {
  // Check if comunidades is already parsed as JSON array
  if (Array.isArray(formData.comunidades)) {

    // Data is already in the correct format (sent as JSON)
    const evidence = {
      titulo: formData.titulo?.trim() || '',
      autores: parseCommaSeparated(formData.autores).map(formatAuthorABNT),
      ano: parseInt(formData.ano) || 0,
      resumo: formData.resumo?.trim() || '',
      DOI: formData.DOI?.trim() || '',
      fonte: 'etnodb',
      comunidades: formData.comunidades.map(com => ({
        nome: com.nome?.trim() || '',
        tipo: com.tipo?.trim() || '',
        municipio: com.municipio?.trim() || '',
        estado: formatStateName(com.estado || ''),
        local: com.local?.trim() || '',
        atividadesEconomicas: Array.isArray(com.atividadesEconomicas)
          ? com.atividadesEconomicas
          : parseCommaSeparated(com.atividadesEconomicas),
        observacoes: com.observacoes?.trim() || '',
        plantas: (com.plantas || []).map(p => ({
          nomeCientifico: Array.isArray(p.nomeCientifico)
            ? p.nomeCientifico
            : parseCommaSeparated(p.nomeCientifico),
          nomeVernacular: (Array.isArray(p.nomeVernacular)
            ? p.nomeVernacular
            : parseCommaSeparated(p.nomeVernacular)).map(formatVernacularName),
          tipoUso: Array.isArray(p.tipoUso)
            ? p.tipoUso
            : parseCommaSeparated(p.tipoUso)
        }))  // Don't filter here - let validation catch empty plants
      }))
    };

    return evidence;
  }

  // Original parsing for form-urlencoded format
  const evidence = {
    titulo: formData.titulo?.trim() || '',
    autores: parseCommaSeparated(formData.autores).map(formatAuthorABNT),
    ano: parseInt(formData.ano) || 0,
    resumo: formData.resumo?.trim() || '',
    DOI: formData.DOI?.trim() || '',
    fonte: 'etnodb',
    comunidades: []
  };

  // Parse communities (nested structure)
  const comunidadesData = {};

  // Extract all community-related fields from flat form data
  Object.keys(formData).forEach(key => {
    const match = key.match(/^comunidades\[(\d+)\]\[(.+)\]$/);
    if (match) {
      const [, index, field] = match;
      const idx = parseInt(index);

      if (!comunidadesData[idx]) {
        comunidadesData[idx] = { plantas: {} };
      }

      // Check if it's a plant field
      const plantMatch = field.match(/^plantas\]\[(\d+)\]\[(.+)$/);
      if (plantMatch) {
        const [, plantIndex, plantField] = plantMatch;
        const pIdx = parseInt(plantIndex);

        if (!comunidadesData[idx].plantas[pIdx]) {
          comunidadesData[idx].plantas[pIdx] = {};
        }

        comunidadesData[idx].plantas[pIdx][plantField] = formData[key];
      } else {
        // Community field
        comunidadesData[idx][field] = formData[key];
      }
    }
  });

  // Convert to array structure
  Object.keys(comunidadesData).sort().forEach(idx => {
    const comunidade = comunidadesData[idx];

    // Parse plants array
    const plantas = [];
    Object.keys(comunidade.plantas).sort().forEach(pIdx => {
      const plant = comunidade.plantas[pIdx];

      plantas.push({
        nomeCientifico: parseCommaSeparated(plant.nomeCientifico),
        nomeVernacular: parseCommaSeparated(plant.nomeVernacular).map(formatVernacularName),
        tipoUso: parseCommaSeparated(plant.tipoUso)
      });
    });

    evidence.comunidades.push({
      nome: comunidade.nome?.trim() || '',
      tipo: comunidade.tipo?.trim() || '',
      municipio: comunidade.municipio?.trim() || '',
      estado: formatStateName(comunidade.estado || ''),
      local: comunidade.local?.trim() || '',
      atividadesEconomicas: parseCommaSeparated(comunidade.atividadesEconomicas),
      observacoes: comunidade.observacoes?.trim() || '',
      plantas: plantas  // Don't filter here - let validation catch empty plants
    });
  });

  return evidence;
}

/**
 * Convert comma-separated string to array
 * @param {string} str - Comma-separated string
 * @returns {Array<string>} Array of trimmed strings
 */
function parseCommaSeparated(str) {
  if (!str || typeof str !== 'string') return [];

  return str
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * Format vernacular names to lowercase with hyphens
 * @param {string} name - Vernacular name
 * @returns {string} Formatted vernacular name
 */
function formatVernacularName(name) {
  if (!name || typeof name !== 'string') return '';

  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

/**
 * Convert state abbreviation to full name
 * @param {string} state - State abbreviation or full name
 * @returns {string} Full state name
 */
function formatStateName(state) {
  if (!state || typeof state !== 'string') return '';

  const stateMap = {
    'AC': 'Acre',
    'AL': 'Alagoas',
    'AP': 'Amapá',
    'AM': 'Amazonas',
    'BA': 'Bahia',
    'CE': 'Ceará',
    'DF': 'Distrito Federal',
    'ES': 'Espírito Santo',
    'GO': 'Goiás',
    'MA': 'Maranhão',
    'MT': 'Mato Grosso',
    'MS': 'Mato Grosso do Sul',
    'MG': 'Minas Gerais',
    'PA': 'Pará',
    'PB': 'Paraíba',
    'PR': 'Paraná',
    'PE': 'Pernambuco',
    'PI': 'Piauí',
    'RJ': 'Rio de Janeiro',
    'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul',
    'RO': 'Rondônia',
    'RR': 'Roraima',
    'SC': 'Santa Catarina',
    'SP': 'São Paulo',
    'SE': 'Sergipe',
    'TO': 'Tocantins'
  };

  const trimmed = state.trim().toUpperCase();

  // If it's a known abbreviation, convert it
  if (stateMap[trimmed]) {
    return stateMap[trimmed];
  }

  // Otherwise, return as-is (might already be full name)
  return state.trim();
}

/**
 * Convert author name to ABNT format
 * Format: SOBRENOME, N.
 * @param {string} author - Author name in any format
 * @returns {string} Author name in ABNT format
 */
function formatAuthorABNT(author) {
  if (!author || typeof author !== 'string') return '';

  author = author.trim();
  if (author.length === 0) return '';

  // Check if already in format "SOBRENOME, Nome" or "Sobrenome, Nome"
  if (author.includes(',')) {
    const [lastName, firstName] = author.split(',').map(part => part.trim());

    if (!firstName || firstName.length === 0) {
      // Only last name provided
      return lastName.toUpperCase();
    }

    // Extract first letter of first name
    const firstInitial = firstName.charAt(0).toUpperCase();
    return `${lastName.toUpperCase()}, ${firstInitial}.`;
  }

  // Format: "Nome Sobrenome" - need to reverse
  const parts = author.split(/\s+/).filter(p => p.length > 0);

  if (parts.length === 1) {
    // Only one word - treat as last name
    return parts[0].toUpperCase();
  }

  // Last part is the last name, rest is first names
  const lastName = parts[parts.length - 1];
  const firstNames = parts.slice(0, -1);
  const firstInitial = firstNames[0].charAt(0).toUpperCase();

  return `${lastName.toUpperCase()}, ${firstInitial}.`;
}

module.exports = router;

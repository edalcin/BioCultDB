/**
 * Presentation Context Routes
 *
 * Routes for public search interface:
 * - GET /: Search page with filters and results
 */

const express = require('express');
const router = express.Router();
const { searchEvidences, findEvidenceById } = require('../../services/database');
const { Status } = require('../../models/Evidence');
const logger = require('../../shared/logger');
const {
  getTopPlants,
  getCommunityCount,
  getEvidenceCountByStatus,
  getTopAuthors,
  getEvidencesByState,
  getCommunitiesByState,
  getPlantsByState,
  getTopCommunitiesByPlants,
  getTopEvidencesByCommunities,
  getTopEvidencesByPlants,
  getPublicationsByYear,
  getSankeyData
} = require('../../services/statistics');
const database = require('../../shared/database');
const config = require('../../shared/config');

/**
 * GET /health - Health check endpoint
 * Returns database connection status and basic statistics
 */
router.get('/health', async (req, res) => {
  try {
    const conn = database.getConnection();
    const countByStatus = (status) =>
      conn.prepare(`SELECT COUNT(*) as n FROM ${database.TABLE} WHERE status = ?`).get(status).n;

    const stats = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        path: config.sqlitePath,
        table: database.TABLE
      },
      evidences: {
        total: conn.prepare(`SELECT COUNT(*) as n FROM ${database.TABLE}`).get().n,
        approved: countByStatus(Status.APPROVED),
        pending: countByStatus(Status.PENDING),
        rejected: countByStatus(Status.REJECTED)
      }
    };

    res.json(stats);
  } catch (error) {
    logger.error('Health check failed:', error.message);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      message: 'Database connection failed'
    });
  }
});

/**
 * GET / - Main search page with filters
 * Query parameters:
 * - comunidade: Community name (partial match)
 * - planta: Plant name - scientific or vernacular (partial match)
 * - estado: State (exact match)
 * - municipio: Municipality (exact match)
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 50)
 */
router.get('/', async (req, res) => {
  try {
    const {
      q,
      tipo,
      comunidade,
      planta,
      estado,
      municipio,
      page = 1,
      limit = 50
    } = req.query;

    // Build structured search query (FTS5 free-text + whitelisted json_extract conditions)
    const query = buildSearchQuery({
      q,
      tipo,
      comunidade,
      planta,
      estado,
      municipio
    });

    logger.presentation('Search query:', JSON.stringify(query));

    // Execute search with pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    const searchResult = await searchEvidences(query, pageNum, limitNum);

    logger.presentation(
      `Search returned ${searchResult.evidences.length} of ${searchResult.total} evidences (page ${pageNum})`
    );

    // Render search page with results
    res.render('index', {
      pageTitle: 'Busca Pública',
      contextName: 'Busca de Dados Etnobotânicos',
      contextDescription: 'Conheça a relação de comunidades tradicionais com suas plantas',
      showNavigation: true,
      filters: {
        q: q || '',
        tipo: tipo || '',
        comunidade: comunidade || '',
        planta: planta || '',
        estado: estado || '',
        municipio: municipio || ''
      },
      results: searchResult.evidences,
      pagination: {
        page: searchResult.page,
        limit: searchResult.limit,
        total: searchResult.total,
        totalPages: searchResult.totalPages,
        hasNext: searchResult.page < searchResult.totalPages,
        hasPrev: searchResult.page > 1
      }
    });

  } catch (error) {
    logger.error('Search failed:', error.message);

    res.render('index', {
      pageTitle: 'Busca Pública',
      contextName: 'Busca de Dados Etnobotânicos',
      contextDescription: 'Conheça a relação de comunidades tradicionais com suas plantas',
      showNavigation: true,
      filters: {
        q: '',
        tipo: '',
        comunidade: '',
        planta: '',
        estado: '',
        municipio: ''
      },
      results: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      },
      error: 'Erro ao realizar busca: ' + error.message
    });
  }
});

/**
 * GET /referencia/:id - Standalone evidence detail page (for BioCultTermos source links).
 * Path intentionally NOT renamed to /evidencia/:id — it is a hardcoded cross-repo contract
 * (bioculttermos/backend/src/contexts/admin/views/partials/source-list.ejs) (ADR-002 D13).
 */
router.get('/referencia/:id', async (req, res, next) => {
  try {
    const evidence = await findEvidenceById(req.params.id);
    if (!evidence || evidence.status !== Status.APPROVED) {
      return res.status(404).render('index', {
        pageTitle: 'Busca Pública',
        contextName: 'Busca de Dados Etnobotânicos',
        contextDescription: 'Conheça a relação de comunidades tradicionais com suas plantas',
        showNavigation: true,
        filters: { q: '', tipo: '', comunidade: '', planta: '', estado: '', municipio: '' },
        results: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        error: 'Evidência não encontrada'
      });
    }
    res.render('evidence-detail', {
      pageTitle: evidence.titulo,
      contextName: 'Detalhe da Evidência',
      contextDescription: '',
      evidence
    });
  } catch (error) {
    logger.error('Failed to load evidence detail:', error.message);
    next(error);
  }
});

/**
 * Build a structured search query consumed by searchEvidences(query, page, limit)
 * (see services/database.js). Free text (`filters.q`) becomes an FTS5 MATCH search
 * against `biocultdb_records_fts`; every other filter becomes an AND-ed condition
 * resolved by the data layer against a whitelisted json_extract/json_each path —
 * this layer never builds raw SQL, it only names whitelisted fields and values.
 *
 * @param {Object} filters - Search filters
 * @returns {Object} Structured query: { status, text?, conditions? }
 */
function buildSearchQuery(filters) {
  const query = {
    status: Status.APPROVED // Only show approved evidences
  };

  const conditions = [];

  // Google-like search (full-text search across titulo/autores/resumo/DOI/comunidades via FTS5)
  if (filters.q && filters.q.trim().length > 0) {
    query.text = filters.q.trim();
  }

  // Community type filter (exact match, case-insensitive)
  if (filters.tipo && filters.tipo.trim().length > 0) {
    conditions.push({ fields: ['comunidades.tipo'], op: 'eq', value: filters.tipo.trim() });
  }

  // Community name filter (case-insensitive partial match)
  if (filters.comunidade && filters.comunidade.trim().length > 0) {
    conditions.push({ fields: ['comunidades.nome'], op: 'contains', value: filters.comunidade.trim() });
  }

  // Plant name filter (scientific OR vernacular, case-insensitive partial match)
  if (filters.planta && filters.planta.trim().length > 0) {
    conditions.push({
      fields: ['comunidades.plantas.nomeCientifico', 'comunidades.plantas.nomeVernacular'],
      op: 'contains',
      value: filters.planta.trim()
    });
  }

  // State filter (exact match, case-insensitive)
  if (filters.estado && filters.estado.trim().length > 0) {
    conditions.push({ fields: ['comunidades.estado'], op: 'eq', value: filters.estado.trim() });
  }

  // Municipality filter (exact match, case-insensitive)
  if (filters.municipio && filters.municipio.trim().length > 0) {
    conditions.push({ fields: ['comunidades.municipio'], op: 'eq', value: filters.municipio.trim() });
  }

  if (conditions.length > 0) {
    query.conditions = conditions;
  }

  return query;
}


/**
 * GET /painel - Dashboard page
 */
router.get('/painel', (req, res) => {
  try {
    res.render('painel', {
      pageTitle: 'Painel de Estatísticas',
      contextName: 'Painel de Informações',
      contextDescription: 'Visualize estatísticas e métricas sobre as evidências, comunidades e sua relação com as plantas',
      showNavigation: true
    });
  } catch (error) {
    logger.error('Dashboard failed:', error.message);
    res.render('error', {
      message: 'Erro ao carregar painel',
      error: error
    });
  }
});

/**
 * Build filters object from query parameters
 * @param {Object} params - Query parameters
 * @returns {Object} Query filters (consumed by services/statistics.js)
 */
function buildFilters({ estado, tipo, anoInicio, anoFim }) {
  const filters = { status: Status.APPROVED };

  if (estado) {
    filters['comunidades.estado'] = estado;
  }

  if (tipo) {
    filters['comunidades.tipo'] = tipo;
  }

  if (anoInicio || anoFim) {
    filters.ano = {};
    if (anoInicio) filters.ano.$gte = parseInt(anoInicio);
    if (anoFim) filters.ano.$lte = parseInt(anoFim);
  }

  return filters;
}

/**
 * GET /painel/api/stats/top-plants
 * Top N plantas mais utilizadas
 */
router.get('/painel/api/stats/top-plants', async (req, res) => {
  try {
    const { limit = 10, estado, tipo, anoInicio, anoFim } = req.query;
    const filters = buildFilters({ estado, tipo, anoInicio, anoFim });
    const result = await getTopPlants(parseInt(limit), filters);
    res.json(result);
  } catch (error) {
    logger.error('Top plants stats failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /painel/api/stats/community-count
 * Total de comunidades cadastradas
 */
router.get('/painel/api/stats/community-count', async (req, res) => {
  try {
    const { estado, tipo, anoInicio, anoFim } = req.query;
    const filters = buildFilters({ estado, tipo, anoInicio, anoFim });
    const result = await getCommunityCount(filters);
    res.json(result);
  } catch (error) {
    logger.error('Community count failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /painel/api/stats/evidence-count
 * Total de evidências por status
 */
router.get('/painel/api/stats/evidence-count', async (req, res) => {
  try {
    const { estado, tipo, anoInicio, anoFim } = req.query;
    const filters = buildFilters({ estado, tipo, anoInicio, anoFim });
    const result = await getEvidenceCountByStatus(filters);
    res.json(result);
  } catch (error) {
    logger.error('Evidence count failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /painel/api/stats/top-authors
 * Top autores com mais publicações
 */
router.get('/painel/api/stats/top-authors', async (req, res) => {
  try {
    const { limit = 10, estado, tipo, anoInicio, anoFim } = req.query;
    const filters = buildFilters({ estado, tipo, anoInicio, anoFim });
    const result = await getTopAuthors(parseInt(limit), filters);
    res.json(result);
  } catch (error) {
    logger.error('Top authors failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /painel/api/stats/evidences-by-state
 * Número de evidências por estado (para mapa de calor)
 */
router.get('/painel/api/stats/evidences-by-state', async (req, res) => {
  try {
    const { tipo, anoInicio, anoFim } = req.query;
    const filters = buildFilters({ tipo, anoInicio, anoFim });
    const result = await getEvidencesByState(filters);
    res.json(result);
  } catch (error) {
    logger.error('Evidences by state failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /painel/api/stats/plants-by-state
 * Número de plantas por estado (para mapa de calor)
 */
router.get('/painel/api/stats/plants-by-state', async (req, res) => {
  try {
    const { tipo, anoInicio, anoFim } = req.query;
    const filters = buildFilters({ tipo, anoInicio, anoFim });
    const result = await getPlantsByState(filters);
    res.json(result);
  } catch (error) {
    logger.error('Plants by state failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /painel/api/stats/communities-by-state
 * Número de comunidades por estado (para mapa de calor)
 */
router.get('/painel/api/stats/communities-by-state', async (req, res) => {
  try {
    const { tipo, anoInicio, anoFim } = req.query;
    const filters = buildFilters({ tipo, anoInicio, anoFim });
    const result = await getCommunitiesByState(filters);
    res.json(result);
  } catch (error) {
    logger.error('Communities by state failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /painel/api/stats/top-communities
 * Comunidades com maior uso de plantas
 */
router.get('/painel/api/stats/top-communities', async (req, res) => {
  try {
    const { limit = 10, estado, tipo, anoInicio, anoFim } = req.query;
    const filters = buildFilters({ estado, tipo, anoInicio, anoFim });
    const result = await getTopCommunitiesByPlants(parseInt(limit), filters);
    res.json(result);
  } catch (error) {
    logger.error('Top communities failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /painel/api/stats/evidences-by-communities
 * Evidências com mais comunidades relatadas
 */
router.get('/painel/api/stats/evidences-by-communities', async (req, res) => {
  try {
    const { limit = 10, estado, tipo, anoInicio, anoFim } = req.query;
    const filters = buildFilters({ estado, tipo, anoInicio, anoFim });
    const result = await getTopEvidencesByCommunities(parseInt(limit), filters);
    res.json(result);
  } catch (error) {
    logger.error('Evidences by communities failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /painel/api/stats/evidences-by-plants
 * Evidências com mais plantas relatadas
 */
router.get('/painel/api/stats/evidences-by-plants', async (req, res) => {
  try {
    const { limit = 10, estado, tipo, anoInicio, anoFim } = req.query;
    const filters = buildFilters({ estado, tipo, anoInicio, anoFim });
    const result = await getTopEvidencesByPlants(parseInt(limit), filters);
    res.json(result);
  } catch (error) {
    logger.error('Evidences by plants failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /painel/api/stats/publications-by-year
 * Número de publicações por ano (para gráfico temporal)
 */
router.get('/painel/api/stats/publications-by-year', async (req, res) => {
  try {
    const { estado, tipo, anoInicio, anoFim } = req.query;
    const filters = buildFilters({ estado, tipo, anoInicio, anoFim });
    const result = await getPublicationsByYear(filters);
    res.json(result);
  } catch (error) {
    logger.error('Publications by year failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /painel/api/stats/sankey
 * Dados para diagrama Sankey: tipo de comunidade -> tipo de uso
 * Query params:
 * - limitUsos: número de top tipos de uso a exibir (default: 10)
 */
router.get('/painel/api/stats/sankey', async (req, res) => {
  try {
    const { estado, tipo, anoInicio, anoFim, limitUsos = 10 } = req.query;
    const filters = buildFilters({ estado, tipo, anoInicio, anoFim });
    const result = await getSankeyData(filters, parseInt(limitUsos));
    res.json(result);
  } catch (error) {
    logger.error('Sankey data failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Import etnoChat service
const etnochatService = require('./services/etnochat');

/**
 * GET /etnochat - AI Chat interface
 */
router.get('/etnochat', (req, res) => {
  res.render('etnochat', {
    pageTitle: 'etnoChat',
    contextName: 'etnoChat',
    contextDescription: 'Converse com a IA sobre dados etnobotanicos',
    showNavigation: true
  });
});

/**
 * GET /etnochat/api/providers - List available AI providers
 */
router.get('/etnochat/api/providers', (req, res) => {
  res.json(etnochatService.getProviders());
});

/**
 * POST /etnochat/api/validate-key - Validate API key
 */
router.post('/etnochat/api/validate-key', async (req, res) => {
  try {
    const { provider, apiKey, model } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({
        valid: false,
        error: 'Provider e apiKey sao obrigatorios'
      });
    }

    const result = await etnochatService.validateApiKey(provider, apiKey, model);
    res.json(result);
  } catch (error) {
    logger.error('Validate key error:', error.message);
    res.status(500).json({
      valid: false,
      error: 'Erro ao validar chave'
    });
  }
});

/**
 * GET /etnochat/api/models - List available models for a provider
 */
router.get('/etnochat/api/models', (req, res) => {
  const { provider } = req.query;

  if (!provider) {
    return res.status(400).json({ error: 'Provider e obrigatorio' });
  }

  const models = etnochatService.getModels(provider);
  res.json(models);
});

/**
 * POST /etnochat/api/chat - Chat with AI (SSE streaming)
 */
router.post('/etnochat/api/chat', async (req, res) => {
  try {
    const { provider, apiKey, model, messages } = req.body;

    if (!provider || !apiKey || !model || !messages) {
      return res.status(400).json({
        error: 'provider, apiKey, model e messages sao obrigatorios'
      });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Stream the response
    await etnochatService.streamChat({
      provider,
      apiKey,
      model,
      messages,
      onText: (text) => {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      },
      onEnd: () => {
        res.write('data: [DONE]\n\n');
        res.end();
      },
      onError: (error) => {
        logger.error('Chat stream error:', error.message);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    });
  } catch (error) {
    logger.error('Chat error:', error.message);
    res.write(`data: ${JSON.stringify({ error: 'Erro ao processar mensagem' })}\n\n`);
    res.end();
  }
});

module.exports = router;

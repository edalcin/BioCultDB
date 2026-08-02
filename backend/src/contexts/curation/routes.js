/**
 * Curation Context Routes
 *
 * Routes for data curation workflow:
 * - GET /: List all evidences with status filter
 * - GET /evidence/edit/:id: Edit evidence form
 * - PUT /evidence/update/:id: Update evidence content
 * - POST /evidence/status/:id: Update evidence status only
 * - POST /evidence/delete/:id: Delete evidence
 * - POST /evidence/:id/community/add: Add community fragment (HTMX)
 * - POST /evidence/:id/plant/add/:communityIndex: Add plant fragment (HTMX)
 */

const express = require('express');
const router = express.Router();
const { findEvidences, findEvidenceById, updateEvidenceById, updateEvidenceStatus, deleteEvidenceById } = require('../../services/database');
const { validateEvidence } = require('../../services/validation');
const { Status } = require('../../models/Evidence');
const logger = require('../../shared/logger');

/**
 * GET / - List all evidences with optional status filter and sorting
 */
router.get('/', async (req, res) => {
  try {
    const { status, origem, page = 1, limit = 50, sort = 'createdAt', order = 'desc' } = req.query;

    // Build query
    const query = {};
    if (status && status !== 'all' && Object.values(Status).includes(status)) {
      query.status = status;
    }
    // "Origem" filter (ticket 05): "ia" groups every `extração IA — <provedor>/<modelo>`
    // fonte via substring match; any other value is an exact `fonte` match.
    if (origem && origem !== 'all') {
      if (origem === 'ia') {
        query.fonteContains = 'extração IA';
      } else {
        query.fonte = origem;
      }
    }

    // Build sort object
    const validSortFields = ['titulo', 'autores', 'ano', 'status', 'createdAt'];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortOrder };

    // Fetch evidences with pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const evidences = await findEvidences(query, {
      limit: limitNum,
      skip,
      sort: sortObj,
      projection: {
        titulo: 1,
        autores: 1,
        ano: 1,
        status: 1,
        fonte: 1,
        createdAt: 1,
        updatedAt: 1
      }
    });

    logger.curation(`Listing ${evidences.length} evidences (status: ${status || 'all'}, origem: ${origem || 'all'}, sort: ${sortField} ${order})`);
    if (evidences.length > 0) {
      logger.curation(`First evidence ID: ${evidences[0].id}, title: ${evidences[0].titulo}`);
    }

    res.render('index', {
      pageTitle: 'Curadoria',
      contextName: 'Curadoria de Dados Etnobotânicos',
      contextDescription: 'Revisão e aprovação de evidências científicas',
      showNavigation: true,
      evidences,
      statusFilter: status || 'all',
      origemFilter: origem || 'all',
      sortField,
      sortOrder: order,
      success: req.query.success === 'true'
    });

  } catch (error) {
    logger.error('Failed to list evidences:', error.message);

    res.render('index', {
      pageTitle: 'Curadoria',
      contextName: 'Curadoria de Dados Etnobotânicos',
      contextDescription: 'Revisão e aprovação de evidências científicas',
      showNavigation: true,
      evidences: [],
      statusFilter: 'all',
      origemFilter: 'all',
      sortField: 'createdAt',
      sortOrder: 'desc',
      success: false,
      error: 'Erro ao listar evidências: ' + error.message
    });
  }
});

/**
 * GET /evidence/edit/:id - Edit evidence form
 */
router.get('/evidence/edit/:id', async (req, res) => {
  try {
    logger.curation(`=== GET EDIT PAGE ===`);
    logger.curation(`Requested evidence ID: ${req.params.id}`);
    logger.curation(`ID length: ${req.params.id.length}, type: ${typeof req.params.id}`);

    const evidence = await findEvidenceById(req.params.id);

    if (!evidence) {
      logger.error(`Evidence ${req.params.id} NOT FOUND when loading edit page`);
      return res.status(404).render('error', {
        message: 'Evidência não encontrada',
        error: {}
      });
    }

    logger.curation(`Evidence found: ${evidence.id}`);
    logger.curation(`Evidence has ${evidence.comunidades.length} communities`);
    logger.curation(`Evidence title: ${evidence.titulo}`);

    res.render('edit', {
      pageTitle: 'Editar Evidência',
      contextName: 'Curadoria de Dados Etnobotânicos',
      contextDescription: 'Edição de evidência científica',
      showNavigation: true,
      evidence,
      errors: null
    });

  } catch (error) {
    logger.error(`Failed to load evidence ${req.params.id} for editing:`, error.message);
    logger.error(`Stack:`, error.stack);

    res.status(500).render('error', {
      message: 'Erro ao carregar evidência: ' + error.message,
      error: {}
    });
  }
});

/**
 * PUT /evidence/update/:id - Update evidence content
 */
router.put('/evidence/update/:id', async (req, res) => {
  await handleEvidenceUpdate(req, res);
});

/**
 * POST /evidence/update/:id - Update evidence content (alternative method)
 */
router.post('/evidence/update/:id', async (req, res) => {
  await handleEvidenceUpdate(req, res);
});

/**
 * Handle evidence update (shared logic for PUT and POST)
 */
async function handleEvidenceUpdate(req, res) {
  try {
    logger.curation(`=== UPDATE EVIDENCE START ===`);
    logger.curation(`Evidence ID from params: ${req.params.id}`);
    logger.curation(`Request method: ${req.method}`);

    // Parse form data
    const evidenceData = parseFormData(req.body);

    // Validate evidence data
    const validation = validateEvidence(evidenceData);

    if (!validation.isValid) {
      logger.curation(`Validation failed: ${validation.errors.length} errors`);
      logger.curation(`Fetching evidence ${req.params.id} from database to preserve data...`);

      const evidence = await findEvidenceById(req.params.id);

      if (!evidence) {
        logger.error(`Evidence ${req.params.id} NOT FOUND in database during validation error handling`);
      } else {
        logger.curation(`Evidence ${req.params.id} found in database, has ${evidence.comunidades.length} communities`);
      }

      // Preserve original data when validation fails to avoid data loss
      // Only update metadata fields, keep communities from form data if they exist
      const preservedEvidence = {
        ...evidence,
        titulo: evidenceData.titulo || evidence.titulo,
        autores: evidenceData.autores || evidence.autores,
        ano: evidenceData.ano || evidence.ano,
        resumo: evidenceData.resumo !== undefined ? evidenceData.resumo : evidence.resumo,
        DOI: evidenceData.DOI !== undefined ? evidenceData.DOI : evidence.DOI,
        // Keep communities from form if they exist, otherwise use original
        comunidades: (evidenceData.comunidades && evidenceData.comunidades.length > 0)
          ? evidenceData.comunidades
          : evidence.comunidades,
        id: evidence.id
      };

      return res.render('edit', {
        pageTitle: 'Editar Evidência',
        contextName: 'Curadoria de Dados Etnobotânicos',
        contextDescription: 'Edição de evidência científica',
        showNavigation: true,
        evidence: preservedEvidence,
        errors: validation.errors
      });
    }

    // Filter empty plants before saving (only after validation passes)
    logger.curation(`Validation passed. Filtering empty plants and updating evidence ${req.params.id}...`);
    evidenceData.comunidades = evidenceData.comunidades.map(com => ({
      ...com,
      plantas: filterEmptyPlants(com.plantas)
    }));

    logger.curation(`Calling updateEvidenceById for ${req.params.id} with ${evidenceData.comunidades.length} communities`);

    // Update evidence
    const updated = await updateEvidenceById(req.params.id, evidenceData);

    if (!updated) {
      logger.error(`updateEvidenceById returned null/undefined for ${req.params.id}`);
    } else {
      logger.curation(`Evidence updated successfully: ${updated.id}`);
    }

    // Redirect to list with success message
    res.redirect('/?success=true');

  } catch (error) {
    logger.error(`=== UPDATE EVIDENCE ERROR ===`);
    logger.error(`Failed to update evidence ${req.params.id}:`, error.message);
    logger.error(`Error stack:`, error.stack);

    logger.curation(`Fetching evidence ${req.params.id} to show error page...`);
    const evidence = await findEvidenceById(req.params.id);

    if (!evidence) {
      logger.error(`Evidence ${req.params.id} NOT FOUND when trying to show error page`);
      return res.status(404).render('error', {
        message: 'Evidência não encontrada',
        error: {}
      });
    }

    logger.curation(`Rendering error page for evidence ${req.params.id}`);
    res.render('edit', {
      pageTitle: 'Editar Evidência',
      contextName: 'Curadoria de Dados Etnobotânicos',
      contextDescription: 'Edição de evidência científica',
      showNavigation: true,
      evidence,
      errors: ['Erro ao atualizar: ' + error.message]
    });
  }
}

/**
 * POST /evidence/status/:id - Update evidence status only
 */
router.post('/evidence/status/:id', async (req, res) => {
  try {
    const { status, justificativaRejeicao } = req.body;

    if (!status || !Object.values(Status).includes(status)) {
      throw new Error('Status inválido');
    }

    // Justificativa só é salva quando o status é "rejected"
    const justificativa = status === Status.REJECTED ? (justificativaRejeicao?.trim() || null) : null;

    const updated = await updateEvidenceStatus(req.params.id, status, justificativa);

    logger.curation(`Evidence status updated to "${status}": ${updated.id}`);

    // Redirect back to edit page
    res.redirect(`/evidence/edit/${req.params.id}`);

  } catch (error) {
    logger.error('Failed to update status:', error.message);

    res.status(500).render('error', {
      message: 'Erro ao atualizar status: ' + error.message,
      error: {}
    });
  }
});

/**
 * POST /evidence/delete/:id - Delete evidence
 */
router.post('/evidence/delete/:id', async (req, res) => {
  try {
    logger.curation(`Deleting evidence: ${req.params.id}`);

    const deleted = await deleteEvidenceById(req.params.id);

    if (!deleted) {
      logger.error(`Evidence ${req.params.id} not found for deletion`);
      return res.status(404).render('error', {
        message: 'Evidência não encontrada',
        error: {}
      });
    }

    logger.curation(`Evidence deleted successfully: ${req.params.id}`);

    // Redirect to list with success message
    res.redirect('/?success=true');

  } catch (error) {
    logger.error('Failed to delete evidence:', error.message);

    res.status(500).render('error', {
      message: 'Erro ao deletar evidência: ' + error.message,
      error: {}
    });
  }
});

/**
 * POST /evidence/:id/community/add - Add community form fragment (HTMX)
 */
router.post('/evidence/:id/community/add', (req, res) => {
  const communityIndex = parseInt(req.body.communityIndex) || 0;

  logger.curation(`Adding community form fragment #${communityIndex}`);

  res.render('partials/community-form', {
    communityIndex,
    community: null,
    evidenceId: req.params.id
  });
});

/**
 * POST /evidence/:id/plant/add/:communityIndex - Add plant form fragment (HTMX)
 */
router.post('/evidence/:id/plant/add/:communityIndex', (req, res) => {
  const communityIndex = parseInt(req.params.communityIndex);
  const plantIndex = parseInt(req.body.plantIndex) || 0;

  logger.curation(`Adding plant form fragment to community #${communityIndex}, plant #${plantIndex}`);

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
 * Handles both pre-parsed (Express urlencoded with extended:true) and raw form data
 */
function parseFormData(formData) {
  // Check if Express already parsed comunidades as array (extended: true)
  if (Array.isArray(formData.comunidades)) {
    logger.curation(`parseFormData: Data already parsed as array by Express`);

    // Data is already in the correct format (parsed by Express urlencoded)
    const evidence = {
      titulo: formData.titulo?.trim() || '',
      autores: parseCommaSeparated(formData.autores),
      ano: parseInt(formData.ano) || 0,
      resumo: formData.resumo?.trim() || '',
      DOI: formData.DOI?.trim() || '',
      status: formData.status || Status.PENDING,
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

    logger.curation(`parseFormData: Parsed ${evidence.comunidades.length} communities from Express array`);
    return evidence;
  }

  // Original parsing for non-pre-parsed data
  logger.curation(`parseFormData: Using regex-based parsing`);
  const evidence = {
    titulo: formData.titulo?.trim() || '',
    autores: parseCommaSeparated(formData.autores),
    ano: parseInt(formData.ano) || 0,
    resumo: formData.resumo?.trim() || '',
    DOI: formData.DOI?.trim() || '',
    status: formData.status || Status.PENDING,
    comunidades: []
  };

  const comunidadesData = {};
  let matchedKeys = 0;

  Object.keys(formData).forEach(key => {
    const match = key.match(/^comunidades\[(\d+)\]\[(.+)\]$/);
    if (match) {
      matchedKeys++;
      const [, index, field] = match;
      const idx = parseInt(index);

      if (!comunidadesData[idx]) {
        comunidadesData[idx] = { plantas: {} };
      }

      const plantMatch = field.match(/^plantas\]\[(\d+)\]\[(.+)$/);
      if (plantMatch) {
        const [, plantIndex, plantField] = plantMatch;
        const pIdx = parseInt(plantIndex);

        if (!comunidadesData[idx].plantas[pIdx]) {
          comunidadesData[idx].plantas[pIdx] = {};
        }

        comunidadesData[idx].plantas[pIdx][plantField] = formData[key];
      } else {
        comunidadesData[idx][field] = formData[key];
      }
    }
  });

  Object.keys(comunidadesData).sort().forEach(idx => {
    const comunidade = comunidadesData[idx];

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

  logger.curation(`parseFormData: matched ${matchedKeys} keys, created ${evidence.comunidades.length} communities`);
  return evidence;
}

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

module.exports = router;

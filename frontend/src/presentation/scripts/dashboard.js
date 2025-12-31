/**
 * Dashboard JavaScript
 * Handles Google Charts initialization and data loading
 */

// Load Google Charts
google.charts.load('current', {
  'packages': ['corechart', 'geochart', 'table']
});

google.charts.setOnLoadCallback(loadDashboardData);

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
  const filters = getFilters();

  console.log('=== Dashboard Load Start ===');
  console.log('Dashboard filters:', filters);
  console.log('Loading dashboard data...');

  try {
    console.log('Loading summary cards...');
    await loadSummaryCards(filters);
    console.log('✓ Summary cards loaded');

    console.log('Loading maps...');
    await loadMaps(filters);
    console.log('✓ Maps loaded');

    console.log('Loading charts...');
    await loadCharts(filters);
    console.log('✓ Charts loaded');

    console.log('Loading tables...');
    await loadTables(filters);
    console.log('✓ Tables loaded');

    console.log('=== Dashboard Load Complete ===');
  } catch (error) {
    console.error('=== Dashboard Load Error ===');
    console.error('Error loading dashboard data:', error);
    console.error('Stack:', error.stack);
    showError('Erro ao carregar dados do painel');
  }
}

/**
 * Get current filter values
 */
function getFilters() {
  const form = document.getElementById('filter-form');
  if (!form) return {};

  const formData = new FormData(form);
  const filters = {};

  for (const [key, value] of formData.entries()) {
    if (value) filters[key] = value;
  }

  return filters;
}

/**
 * Build query string from filters
 */
function buildQueryString(filters) {
  const params = new URLSearchParams(filters);
  return params.toString();
}

/**
 * Load summary cards data
 */
async function loadSummaryCards(filters) {
  const queryString = buildQueryString(filters);

  try {
    // Community count
    const communityUrl = `/painel/api/stats/community-count?${queryString}`;
    console.debug('Fetching:', communityUrl);
    const communityRes = await fetch(communityUrl);
    if (communityRes.ok) {
      const communityData = await communityRes.json();
      if (communityData && communityData.total !== undefined) {
        document.getElementById('community-count').textContent = communityData.total.toLocaleString('pt-BR');
      } else {
        console.error('Invalid community data:', communityData);
        document.getElementById('community-count').textContent = '0';
      }
    } else {
      console.error('Community count error:', communityRes.status, communityRes.statusText);
      const errorData = await communityRes.json();
      console.error('Error details:', errorData);
      document.getElementById('community-count').textContent = '0';
    }

    // Reference count
    const refUrl = `/painel/api/stats/reference-count?${queryString}`;
    console.debug('Fetching:', refUrl);
    const refRes = await fetch(refUrl);
    if (refRes.ok) {
      const refData = await refRes.json();
      if (refData && refData.approved !== undefined) {
        document.getElementById('reference-count').textContent = refData.approved.toLocaleString('pt-BR');
      } else {
        console.error('Invalid reference data:', refData);
        document.getElementById('reference-count').textContent = '0';
      }
    } else {
      console.error('Reference count error:', refRes.status, refRes.statusText);
      const errorData = await refRes.json();
      console.error('Error details:', errorData);
      document.getElementById('reference-count').textContent = '0';
    }

    // Top plants (just to get count)
    const plantsUrl = `/painel/api/stats/top-plants?limit=1000&${queryString}`;
    console.debug('Fetching:', plantsUrl);
    const plantsRes = await fetch(plantsUrl);
    if (plantsRes.ok) {
      const plantsData = await plantsRes.json();
      if (Array.isArray(plantsData)) {
        document.getElementById('plant-count').textContent = plantsData.length.toLocaleString('pt-BR');
      } else {
        console.error('Invalid plants data:', plantsData);
        document.getElementById('plant-count').textContent = '0';
      }
    } else {
      console.error('Plants error:', plantsRes.status, plantsRes.statusText);
      const errorData = await plantsRes.json();
      console.error('Error details:', errorData);
      document.getElementById('plant-count').textContent = '0';
    }

    // Top authors (just to get count)
    const authorsUrl = `/painel/api/stats/top-authors?limit=1000&${queryString}`;
    console.debug('Fetching:', authorsUrl);
    const authorsRes = await fetch(authorsUrl);
    if (authorsRes.ok) {
      const authorsData = await authorsRes.json();
      if (Array.isArray(authorsData)) {
        document.getElementById('author-count').textContent = authorsData.length.toLocaleString('pt-BR');
      } else {
        console.error('Invalid authors data:', authorsData);
        document.getElementById('author-count').textContent = '0';
      }
    } else {
      console.error('Authors error:', authorsRes.status, authorsRes.statusText);
      const errorData = await authorsRes.json();
      console.error('Error details:', errorData);
      document.getElementById('author-count').textContent = '0';
    }

  } catch (error) {
    console.error('Error loading summary cards:', error);
    document.getElementById('community-count').textContent = '0';
    document.getElementById('reference-count').textContent = '0';
    document.getElementById('plant-count').textContent = '0';
    document.getElementById('author-count').textContent = '0';
  }
}

/**
 * Load maps (Google GeoChart)
 */
async function loadMaps(filters) {
  const queryString = buildQueryString(filters);

  try {
    // References by state
    const refUrl = `/painel/api/stats/references-by-state?${queryString}`;
    console.debug('Fetching:', refUrl);
    const refRes = await fetch(refUrl);
    if (refRes.ok) {
      const refByState = await refRes.json();
      if (Array.isArray(refByState)) {
        drawGeoChart('map-references', refByState, 'Referências');
      } else {
        console.error('Invalid references by state data:', refByState);
        drawGeoChart('map-references', [], 'Referências');
      }
    } else {
      console.error('References by state error:', refRes.status, refRes.statusText);
      const errorData = await refRes.json();
      console.error('Error details:', errorData);
      drawGeoChart('map-references', [], 'Referências');
    }

    // Plants by state
    const plantsUrl = `/painel/api/stats/plants-by-state?${queryString}`;
    console.debug('Fetching:', plantsUrl);
    const plantsRes = await fetch(plantsUrl);
    if (plantsRes.ok) {
      const plantsByState = await plantsRes.json();
      if (Array.isArray(plantsByState)) {
        drawGeoChart('map-plants', plantsByState, 'Plantas');
      } else {
        console.error('Invalid plants by state data:', plantsByState);
        drawGeoChart('map-plants', [], 'Plantas');
      }
    } else {
      console.error('Plants by state error:', plantsRes.status, plantsRes.statusText);
      const errorData = await plantsRes.json();
      console.error('Error details:', errorData);
      drawGeoChart('map-plants', [], 'Plantas');
    }

  } catch (error) {
    console.error('Error loading maps:', error);
    drawGeoChart('map-references', [], 'Referências');
    drawGeoChart('map-plants', [], 'Plantas');
  }
}

/**
 * Draw Google GeoChart for Brazil
 */
function drawGeoChart(elementId, data, metric) {
  const container = document.getElementById(elementId);
  if (!container) {
    console.error(`Container not found: ${elementId}`);
    return;
  }

  // If no data, show placeholder
  if (!data || data.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-400 py-12">Sem dados disponíveis</div>';
    return;
  }

  try {
    // Convert state names to BR-XX format
    const stateCodeMap = {
      'Acre': 'BR-AC',
      'Alagoas': 'BR-AL',
      'Amapá': 'BR-AP',
      'Amazonas': 'BR-AM',
      'Bahia': 'BR-BA',
      'Ceará': 'BR-CE',
      'Distrito Federal': 'BR-DF',
      'Espírito Santo': 'BR-ES',
      'Goiás': 'BR-GO',
      'Maranhão': 'BR-MA',
      'Mato Grosso': 'BR-MT',
      'Mato Grosso do Sul': 'BR-MS',
      'Minas Gerais': 'BR-MG',
      'Pará': 'BR-PA',
      'Paraíba': 'BR-PB',
      'Paraná': 'BR-PR',
      'Pernambuco': 'BR-PE',
      'Piauí': 'BR-PI',
      'Rio de Janeiro': 'BR-RJ',
      'Rio Grande do Norte': 'BR-RN',
      'Rio Grande do Sul': 'BR-RS',
      'Rondônia': 'BR-RO',
      'Roraima': 'BR-RR',
      'Santa Catarina': 'BR-SC',
      'São Paulo': 'BR-SP',
      'Sergipe': 'BR-SE',
      'Tocantins': 'BR-TO'
    };

    // Prepare data for Google Charts
    const chartData = [['Estado', metric]];
    data.forEach(item => {
      const stateCode = stateCodeMap[item.state];
      if (stateCode) {
        chartData.push([stateCode, item.count]);
      }
    });

    const dataTable = google.visualization.arrayToDataTable(chartData);

    const options = {
      region: 'BR',
      resolution: 'provinces',
      colorAxis: {
        colors: ['#dcfce7', '#86efac', '#22c55e', '#15803d', '#14532d']
      },
      backgroundColor: '#f9fafb',
      datalessRegionColor: '#e5e7eb',
      defaultColor: '#e5e7eb',
      tooltip: {
        textStyle: {
          fontName: 'system-ui',
          fontSize: 13
        }
      }
    };

    const chart = new google.visualization.GeoChart(container);
    chart.draw(dataTable, options);
  } catch (error) {
    console.error(`Error drawing GeoChart for ${elementId}:`, error);
    container.innerHTML = '<div class="text-center text-red-400 py-12">Erro ao renderizar mapa</div>';
  }
}

/**
 * Load charts (publications by year, top plants)
 */
async function loadCharts(filters) {
  const queryString = buildQueryString(filters);

  try {
    // Publications by year
    const pubUrl = `/painel/api/stats/publications-by-year?${queryString}`;
    console.debug('Fetching:', pubUrl);
    const pubRes = await fetch(pubUrl);
    if (pubRes.ok) {
      const pubByYear = await pubRes.json();
      if (Array.isArray(pubByYear)) {
        drawAreaChart('chart-publications', pubByYear);
      } else {
        console.error('Invalid publications by year data:', pubByYear);
        drawAreaChart('chart-publications', []);
      }
    } else {
      console.error('Publications by year error:', pubRes.status, pubRes.statusText);
      const errorData = await pubRes.json();
      console.error('Error details:', errorData);
      drawAreaChart('chart-publications', []);
    }

    // Top plants
    const topPlantsUrl = `/painel/api/stats/top-plants?limit=10&${queryString}`;
    console.debug('Fetching:', topPlantsUrl);
    const topPlantsRes = await fetch(topPlantsUrl);
    if (topPlantsRes.ok) {
      const topPlants = await topPlantsRes.json();
      if (Array.isArray(topPlants)) {
        drawBarChart('chart-top-plants', topPlants);
      } else {
        console.error('Invalid top plants data:', topPlants);
        drawBarChart('chart-top-plants', []);
      }
    } else {
      console.error('Top plants error:', topPlantsRes.status, topPlantsRes.statusText);
      const errorData = await topPlantsRes.json();
      console.error('Error details:', errorData);
      drawBarChart('chart-top-plants', []);
    }

  } catch (error) {
    console.error('Error loading charts:', error);
    drawAreaChart('chart-publications', []);
    drawBarChart('chart-top-plants', []);
  }
}

/**
 * Draw area chart for publications by year
 */
function drawAreaChart(elementId, data) {
  const container = document.getElementById(elementId);
  if (!container) {
    console.error(`Container not found: ${elementId}`);
    return;
  }

  // If no data, show placeholder
  if (!data || data.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-400 py-12">Sem dados disponíveis</div>';
    return;
  }

  try {
    const chartData = [['Ano', 'Publicações']];
    data.forEach(item => {
      if (item && item.year !== undefined && item.count !== undefined) {
        chartData.push([item.year.toString(), item.count]);
      }
    });

    const dataTable = google.visualization.arrayToDataTable(chartData);

    const options = {
      title: '',
      hAxis: { title: 'Ano', titleTextStyle: { fontSize: 12 } },
      vAxis: { title: 'Número de Publicações', minValue: 0, titleTextStyle: { fontSize: 12 } },
      legend: { position: 'none' },
      colors: ['#16a34a'],
      backgroundColor: 'transparent',
      chartArea: { width: '85%', height: '70%' },
      fontSize: 12,
      fontName: 'system-ui'
    };

    const chart = new google.visualization.AreaChart(container);
    chart.draw(dataTable, options);
  } catch (error) {
    console.error(`Error drawing AreaChart for ${elementId}:`, error);
    container.innerHTML = '<div class="text-center text-red-400 py-12">Erro ao renderizar gráfico</div>';
  }
}

/**
 * Draw bar chart for top plants
 */
function drawBarChart(elementId, data) {
  const container = document.getElementById(elementId);
  if (!container) {
    console.error(`Container not found: ${elementId}`);
    return;
  }

  // If no data, show placeholder
  if (!data || data.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-400 py-12">Sem dados disponíveis</div>';
    return;
  }

  try {
    const chartData = [['Planta', 'Citações']];
    data.forEach(item => {
      if (item && item.nomeCientifico && item.count !== undefined) {
        // Truncate long names
        const name = item.nomeCientifico.length > 30
          ? item.nomeCientifico.substring(0, 27) + '...'
          : item.nomeCientifico;
        chartData.push([name, item.count]);
      }
    });

    if (chartData.length < 2) {
      container.innerHTML = '<div class="text-center text-gray-400 py-12">Sem dados disponíveis</div>';
      return;
    }

    const dataTable = google.visualization.arrayToDataTable(chartData);

    const options = {
      title: '',
      hAxis: { title: 'Número de Citações', minValue: 0, titleTextStyle: { fontSize: 12 } },
      vAxis: { title: '', titleTextStyle: { fontSize: 12 } },
      legend: { position: 'none' },
      colors: ['#f59e0b'],
      backgroundColor: 'transparent',
      chartArea: { width: '70%', height: '80%' },
      fontSize: 11,
      fontName: 'system-ui',
      bars: 'horizontal'
    };

    const chart = new google.visualization.BarChart(container);
    chart.draw(dataTable, options);
  } catch (error) {
    console.error(`Error drawing BarChart for ${elementId}:`, error);
    container.innerHTML = '<div class="text-center text-red-400 py-12">Erro ao renderizar gráfico</div>';
  }
}

/**
 * Load tables data
 */
async function loadTables(filters) {
  const queryString = buildQueryString(filters);

  try {
    // Top authors
    const authorsUrl = `/painel/api/stats/top-authors?limit=10&${queryString}`;
    console.debug('Fetching:', authorsUrl);
    const authorsRes = await fetch(authorsUrl);
    if (authorsRes.ok) {
      const authors = await authorsRes.json();
      if (Array.isArray(authors)) {
        drawTable('table-authors', authors, [
          { label: 'Autor', key: 'author' },
          { label: 'Publicações', key: 'count', align: 'center' }
        ]);
      } else {
        console.error('Invalid authors data:', authors);
        drawTable('table-authors', [], [
          { label: 'Autor', key: 'author' },
          { label: 'Publicações', key: 'count', align: 'center' }
        ]);
      }
    } else {
      console.error('Top authors error:', authorsRes.status, authorsRes.statusText);
      const errorData = await authorsRes.json();
      console.error('Error details:', errorData);
      drawTable('table-authors', [], [
        { label: 'Autor', key: 'author' },
        { label: 'Publicações', key: 'count', align: 'center' }
      ]);
    }

    // Top communities
    const communitiesUrl = `/painel/api/stats/top-communities?limit=10&${queryString}`;
    console.debug('Fetching:', communitiesUrl);
    const communitiesRes = await fetch(communitiesUrl);
    if (communitiesRes.ok) {
      const communities = await communitiesRes.json();
      if (Array.isArray(communities)) {
        drawTable('table-communities', communities, [
          { label: 'Comunidade', key: 'community' },
          { label: 'Estado', key: 'estado', align: 'center' },
          { label: 'Plantas', key: 'plantCount', align: 'center' }
        ]);
      } else {
        console.error('Invalid communities data:', communities);
        drawTable('table-communities', [], [
          { label: 'Comunidade', key: 'community' },
          { label: 'Estado', key: 'estado', align: 'center' },
          { label: 'Plantas', key: 'plantCount', align: 'center' }
        ]);
      }
    } else {
      console.error('Top communities error:', communitiesRes.status, communitiesRes.statusText);
      const errorData = await communitiesRes.json();
      console.error('Error details:', errorData);
      drawTable('table-communities', [], [
        { label: 'Comunidade', key: 'community' },
        { label: 'Estado', key: 'estado', align: 'center' },
        { label: 'Plantas', key: 'plantCount', align: 'center' }
      ]);
    }

    // References with most communities
    const refCommunitiesUrl = `/painel/api/stats/references-by-communities?limit=10&${queryString}`;
    console.debug('Fetching:', refCommunitiesUrl);
    const refCommunitiesRes = await fetch(refCommunitiesUrl);
    if (refCommunitiesRes.ok) {
      const refCommunities = await refCommunitiesRes.json();
      if (Array.isArray(refCommunities)) {
        drawTable('table-ref-communities', refCommunities, [
          { label: 'Título', key: 'titulo' },
          { label: 'Ano', key: 'ano', align: 'center' },
          { label: 'Comunidades', key: 'communityCount', align: 'center' }
        ]);
      } else {
        console.error('Invalid ref-communities data:', refCommunities);
        drawTable('table-ref-communities', [], [
          { label: 'Título', key: 'titulo' },
          { label: 'Ano', key: 'ano', align: 'center' },
          { label: 'Comunidades', key: 'communityCount', align: 'center' }
        ]);
      }
    } else {
      console.error('References by communities error:', refCommunitiesRes.status, refCommunitiesRes.statusText);
      const errorData = await refCommunitiesRes.json();
      console.error('Error details:', errorData);
      drawTable('table-ref-communities', [], [
        { label: 'Título', key: 'titulo' },
        { label: 'Ano', key: 'ano', align: 'center' },
        { label: 'Comunidades', key: 'communityCount', align: 'center' }
      ]);
    }

    // References with most plants
    const refPlantsUrl = `/painel/api/stats/references-by-plants?limit=10&${queryString}`;
    console.debug('Fetching:', refPlantsUrl);
    const refPlantsRes = await fetch(refPlantsUrl);
    if (refPlantsRes.ok) {
      const refPlants = await refPlantsRes.json();
      if (Array.isArray(refPlants)) {
        drawTable('table-ref-plants', refPlants, [
          { label: 'Título', key: 'titulo' },
          { label: 'Ano', key: 'ano', align: 'center' },
          { label: 'Plantas', key: 'plantCount', align: 'center' }
        ]);
      } else {
        console.error('Invalid ref-plants data:', refPlants);
        drawTable('table-ref-plants', [], [
          { label: 'Título', key: 'titulo' },
          { label: 'Ano', key: 'ano', align: 'center' },
          { label: 'Plantas', key: 'plantCount', align: 'center' }
        ]);
      }
    } else {
      console.error('References by plants error:', refPlantsRes.status, refPlantsRes.statusText);
      const errorData = await refPlantsRes.json();
      console.error('Error details:', errorData);
      drawTable('table-ref-plants', [], [
        { label: 'Título', key: 'titulo' },
        { label: 'Ano', key: 'ano', align: 'center' },
        { label: 'Plantas', key: 'plantCount', align: 'center' }
      ]);
    }

  } catch (error) {
    console.error('Error loading tables:', error);
    drawTable('table-authors', [], [
      { label: 'Autor', key: 'author' },
      { label: 'Publicações', key: 'count', align: 'center' }
    ]);
    drawTable('table-communities', [], [
      { label: 'Comunidade', key: 'community' },
      { label: 'Estado', key: 'estado', align: 'center' },
      { label: 'Plantas', key: 'plantCount', align: 'center' }
    ]);
    drawTable('table-ref-communities', [], [
      { label: 'Título', key: 'titulo' },
      { label: 'Ano', key: 'ano', align: 'center' },
      { label: 'Comunidades', key: 'communityCount', align: 'center' }
    ]);
    drawTable('table-ref-plants', [], [
      { label: 'Título', key: 'titulo' },
      { label: 'Ano', key: 'ano', align: 'center' },
      { label: 'Plantas', key: 'plantCount', align: 'center' }
    ]);
  }
}

/**
 * Draw HTML table
 */
function drawTable(elementId, data, columns) {
  const container = document.getElementById(elementId);

  if (!container) {
    console.error(`Container not found: ${elementId}`);
    return;
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-400 py-8">Nenhum dado disponível</div>';
    return;
  }

  if (!columns || columns.length === 0) {
    console.error(`No columns provided for ${elementId}`);
    container.innerHTML = '<div class="text-center text-red-400 py-8">Erro: Colunas não configuradas</div>';
    return;
  }

  try {
    let html = '<table class="dashboard-table"><thead><tr>';

    // Headers
    columns.forEach(col => {
      html += `<th class="${col.align || 'left'}">${col.label}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Rows
    data.forEach((row, index) => {
      if (!row || typeof row !== 'object') {
        return;
      }

      html += '<tr>';
      columns.forEach(col => {
        let value = row[col.key];
        let cellClass = col.align || 'left';

        // Handle null/undefined values
        if (value === null || value === undefined) {
          value = '-';
        } else {
          // Keep full titles - let CSS handle wrapping
          // Don't truncate titles or authors

          // Format numbers (but not years - they shouldn't have thousand separators)
          if (typeof value === 'number') {
            if (col.key === 'ano') {
              // Years: no thousand separator
              value = value.toString();
            } else {
              // Other numbers: use locale formatting
              value = value.toLocaleString('pt-BR');
            }
            // Apply right alignment for numeric columns
            cellClass = 'right';
          }
        }

        html += `<td class="${cellClass}">${value}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (error) {
    console.error(`Error drawing table for ${elementId}:`, error);
    container.innerHTML = '<div class="text-center text-red-400 py-8">Erro ao renderizar tabela</div>';
  }
}

/**
 * Show error message with UI feedback
 */
function showError(message) {
  console.error('Dashboard Error:', message);

  // Show error toast/notification if possible
  const errorContainer = document.createElement('div');
  errorContainer.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm';
  errorContainer.textContent = message;
  document.body.appendChild(errorContainer);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    errorContainer.remove();
  }, 5000);
}

/**
 * Responsive charts - redraw on window resize
 */
let resizeTimer;
window.addEventListener('resize', () => {
  // Debounce resize events
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    loadDashboardData();
  }, 250);
});

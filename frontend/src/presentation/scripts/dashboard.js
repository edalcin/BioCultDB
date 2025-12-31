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

  try {
    // Load all stats in parallel
    await Promise.all([
      loadSummaryCards(filters),
      loadMaps(filters),
      loadCharts(filters),
      loadTables(filters)
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
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
    const communityData = await fetch(`/painel/api/stats/community-count?${queryString}`)
      .then(res => res.json());
    document.getElementById('community-count').textContent = communityData.total.toLocaleString('pt-BR');

    // Reference count
    const refData = await fetch(`/painel/api/stats/reference-count?${queryString}`)
      .then(res => res.json());
    document.getElementById('reference-count').textContent = refData.approved.toLocaleString('pt-BR');

    // Top plants (just to get count)
    const plantsData = await fetch(`/painel/api/stats/top-plants?limit=1000&${queryString}`)
      .then(res => res.json());
    document.getElementById('plant-count').textContent = plantsData.length.toLocaleString('pt-BR');

    // Top authors (just to get count)
    const authorsData = await fetch(`/painel/api/stats/top-authors?limit=1000&${queryString}`)
      .then(res => res.json());
    document.getElementById('author-count').textContent = authorsData.length.toLocaleString('pt-BR');

  } catch (error) {
    console.error('Error loading summary cards:', error);
  }
}

/**
 * Load maps (Google GeoChart)
 */
async function loadMaps(filters) {
  const queryString = buildQueryString(filters);

  try {
    // References by state
    const refByState = await fetch(`/painel/api/stats/references-by-state?${queryString}`)
      .then(res => res.json());
    drawGeoChart('map-references', refByState, 'Referências');

    // Plants by state
    const plantsByState = await fetch(`/painel/api/stats/plants-by-state?${queryString}`)
      .then(res => res.json());
    drawGeoChart('map-plants', plantsByState, 'Plantas');

  } catch (error) {
    console.error('Error loading maps:', error);
  }
}

/**
 * Draw Google GeoChart for Brazil
 */
function drawGeoChart(elementId, data, metric) {
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

  const chart = new google.visualization.GeoChart(document.getElementById(elementId));
  chart.draw(dataTable, options);
}

/**
 * Load charts (publications by year, top plants)
 */
async function loadCharts(filters) {
  const queryString = buildQueryString(filters);

  try {
    // Publications by year
    const pubByYear = await fetch(`/painel/api/stats/publications-by-year?${queryString}`)
      .then(res => res.json());
    drawAreaChart('chart-publications', pubByYear);

    // Top plants
    const topPlants = await fetch(`/painel/api/stats/top-plants?limit=10&${queryString}`)
      .then(res => res.json());
    drawBarChart('chart-top-plants', topPlants);

  } catch (error) {
    console.error('Error loading charts:', error);
  }
}

/**
 * Draw area chart for publications by year
 */
function drawAreaChart(elementId, data) {
  const chartData = [['Ano', 'Publicações']];
  data.forEach(item => {
    chartData.push([item.year.toString(), item.count]);
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

  const chart = new google.visualization.AreaChart(document.getElementById(elementId));
  chart.draw(dataTable, options);
}

/**
 * Draw bar chart for top plants
 */
function drawBarChart(elementId, data) {
  const chartData = [['Planta', 'Citações']];
  data.forEach(item => {
    // Truncate long names
    const name = item.nomeCientifico.length > 30
      ? item.nomeCientifico.substring(0, 27) + '...'
      : item.nomeCientifico;
    chartData.push([name, item.count]);
  });

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

  const chart = new google.visualization.BarChart(document.getElementById(elementId));
  chart.draw(dataTable, options);
}

/**
 * Load tables data
 */
async function loadTables(filters) {
  const queryString = buildQueryString(filters);

  try {
    // Top authors
    const authors = await fetch(`/painel/api/stats/top-authors?limit=10&${queryString}`)
      .then(res => res.json());
    drawTable('table-authors', authors, [
      { label: 'Autor', key: 'author' },
      { label: 'Publicações', key: 'count', align: 'center' }
    ]);

    // Top communities
    const communities = await fetch(`/painel/api/stats/top-communities?limit=10&${queryString}`)
      .then(res => res.json());
    drawTable('table-communities', communities, [
      { label: 'Comunidade', key: 'community' },
      { label: 'Estado', key: 'estado', align: 'center' },
      { label: 'Plantas', key: 'plantCount', align: 'center' }
    ]);

    // References with most communities
    const refCommunities = await fetch(`/painel/api/stats/references-by-communities?limit=10&${queryString}`)
      .then(res => res.json());
    drawTable('table-ref-communities', refCommunities, [
      { label: 'Título', key: 'titulo' },
      { label: 'Ano', key: 'ano', align: 'center' },
      { label: 'Comunidades', key: 'communityCount', align: 'center' }
    ]);

    // References with most plants
    const refPlants = await fetch(`/painel/api/stats/references-by-plants?limit=10&${queryString}`)
      .then(res => res.json());
    drawTable('table-ref-plants', refPlants, [
      { label: 'Título', key: 'titulo' },
      { label: 'Ano', key: 'ano', align: 'center' },
      { label: 'Plantas', key: 'plantCount', align: 'center' }
    ]);

  } catch (error) {
    console.error('Error loading tables:', error);
  }
}

/**
 * Draw HTML table
 */
function drawTable(elementId, data, columns) {
  const container = document.getElementById(elementId);

  if (data.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">Nenhum dado disponível</p>';
    return;
  }

  let html = '<table class="dashboard-table"><thead><tr>';

  // Headers
  columns.forEach(col => {
    html += `<th class="${col.align || 'left'}">${col.label}</th>`;
  });
  html += '</tr></thead><tbody>';

  // Rows
  data.forEach((row, index) => {
    html += '<tr>';
    columns.forEach(col => {
      let value = row[col.key];

      // Truncate long titles
      if (col.key === 'titulo' && typeof value === 'string' && value.length > 50) {
        value = value.substring(0, 47) + '...';
      }

      // Truncate long author names
      if (col.key === 'author' && typeof value === 'string' && value.length > 40) {
        value = value.substring(0, 37) + '...';
      }

      const displayValue = typeof value === 'number' ? value.toLocaleString('pt-BR') : value;
      html += `<td class="${col.align || 'left'}">${displayValue}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

/**
 * Show error message
 */
function showError(message) {
  console.error(message);
  // TODO: Implement proper error UI
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

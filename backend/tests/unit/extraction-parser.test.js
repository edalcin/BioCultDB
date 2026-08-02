/**
 * Extraction parser unit suite (ticket 05 — "the parser is this feature's
 * test seam"). Pure function, no I/O, no database: every case here is a
 * bug the BioCultPapers desktop app actually hit.
 */

const { parseExtractionResponse } = require('../../src/services/extraction-parser');
const { Status } = require('../../src/models/Evidence');

const META = { provider: 'claude', model: 'claude-sonnet-4-5-20250929' };

function minimalJson(overrides = {}) {
  return JSON.stringify({
    titulo: 'Uso de plantas por comunidades ribeirinhas',
    autores: ['SILVA, J.'],
    ano: 2021,
    resumo: 'Resumo do artigo.',
    DOI: '10.1000/xyz',
    comunidades: [
      {
        nome: 'Comunidade X',
        tipo: 'Ribeirinhos',
        municipio: 'Manaus',
        estado: 'Amazonas',
        local: 'margem do rio',
        atividadesEconomicas: ['pesca'],
        observacoes: '',
        plantas: [
          { nomeCientifico: ['Bidens pilosa'], nomeVernacular: ['picao'], tipoUso: ['medicinal'] }
        ]
      }
    ],
    ...overrides
  });
}

describe('extraction-parser — happy path', () => {
  test('parses a clean JSON response into a pending Evidence stamped with provider/model', () => {
    const result = parseExtractionResponse(minimalJson(), META);

    expect(result.success).toBe(true);
    expect(result.evidence.titulo).toBe('Uso de plantas por comunidades ribeirinhas');
    expect(result.evidence.status).toBe(Status.PENDING);
    expect(result.evidence.fonte).toBe('extração IA — claude/claude-sonnet-4-5-20250929');
  });

  test('preserves nested comunidades/plantas association exactly', () => {
    const json = JSON.stringify({
      titulo: 'T', autores: ['A'], ano: 2020, resumo: 'R', DOI: '',
      comunidades: [
        {
          nome: 'Comunidade A', tipo: 'Caiçaras', municipio: 'M1', estado: 'E1',
          local: '', atividadesEconomicas: [], observacoes: '',
          plantas: [{ nomeCientifico: ['Species one'], nomeVernacular: ['nome um'], tipoUso: ['medicinal'] }]
        },
        {
          nome: 'Comunidade B', tipo: 'Quilombolas', municipio: 'M2', estado: 'E2',
          local: '', atividadesEconomicas: [], observacoes: '',
          plantas: [
            { nomeCientifico: ['Species two'], nomeVernacular: ['nome dois'], tipoUso: ['alimentar'] },
            { nomeCientifico: ['Species three'], nomeVernacular: ['nome tres'], tipoUso: ['ritual'] }
          ]
        }
      ]
    });

    const result = parseExtractionResponse(json, META);

    expect(result.success).toBe(true);
    expect(result.evidence.comunidades).toHaveLength(2);
    expect(result.evidence.comunidades[0].nome).toBe('Comunidade A');
    expect(result.evidence.comunidades[0].plantas).toHaveLength(1);
    expect(result.evidence.comunidades[1].nome).toBe('Comunidade B');
    expect(result.evidence.comunidades[1].plantas).toHaveLength(2);
    expect(result.evidence.comunidades[1].plantas[1].nomeCientifico).toEqual(['Species three']);
  });
});

describe('extraction-parser — response framing', () => {
  test('extracts JSON wrapped in a ```json code fence', () => {
    const wrapped = '```json\n' + minimalJson() + '\n```';
    const result = parseExtractionResponse(wrapped, META);
    expect(result.success).toBe(true);
    expect(result.evidence.titulo).toBe('Uso de plantas por comunidades ribeirinhas');
  });

  test('extracts JSON with explanatory prose before and after it', () => {
    const withProse = `Aqui está a extração solicitada:\n\n${minimalJson()}\n\nEspero que ajude!`;
    const result = parseExtractionResponse(withProse, META);
    expect(result.success).toBe(true);
    expect(result.evidence.titulo).toBe('Uso de plantas por comunidades ribeirinhas');
  });
});

describe('extraction-parser — failure modes (descriptive errors, never a raw exception)', () => {
  test('empty response fails with a descriptive error', () => {
    const result = parseExtractionResponse('', META);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('whitespace-only response fails with a descriptive error', () => {
    const result = parseExtractionResponse('   \n\t  ', META);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('invalid JSON fails with a descriptive error instead of throwing', () => {
    expect(() => parseExtractionResponse('{ titulo: "sem aspas nas chaves" }', META)).not.toThrow();
    const result = parseExtractionResponse('{ titulo: "sem aspas nas chaves" }', META);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/JSON/i);
  });
});

describe('extraction-parser — D9: incomplete extraction is partial, never a failure', () => {
  test('missing required fields (titulo/autores/ano/resumo) yields a partial Evidence, not a failure', () => {
    const json = JSON.stringify({ comunidades: [] });
    const result = parseExtractionResponse(json, META);

    expect(result.success).toBe(true);
    expect(result.evidence.titulo).toBeNull();
    expect(result.evidence.autores).toEqual([]);
    expect(result.evidence.ano).toBeNull();
    expect(result.evidence.resumo).toBeNull();
    expect(result.evidence.status).toBe(Status.PENDING);
  });
});

describe('extraction-parser — list fields arriving as comma-separated text', () => {
  test('autores as a comma-separated string is normalized to an array', () => {
    const result = parseExtractionResponse(minimalJson({ autores: 'SILVA, J., SANTOS, M.' }), META);
    expect(result.success).toBe(true);
    expect(result.evidence.autores).toEqual(['SILVA', 'J.', 'SANTOS', 'M.']);
  });

  test('nomeCientifico/nomeVernacular as comma-separated strings are normalized to arrays', () => {
    const json = JSON.stringify({
      titulo: 'T', autores: ['A'], ano: 2020, resumo: 'R', DOI: '',
      comunidades: [{
        nome: 'C', tipo: 'Caiçaras', municipio: 'M', estado: 'E', local: '',
        atividadesEconomicas: 'pesca, agricultura', observacoes: '',
        plantas: [{ nomeCientifico: 'Species a, Species b', nomeVernacular: 'nome A, Nome B', tipoUso: 'medicinal, ritual' }]
      }]
    });

    const result = parseExtractionResponse(json, META);

    expect(result.success).toBe(true);
    expect(result.evidence.comunidades[0].atividadesEconomicas).toEqual(['pesca', 'agricultura']);
    expect(result.evidence.comunidades[0].plantas[0].nomeCientifico).toEqual(['Species a', 'Species b']);
    // Vernacular names: lowercase, hyphenated (project convention).
    expect(result.evidence.comunidades[0].plantas[0].nomeVernacular).toEqual(['nome-a', 'nome-b']);
    expect(result.evidence.comunidades[0].plantas[0].tipoUso).toEqual(['medicinal', 'ritual']);
  });
});

/**
 * Extração por IA — Alpine.js Component
 *
 * Configuration (provider/key/model) is independent from etnoChat's
 * (ADR-002 D5): separate `localStorage` key, own settings modal. The key
 * transits to the server on every request and is never persisted there —
 * only kept in the browser, same as etnoChat.
 */

function extracaoIA() {
  return {
    // UI State
    showSettings: false,
    showApiKey: false,

    // Settings (ADR-002 D5 — independent from etnochat_settings)
    settings: {
      provider: '',
      apiKey: '',
      model: ''
    },
    tempSettings: {
      provider: '',
      apiKey: '',
      model: ''
    },

    // Validation
    validationStatus: '', // '', 'validating', 'valid', 'invalid'
    validationError: '',

    // Providers and models
    providers: [],
    availableModels: [],

    // OpenRouter has no curated list (ADR-002 D11) — fetched live by the
    // browser, straight from OpenRouter's public endpoint.
    openrouterModels: [],
    openrouterModelsError: false,

    // Extraction
    texto: '',
    arquivoNome: '',
    phase: '', // '', 'lendo-pdf', 'consultando', 'salvando', 'sucesso', 'erro'
    errorMessage: '',
    resultId: null,
    curadoriaUrl: '',

    // PDF is read entirely in the browser (ADR-002 06) — the binary never
    // leaves the machine, only the extracted text does. pdf.js comes from
    // the CDN, same convention as Alpine/HTMX in this repo (no JS build
    // step, no new server dependency).
    async selecionarArquivo(event) {
      const file = event.target.files[0];
      event.target.value = ''; // allow re-selecting the same file after an error
      if (!file) return;

      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        this.phase = 'erro';
        this.errorMessage = 'Arquivo não é um PDF. Selecione um arquivo .pdf ou cole o texto diretamente.';
        return;
      }

      this.phase = 'lendo-pdf';
      this.errorMessage = '';

      try {
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(' ') + '\n';
        }

        if (isPdfTextEmpty(text)) {
          this.phase = 'erro';
          this.errorMessage = 'Este PDF não tem camada de texto (provavelmente digitalizado/escaneado). ' +
            'Passe-o por OCR antes, ou cole o texto do artigo diretamente na caixa abaixo.';
          return;
        }

        this.texto = text.trim();
        this.arquivoNome = file.name;
        this.phase = '';
      } catch (e) {
        console.error('PDF read error:', e);
        this.phase = 'erro';
        this.errorMessage = 'Falha ao ler o PDF. Tente novamente ou cole o texto diretamente.';
      }
    },

    async init() {
      this.providers = [
        { id: 'claude', name: 'Claude (Anthropic)' },
        { id: 'openai', name: 'OpenAI' },
        { id: 'gemini', name: 'Google Gemini' },
        { id: 'openrouter', name: 'OpenRouter' }
      ];

      this.loadSettings();
      this.tempSettings = { ...this.settings };
      this.updateAvailableModels();

      // No key yet: open settings directly instead of a screen that will
      // just fail (ADR-002 D8) — same behaviour as clicking the disabled
      // nav item elsewhere in the app.
      if (!this.settings.apiKey) {
        this.showSettings = true;
      }

      if (this.tempSettings.provider === 'openrouter') {
        this.fetchOpenRouterModels();
      }
    },

    // Settings Management
    loadSettings() {
      try {
        const saved = localStorage.getItem('extracao_settings');
        if (saved) {
          this.settings = JSON.parse(saved);
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    },

    saveSettings() {
      this.settings = { ...this.tempSettings };

      try {
        localStorage.setItem('extracao_settings', JSON.stringify(this.settings));
      } catch (e) {
        console.error('Failed to save settings:', e);
      }

      // Lets the nav item (a separate Alpine component) react without a
      // reload when the key is set or cleared (ADR-002 D8).
      window.dispatchEvent(new Event('extracao-settings-changed'));

      this.showSettings = false;
      this.validationStatus = '';
    },

    onProviderChange() {
      this.tempSettings.model = '';
      this.updateAvailableModels();
      this.validationStatus = '';

      if (this.tempSettings.provider === 'openrouter') {
        this.fetchOpenRouterModels();
      }
    },

    updateAvailableModels() {
      const modelsByProvider = {
        claude: [
          { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5' },
          { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5' },
          { id: 'claude-3-5-haiku-20241022', name: 'Claude Haiku 3.5' }
        ],
        openai: [
          { id: 'gpt-4o', name: 'GPT-4o' },
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
        ],
        gemini: [
          { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
          { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
          { id: 'gemini-2.0-flash-thinking-exp-01-21', name: 'Gemini 2.0 Flash Thinking (Experimental)' }
        ]
      };

      this.availableModels = modelsByProvider[this.tempSettings.provider] || [];
    },

    // OpenRouter's catalog is live (ADR-002 D11): fetched by the browser
    // straight from OpenRouter's public, CORS-enabled endpoint — no server
    // route in between. A failed fetch degrades gracefully: the model field
    // stays a free-text input either way, so the user can still type an id.
    async fetchOpenRouterModels() {
      this.openrouterModelsError = false;
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models');
        if (!response.ok) throw new Error('Request failed');
        const { data } = await response.json();
        this.openrouterModels = (data || []).map((m) => ({ id: m.id, name: m.name || m.id }));
      } catch (e) {
        console.error('Failed to fetch OpenRouter models:', e);
        this.openrouterModels = [];
        this.openrouterModelsError = true;
      }
    },

    async validateKey() {
      if (!this.tempSettings.apiKey || !this.tempSettings.provider) return;

      if (!this.tempSettings.model) {
        this.validationStatus = 'invalid';
        this.validationError = 'Selecione um modelo antes de validar';
        return;
      }

      this.validationStatus = 'validating';
      this.validationError = '';

      try {
        const response = await fetch('/extracao-ia/api/validate-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: this.tempSettings.provider,
            apiKey: this.tempSettings.apiKey,
            model: this.tempSettings.model
          })
        });

        const result = await response.json();

        if (result.valid) {
          this.validationStatus = 'valid';
        } else {
          this.validationStatus = 'invalid';
          this.validationError = result.error || 'Chave invalida';
        }
      } catch (e) {
        this.validationStatus = 'invalid';
        this.validationError = 'Erro ao validar chave';
        console.error('Validation error:', e);
      }
    },

    get isConfigured() {
      return !!(this.settings.provider && this.settings.apiKey && this.settings.model);
    },

    get providerName() {
      const p = this.providers.find((prov) => prov.id === this.settings.provider);
      return p ? p.name : '';
    },

    get isBusy() {
      return this.phase === 'lendo-pdf' || this.phase === 'consultando' || this.phase === 'salvando';
    },

    // Extraction — two round trips so progress can distinguish "consulting
    // the AI" from "recording the Evidence" (both are real network calls,
    // not a single request split cosmetically).
    async extrair() {
      if (!this.isConfigured || !this.texto.trim() || this.isBusy) return;

      this.phase = 'consultando';
      this.errorMessage = '';
      this.resultId = null;

      try {
        const consultaRes = await fetch('/extracao-ia/api/consultar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: this.settings.provider,
            apiKey: this.settings.apiKey,
            model: this.settings.model,
            texto: this.texto
          })
        });
        const consulta = await consultaRes.json();

        if (!consulta.success) {
          this.phase = 'erro';
          this.errorMessage = consulta.error || 'Falha ao consultar a IA';
          return;
        }

        this.phase = 'salvando';

        const gravaRes = await fetch('/extracao-ia/api/gravar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawResponse: consulta.rawResponse,
            provider: this.settings.provider,
            model: this.settings.model
          })
        });
        const grava = await gravaRes.json();

        if (!grava.success) {
          this.phase = 'erro';
          this.errorMessage = grava.error || 'Falha ao processar a resposta da IA';
          return;
        }

        this.phase = 'sucesso';
        this.resultId = grava.id;
        this.curadoriaUrl = `${window.location.protocol}//${window.location.hostname}:3002/evidence/edit/${grava.id}`;
      } catch (e) {
        console.error('Extraction error:', e);
        this.phase = 'erro';
        this.errorMessage = 'Erro de rede ao comunicar com o servidor';
      }
    },

    novaExtracao() {
      this.texto = '';
      this.arquivoNome = '';
      this.phase = '';
      this.errorMessage = '';
      this.resultId = null;
    }
  };
}

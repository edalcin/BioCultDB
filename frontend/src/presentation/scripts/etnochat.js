/**
 * etnoChat Alpine.js Component
 *
 * Manages chat state, conversations, settings, and AI communication
 */

function etnoChat() {
  return {
    // UI State
    showSettings: false,
    showApiKey: false,
    sidebarOpen: true,
    isStreaming: false,
    inputMessage: '',

    // Settings
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

    // Conversations
    conversations: [],
    currentConversation: {
      id: '',
      title: '',
      provider: '',
      model: '',
      createdAt: '',
      messages: []
    },

    // Initialize
    async init() {
      // Load providers
      this.providers = [
        { id: 'claude', name: 'Claude (Anthropic)' },
        { id: 'openai', name: 'OpenAI' },
        { id: 'gemini', name: 'Google Gemini' }
      ];

      // Load settings from localStorage
      this.loadSettings();

      // Load conversations from localStorage
      this.loadConversations();

      // If no current conversation, create one
      if (!this.currentConversation.id) {
        this.newConversation();
      }

      // Copy settings to temp for modal
      this.tempSettings = { ...this.settings };

      // Update available models
      this.updateAvailableModels();
    },

    // Settings Management
    loadSettings() {
      try {
        const saved = localStorage.getItem('etnochat_settings');
        if (saved) {
          this.settings = JSON.parse(saved);
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    },

    saveSettings() {
      // Copy temp settings to actual settings
      this.settings = { ...this.tempSettings };

      // Save to localStorage
      try {
        localStorage.setItem('etnochat_settings', JSON.stringify(this.settings));
      } catch (e) {
        console.error('Failed to save settings:', e);
      }

      this.showSettings = false;
      this.validationStatus = '';
    },

    onProviderChange() {
      this.tempSettings.model = '';
      this.updateAvailableModels();
      this.validationStatus = '';
    },

    updateAvailableModels() {
      const modelsByProvider = {
        claude: [
          { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
          { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
          { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' }
        ],
        openai: [
          { id: 'gpt-4o', name: 'GPT-4o' },
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
        ],
        gemini: [
          { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
          { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
          { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' }
        ]
      };

      this.availableModels = modelsByProvider[this.tempSettings.provider] || [];
    },

    async validateKey() {
      if (!this.tempSettings.apiKey || !this.tempSettings.provider) return;

      this.validationStatus = 'validating';
      this.validationError = '';

      try {
        const response = await fetch('/etnochat/api/validate-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: this.tempSettings.provider,
            apiKey: this.tempSettings.apiKey
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

    // Conversation Management
    loadConversations() {
      try {
        const saved = localStorage.getItem('etnochat_conversations');
        if (saved) {
          this.conversations = JSON.parse(saved);

          // Load most recent conversation
          if (this.conversations.length > 0) {
            this.currentConversation = { ...this.conversations[0] };
          }
        }
      } catch (e) {
        console.error('Failed to load conversations:', e);
      }
    },

    saveConversations() {
      try {
        localStorage.setItem('etnochat_conversations', JSON.stringify(this.conversations));
      } catch (e) {
        console.error('Failed to save conversations:', e);
      }
    },

    newConversation() {
      const newConv = {
        id: this.generateId(),
        title: '',
        provider: this.settings.provider,
        model: this.settings.model,
        createdAt: new Date().toISOString(),
        messages: []
      };

      this.currentConversation = newConv;
      this.conversations.unshift(newConv);
      this.saveConversations();
    },

    loadConversation(id) {
      const conv = this.conversations.find(c => c.id === id);
      if (conv) {
        this.currentConversation = { ...conv };
      }
    },

    deleteConversation(id) {
      const index = this.conversations.findIndex(c => c.id === id);
      if (index !== -1) {
        this.conversations.splice(index, 1);
        this.saveConversations();

        // If deleted current conversation, load another or create new
        if (this.currentConversation.id === id) {
          if (this.conversations.length > 0) {
            this.currentConversation = { ...this.conversations[0] };
          } else {
            this.newConversation();
          }
        }
      }
    },

    updateCurrentConversation() {
      const index = this.conversations.findIndex(c => c.id === this.currentConversation.id);
      if (index !== -1) {
        this.conversations[index] = { ...this.currentConversation };
        this.saveConversations();
      }
    },

    // Chat Functions
    async sendMessage() {
      const message = this.inputMessage.trim();
      if (!message || this.isStreaming || !this.settings.apiKey) return;

      // Add user message
      this.currentConversation.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });

      // Update title if first message
      if (this.currentConversation.messages.length === 1) {
        this.currentConversation.title = message.slice(0, 50) + (message.length > 50 ? '...' : '');
      }

      this.inputMessage = '';
      this.isStreaming = true;
      this.updateCurrentConversation();

      // Scroll to bottom
      this.$nextTick(() => this.scrollToBottom());

      try {
        const response = await fetch('/etnochat/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: this.settings.provider,
            apiKey: this.settings.apiKey,
            model: this.settings.model,
            messages: this.currentConversation.messages
          })
        });

        if (!response.ok) {
          throw new Error('Chat request failed');
        }

        // Handle SSE streaming
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = {
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString()
        };

        this.currentConversation.messages.push(assistantMessage);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  assistantMessage.content += parsed.text;
                  // Update the last message in the array
                  this.currentConversation.messages[this.currentConversation.messages.length - 1] = { ...assistantMessage };
                  this.$nextTick(() => this.scrollToBottom());
                }
                if (parsed.error) {
                  console.error('Stream error:', parsed.error);
                }
              } catch (e) {
                // Ignore JSON parse errors for incomplete chunks
              }
            }
          }
        }

        this.updateCurrentConversation();
      } catch (e) {
        console.error('Chat error:', e);
        this.currentConversation.messages.push({
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
          timestamp: new Date().toISOString()
        });
        this.updateCurrentConversation();
      } finally {
        this.isStreaming = false;
      }
    },

    sendSuggestion(text) {
      this.inputMessage = text;
      this.sendMessage();
    },

    // Utility Functions
    generateId() {
      return 'conv_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    formatDate(isoString) {
      if (!isoString) return '';
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatTime(isoString) {
      if (!isoString) return '';
      const date = new Date(isoString);
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    renderMarkdown(content) {
      if (!content) return '';
      try {
        // Configure marked
        marked.setOptions({
          breaks: true,
          gfm: true,
          highlight: function(code, lang) {
            return code;
          }
        });
        return marked.parse(content);
      } catch (e) {
        console.error('Markdown render error:', e);
        return content;
      }
    },

    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };
}

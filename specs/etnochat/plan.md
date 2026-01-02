# Plano de Implementacao: etnoChat

> Feature: Chat com IA para consultas em linguagem natural sobre dados etnobotanicos
> Status: Planejado
> Data: 2025-01-02

## Resumo

Implementar o **etnoChat**, uma interface de chat com IA para consultas em linguagem natural sobre dados etnobotanicos do etnoDB. Suporta multiplos provedores de IA (Claude, OpenAI, Gemini) com API keys armazenadas no browser.

## Requisitos Confirmados

- **API Key**: Armazenada no browser (localStorage), inserida pelo usuario
- **Provedores de IA**: Multi-provider (Gemini, Claude, OpenAI) com selecao na interface
- **Validacao de chave**: Validar a chave e mostrar modelos disponiveis do provedor
- **Historico**: Persistente em localStorage entre sessoes

## Arquitetura

```
+------------------+      +------------------+      +------------------+
|    Browser       |      |  etnoDB Server   |      |   AI Provider    |
|   (Frontend)     |      |  (Port 3003)     |      |   (External)     |
+------------------+      +------------------+      +------------------+
| Alpine.js State  |<---->| Express Routes   |----->| Claude API       |
| localStorage     |      | /etnochat/*      |      | OpenAI API       |
| Chat UI          |      | MongoDB Access   |      | Gemini API       |
+------------------+      +------------------+      +------------------+
```

**Decisao**: Backend proxy unificado para todos os provedores
- Arquitetura consistente
- Integracao MongoDB server-side
- Seguranca das API keys

---

## Estrutura localStorage

```javascript
// etnochat_settings
{
  provider: 'claude',
  apiKey: 'sk-ant-...',
  model: 'claude-sonnet-4-20250514'
}

// etnochat_conversations
[{
  id: 'uuid',
  title: 'Plantas medicinais...',
  provider: 'claude',
  model: 'claude-sonnet-4-20250514',
  createdAt: '2025-01-02T10:30:00Z',
  messages: [{ role, content, timestamp }]
}]
```

---

## Endpoints da API

| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| `/etnochat` | GET | Pagina do chat |
| `/etnochat/api/validate-key` | POST | Validar API key |
| `/etnochat/api/models` | POST | Listar modelos disponiveis |
| `/etnochat/api/chat` | POST | Enviar mensagem (SSE streaming) |

---

## Arquivos a Criar

### Backend
```
backend/src/contexts/presentation/
├── prompts/
│   └── etnochat-system.md          # System prompt para IA
├── services/
│   └── etnochat.js                 # Servico de chat (integracao AI)
├── views/
│   ├── etnochat.ejs                # Pagina principal do chat
│   └── partials/
│       ├── chat-message.ejs        # Componente de mensagem
│       ├── chat-sidebar.ejs        # Sidebar com historico
│       └── chat-settings.ejs       # Modal de configuracoes
```

### Frontend
```
frontend/src/presentation/
├── scripts/
│   └── etnochat.js                 # Logica Alpine.js do chat
├── styles/
│   └── etnochat.css                # Estilos do chat
```

---

## Arquivos a Modificar

| Arquivo | Alteracoes |
|---------|-----------|
| `backend/src/contexts/presentation/routes.js` | Adicionar rotas /etnochat/* |
| `package.json` | Adicionar dependencias AI SDKs |

---

## Dependencias a Adicionar

```json
{
  "@anthropic-ai/sdk": "^0.39.0",
  "openai": "^4.77.0",
  "@google/genai": "^1.34.0",
  "marked": "^15.0.0"
}
```

---

## Fases de Implementacao

### Fase 1: Infraestrutura Basica do Chat
1. Criar `etnochat.ejs` com layout principal
2. Implementar gerenciamento de estado Alpine.js
3. Criar modal de configuracoes (selecao de provedor)
4. Implementar persistencia localStorage para settings
5. Adicionar estilos com Tailwind

### Fase 2: Integracao com Provedores de IA
1. Criar servico `etnochat.js` com abstracao de provedores
2. Implementar endpoints de validacao de key (cada provedor)
3. Implementar endpoint de listagem de modelos
4. Criar endpoint de chat com streaming SSE
5. Adicionar tratamento de erros

### Fase 3: Integracao com Banco de Dados
1. Escrever system prompt com esquema do banco
2. Implementar parsing de queries das respostas da IA
3. Criar executor de queries seguro com validacao
4. Integrar resultados no fluxo do chat
5. Formatar dados nas respostas

### Fase 4: Historico de Conversas
1. Implementar persistencia de conversas em localStorage
2. Criar sidebar com lista de conversas
3. Adicionar funcionalidade de trocar conversa
4. Implementar "Nova Conversa"
5. Adicionar exclusao de conversas

### Fase 5: Polimento e Melhorias
1. Adicionar renderizacao Markdown
2. Implementar UI de streaming
3. Adicionar estados de loading e animacoes
4. Melhorar mensagens de erro
5. Adicionar atalhos de teclado
6. Ajustes responsivos mobile

---

## Arquivos Criticos de Referencia

1. **`backend/src/contexts/presentation/routes.js`** - Padroes de rotas existentes
2. **`backend/src/contexts/presentation/views/painel.ejs`** - Padrao Alpine.js + layout
3. **`frontend/src/presentation/scripts/dashboard.js`** - Padroes JavaScript
4. **`backend/src/services/database.js`** - Padroes de queries MongoDB
5. **`backend/src/models/Reference.js`** - Esquema do banco para system prompt

---

## System Prompt (Resumo)

O arquivo `etnochat-system.md` contera:
- Apresentacao do etnoChat como assistente de dados etnobotanicos
- Esquema completo da colecao MongoDB (Reference)
- Lista dos 29 tipos de comunidades (Decreto 8.750/2016)
- Instrucoes para gerar queries MongoDB em JSON
- Restricao: sempre incluir `status: "approved"` nos filtros
- Diretrizes de resposta em portugues brasileiro

---

## Seguranca

- **Read-only**: Apenas operacoes `find` e `aggregate`
- **Approved only**: Todas queries incluem `status: "approved"`
- **Validacao**: Sanitizar todos os filtros
- **API keys**: Nunca logar, transmitir apenas via HTTPS

---

## Referencias

- Projeto de referencia: https://github.com/biopinda/Biodiversidade-Online
- MongoDB MCP Server: https://github.com/mongodb-js/mongodb-mcp-server
- Anthropic SDK: https://www.npmjs.com/package/@anthropic-ai/sdk
- OpenAI SDK: https://github.com/openai/openai-node
- Google GenAI SDK: https://www.npmjs.com/package/@google/genai

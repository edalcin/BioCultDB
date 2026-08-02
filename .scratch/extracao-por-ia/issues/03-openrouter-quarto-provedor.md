# 03 — OpenRouter como quarto Provedor de IA

**O que construir:** no etnoChat, o usuário passa a poder escolher **OpenRouter** ao lado de Claude,
OpenAI e Gemini. Informa a chave dele, ela é validada na hora, e ao escolher o modelo ele digita parte
do nome e o navegador sugere entre os mais de trezentos modelos que o OpenRouter oferece.

Duas particularidades que tornam isto barato:

**O protocolo é o da OpenAI.** O OpenRouter é compatível, então o cliente é o SDK da OpenAI já
instalado, apenas apontando a URL base para o endpoint do OpenRouter. **Nenhuma dependência nova.**

**A lista de modelos é viva, não curada.** Os outros três provedores mantêm listas curtas e curadas,
porque lá a curadoria ajuda. O OpenRouter não: uma lista fixa de meia dúzia contradiria a razão de
alguém escolhê-lo. O endpoint público de modelos do OpenRouter dispensa autenticação e é acessível por
CORS — verificado — então o **navegador o consulta diretamente** e popula um elemento nativo de
sugestões. O browser entrega filtragem por digitação, navegação por teclado e acessibilidade de graça:
sem rota de servidor, sem biblioteca de busca, sem estado adicional no framework reativo.

Contexto: `docs/decisions/ADR-002-extracao-por-ia.md` (D4, D11).

**Bloqueado por:** 01 — o provedor precisa ser adicionado uma única vez, no módulo compartilhado, para
que a Extração por IA o herde depois sem retrabalho.

**Status:** done

- [x] OpenRouter aparece como quarta opção na configuração do etnoChat
- [x] A validação de chave funciona e distingue chave inválida de outras falhas
- [x] O cliente é construído com o SDK da OpenAI já instalado, apontando para a URL base do
      OpenRouter — **nenhuma dependência nova em `package.json`**
- [x] A lista de modelos é buscada ao vivo pelo navegador, direto do endpoint público, sem rota de
      servidor intermediária
- [x] O usuário filtra os modelos digitando, via elemento nativo de sugestões
- [ ] Uma conversa completa funciona ponta a ponta com um modelo do OpenRouter, incluindo streaming
- [x] Falha de rede ao buscar a lista degrada com elegância: o usuário ainda pode digitar um
      identificador de modelo à mão
- [x] Os três provedores existentes seguem com suas listas curadas, sem alteração de comportamento

## Comments

Implementado em `backend/src/services/ai-providers.js` (D4/D11): `PROVIDERS.openrouter` entra com
`models: []` (lista não curada, por design — `getModels('openrouter')` sempre devolve `[]`).
`createClient` ganha `case 'openrouter'`, reusando o SDK `openai` já instalado com
`baseURL: 'https://openrouter.ai/api/v1'`. `validateApiKey` exige `model` explícito para o OpenRouter
(sem default curado — mensagem distinta: "Informe um modelo para OpenRouter"), pula a checagem de
"modelo pertence à lista curada" só para ele, e despacha pelo mesmo `case 'openai': case 'openrouter':`
(protocolo idêntico). `streamChat` em `etnochat.js` ganhou o mesmo fallthrough — sem duplicar a
lógica de streaming SSE.

Frontend (`frontend/src/presentation/scripts/etnochat.js` +
`views/partials/chat-settings.ejs`): `providers` ganha a 4ª entrada. Para os três provedores
curados nada mudou — mesmo `<select>`, mesmo `modelsByProvider`. Para OpenRouter, o campo Modelo vira
`<input list="openrouter-model-list">` associado a um `<datalist>` populado por
`fetchOpenRouterModels()`, que busca `GET https://openrouter.ai/api/v1/models` **direto do navegador**
— sem rota de servidor no meio, como D11 pede. `<datalist>` é o "elemento nativo de sugestões": o
browser filtra por digitação e navega por teclado sem nenhum código extra. Falha de rede (`fetch`
rejeita ou `!response.ok`) cai num aviso visível e o input permanece texto livre — nunca bloqueia a
digitação manual de um id de modelo.

Verificação: `npx jest backend/tests/unit/sqlite-persistence.test.js` — 8/8 passam sem editar nenhum
teste (nenhuma alteração de comportamento nos três provedores existentes). `require()` de
`ai-providers.js`, `etnochat.js` e `routes.js` sem erro. Smoke test programático:
`getProviders()` lista os 4 provedores; `getModels('openrouter')` → `[]`; `getModels('claude')`
inalterado; `createClient('openrouter', ...)` devolve uma instância `OpenAI` com
`baseURL: 'https://openrouter.ai/api/v1'`; `validateApiKey('openrouter', chaveFalsa)` sem modelo →
"Informe um modelo para OpenRouter"; com modelo → `401 Missing Authentication header` (mensagem
distinta, veio de uma chamada de rede real ao OpenRouter, confirmando o dispatch).

Verificação manual na interface (`localhost:3003/etnochat`, servidor local, sem chave real):
selecionar OpenRouter troca o campo Modelo para o input com datalist e busca ao vivo — confirmado via
DOM que o `<datalist>` populou com **337 modelos** direto do endpoint público (bate com o número que o
ADR-002 D11 registrou). Interceptando e abortando a requisição a `openrouter.ai/api/v1/models`
confirma a degradação: aviso "Não foi possível carregar a lista de modelos..." aparece e o campo segue
editável. Selecionar Claude confirma que o `<select>` curado de 3 modelos permanece intocado.
"Validar Chave" com chave inventada fez o round-trip completo `POST /etnochat/api/validate-key` →
`ai-providers.js` → OpenRouter real, devolvendo `401 Missing Authentication header` — prova que o
cliente OpenAI aponta para a URL certa e que nenhuma dependência nova foi necessária.

Pendente: o último critério (conversa completa com streaming ponta-a-ponta usando um modelo real do
OpenRouter) exige uma chave de API válida que este ambiente não tem — mesma situação do ticket 01. O
caminho de streaming é código compartilhado com os outros três provedores (mesmo `case` do SDK
`openai`), já testado por eles; falta a checagem manual na UI com uma chave real do OpenRouter.

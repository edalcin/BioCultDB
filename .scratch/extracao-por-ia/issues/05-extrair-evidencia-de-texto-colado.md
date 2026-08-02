# 05 — Extrair uma Evidência a partir de texto colado

**O que construir:** o caminho inteiro da Extração por IA, ponta a ponta, com o texto do artigo colado
à mão.

O pesquisador abre a Extração por IA na Aquisição, configura seu Provedor de IA e sua chave, cola o
texto de um artigo científico numa caixa, escolhe o modelo e aciona. Vê o progresso. Ao final, uma
**Evidência pendente** foi gravada, com a origem carimbada, e ela aparece na Curadoria junto de todas
as outras. Um link leva direto a ela.

Este é o ticket tracer-bullet: prova interface, rota, provedor, parser, gravação e Curadoria de uma
vez, sem o pdf.js no meio. A leitura de PDF vem no ticket 06 e é comparativamente simples — o risco de
integração está todo aqui.

**A entrada por texto colado é permanente, não andaime.** Depois do ticket 06 ela continua existindo,
ao lado do seletor de arquivo: cobre o PDF escaneado sem camada de texto, que de outro modo só
produziria erro, e é a alternativa se a validação do ticket 08 reprovar a qualidade do pdf.js.

### Configuração e chave

A configuração do provedor na Aquisição é **independente** da do etnoChat. `localStorage` é isolado
por origem, e a porta faz parte da origem: a configuração da Apresentação é inacessível à Aquisição.
Não há como unificar sem guardar a chave no servidor, que é exatamente o que se evita. O usuário
informa a chave uma vez por contexto — custo aceito e registrado.

**A chave transita pelo servidor, mas nunca é persistida.** O navegador a envia no corpo da
requisição, o servidor instancia o SDK, chama o provedor e descarta. Nunca vai para disco, banco, log
ou variável de ambiente. É o que o etnoChat já faz. Nenhum log pode conter a chave, nem parcialmente.

### Resultado

**A Evidência é sempre gravada como pendente, mesmo incompleta.** Não há bloqueio por campo
obrigatório ausente. Bloquear duplicaria na extração um julgamento que pertence à Curadoria, e com
menos informação: a extração não sabe se o ano falta porque a IA errou ou porque o artigo não o traz.
Pior, descartaria uma extração que acertou dezenas de Comunidades Tradicionais e Plantas por causa de
um campo de cabeçalho.

A origem vai no campo de fonte, no formato `extração IA — <provedor>/<modelo>`. Esse campo já é coluna
gerada e indexada, então filtrar por ele na Curadoria sai de graça.

### O parser é a costura de teste desta funcionalidade

Uma função **pura, sem I/O**: recebe o texto cru que o modelo devolveu e produz um documento de
Evidência ou uma falha descrita. É onde mora o risco real, e não precisa de rede, chave nem banco para
ser exercitada. Todos os casos listados abaixo são bugs plausíveis, não hipóteses — o app desktop
tinha um conversor dedicado só para o caso de lista chegando como texto com vírgulas.

Contexto: `.scratch/extracao-por-ia/spec.md`, `docs/decisions/ADR-002-extracao-por-ia.md` (D5, D9).

**Bloqueado por:** 02 (para nascer falando Evidência), 03 (para a configuração de provedor ser
construída uma vez já com os quatro), 04 (para consumir o Prompt de Extração persistido em vez de ler
o arquivo direto).

**Status:** done

- [x] A tela de Extração por IA existe na Aquisição, com configuração de provedor, chave e modelo
- [x] A configuração é independente da do etnoChat e persiste entre sessões no navegador
- [x] A chave é validada no momento em que é informada, com mensagem distinta para chave inválida
- [x] Colar texto e acionar produz uma Evidência **pendente**, visível na Curadoria
- [x] A fonte é carimbada como `extração IA — <provedor>/<modelo>`
- [x] A Curadoria consegue filtrar as Evidências por essa origem
- [x] Extração incompleta é gravada mesmo assim, nunca descartada
- [x] Há indicação de progresso distinguindo consulta à IA de gravação
- [x] Mensagens específicas para limite de uso do provedor, texto excedendo a janela do modelo, e
      resposta malformada — nenhuma delas quebra a tela
- [x] Após uma falha, é possível tentar de novo sem reconfigurar nada
- [x] **A chave nunca aparece em log algum**, nem truncada
- [x] O parser é função pura, testada com: resposta cercada por marcação de bloco de código; texto
      explicativo antes ou depois do JSON; JSON inválido produzindo erro descritivo e não exceção
      crua; obrigatórios ausentes produzindo Evidência parcial e não falha; campo de lista chegando
      como texto com vírgulas; aninhamento de Comunidades Tradicionais e Plantas preservado; estado
      pendente e fonte corretos; resposta vazia ou só espaço em branco

## Comments

**Parser** (`backend/src/services/extraction-parser.js`, pura, sem I/O): `parseExtractionResponse(rawText,
{provider, model})` extrai o JSON de dentro de cerca ```` ```json ```` ou de texto explicativo ao redor
(primeira `{` até a última `}`, depois de tentar a cerca), faz `JSON.parse` num `try/catch` que nunca
deixa a exceção escapar, normaliza campos (`autores`/`atividadesEconomicas`/`nomeCientifico`/
`nomeVernacular`/`tipoUso` aceitam array real OU string separada por vírgula), aplica a mesma regra de
nome vernacular do resto do projeto (minúsculo, hífen no lugar de espaço), e já devolve o documento
**com `status: 'pending'` e `fonte: 'extração IA — <provedor>/<modelo>'`** — pronto para
`insertEvidence` (que não passa por `validateEvidence`, então nenhum campo obrigatório ausente bloqueia
a gravação, D9). 10 testes em `backend/tests/unit/extraction-parser.test.js` cobrindo exatamente a
lista do ticket.

**Backend** (`ai-providers.js`): novo `completeText(provider, apiKey, model, systemPrompt, userText)` —
conclusão única, sem streaming, reusando o mesmo dispatch por SDK de `validateApiKey`/`streamChat`
(D4), zero dependência nova. **Rotas na Aquisição** (`contexts/acquisition/routes.js`):
`GET /extracao-ia` (tela), `GET /api/providers`, `GET /api/models`, `POST /api/validate-key` (mesmo
módulo `ai-providers` do etnoChat), `POST /api/consultar` (chama `completeText` com o Prompt de
Extração de `getExtractionPrompt()` + o texto colado, devolve o texto cru), `POST /api/gravar`
(roda o parser sobre o texto cru e grava via `insertEvidence`). Duas rotas, não uma, de propósito: dão
ao cliente dois round-trips reais para mostrar "Consultando IA..." e "Salvando..." como fases
distintas, não cosméticas.

**Chave nunca em log, nem truncada** — achado durante a verificação manual: a própria OpenAI devolve
o erro 401 com uma **versão mascarada** da chave (`sk-defin**********************-xyz`), que não é um
substring literal da chave original — um redact ingênuo por string-replace não pegaria isso. Resolvido
com `logger.redactApiKey()` (novo, em `shared/logger.js`), um regex sobre o formato dos prefixos de
chave dos quatro provedores (`sk-`, `sk-ant-`, `sk-or-`, `AIza`) que casa tanto a chave real quanto a
reprodução mascarada do provedor. Aplicado no log de erro e na mensagem devolvida ao cliente em
`/api/consultar`, e retroativamente em `validateApiKey` (`ai-providers.js`) — a mesma exposição já
existia ali desde o ticket 01/03 e serve tanto o etnoChat quanto `/extracao-ia/api/validate-key`.

**Frontend** (`frontend/src/acquisition/scripts/extraction.js` + `views/extracao-ia.ejs` +
`views/partials/extraction-settings.ejs`): `localStorage` key `extracao_settings`, independente de
`etnochat_settings` (D5) — mesmo componente de configuração do etnoChat (provedor curado ou
OpenRouter com datalist ao vivo), replicado aqui porque cada porta tem sua própria origem e não há como
compartilhar sem guardar a chave no servidor. `extrair()` orquestra os dois round-trips, fases
`consultando`/`salvando`/`sucesso`/`erro`; erro preserva `texto` e `settings`, mostra "Tentar
Novamente" sem pedir reconfiguração. Sucesso mostra link direto para
`http://<host>:3002/evidence/edit/<id>`.

**Curadoria**: `buildWhereClause` ganhou `query.fonteContains` (LIKE sobre a coluna gerada `fonte`,
valor sempre passado como parâmetro ligado — nunca concatenado). Rota `GET /` aceita `?origem=ia`
(→ `fonteContains: 'extração IA'`) ou `?origem=etnodb` (→ `fonte: 'etnodb'` exato). Nova seção
"Filtrar por Origem" na lista, nova coluna "Origem" com badge. Corrigido de passagem: a coluna
"Ações" da lista linkava `evidence._id` (sempre `undefined` — resíduo da era MongoDB) em vez de
`evidence.id`, dentro do bloco que já estava sendo reescrito para adicionar a coluna nova.

**Verificação automatizada**: suíte completa 22/22 (12 SQLite/DSL + 10 parser), nenhum teste existente
editado. `require()` de todos os módulos tocados sem erro.

**Verificação manual, ponta a ponta, servidor local**:
- Configuração isolada: `localStorage.getItem('etnochat_settings')` continua `null` depois de
  configurar só a Extração por IA — confirma D5.
- Fluxo feliz: mock só de `/api/consultar` (a chamada de rede ao provedor real), `/api/gravar` bateu no
  backend de verdade. Resultado: Evidência gravada, aberta em `/evidence/edit/<id>` na Curadoria
  (porta 3002) com `Fonte: extração IA — claude/claude-sonnet-4-5-20250929` exibida, `Status: Pendente`,
  autores/atividades econômicas devolvidos corretamente a partir de texto com vírgula, nome vernacular
  `"picao preto"` gravado como `"picao-preto"`.
- Extração incompleta (resposta só com `resumo`, todo o resto ausente): salvou mesmo assim — D9
  confirmado na prática, não só no parser.
- Resposta verdadeiramente malformada (JSON quebrado): erro descritivo na tela, nada gravado, sem
  crash.
- Chave inválida real: `POST /api/consultar` contra a OpenAI de verdade com uma chave inventada devolveu
  `401 Incorrect API key provided: [REDACTED]...` — tanto na resposta ao cliente quanto no log do
  servidor (`hub logs`), confirmando a correção do redact.
- Filtro de origem: `GET /?origem=ia` na Curadoria devolveu exatamente o registro esperado, com o badge
  "Extração por IA".

Pendente (mesma classe do ticket 01/03): as mensagens específicas de **limite de uso** e **janela de
contexto excedida** (`classifyProviderError`) são casamento de string determinístico, revisado por
código, mas não *exercitado* contra uma condição real de rate-limit/context-overflow de um provedor —
isso consumiria cota ou exigiria um texto artificialmente enorme. A lógica é a mesma usada e já
validada para "chave inválida"/"resposta malformada" nesta sessão.

# 04 — Prompt de Extração editável e persistido

**O que construir:** o curador abre uma tela na Aquisição, lê o **Prompt de Extração** em uso, edita,
salva, recarrega a página e vê exatamente o que digitou. Um botão restaura o padrão. A tela informa
quando o prompt foi alterado pela última vez.

O Prompt de Extração é o texto que instrói o modelo sobre o que extrair de um artigo e em que forma
devolver. Hoje ele é um valor fixo no código do app desktop; aqui vira artefato editorial da Unidade
Federada — quem edita, muda a qualidade de tudo que for extraído depois.

**Fica no SQLite da unidade, não no navegador.** Ao contrário da chave de API, o prompt não é segredo,
e há razão forte para centralizá-lo: guardado por navegador, dois curadores da mesma unidade
extrairiam com prompts diferentes sem saber, e a divergência de resultados seria inexplicável.

Isso exige a **primeira tabela de configuração do projeto** — chave, valor e data de atualização —
criada de forma idempotente junto do restante do schema. Os acessores ficam na camada de serviço de
dados que já atende as Evidências, e não num módulo de configuração novo: é a mesma camada, já coberta
por testes.

O valor padrão continua **versionado como arquivo no repositório**, do mesmo modo que o prompt do
etnoChat já é, e semeia a linha no primeiro boot. Restaurar o padrão relê esse arquivo.

**O editor é uma área de texto monoespaçada.** Editor rich-text foi avaliado e rejeitado: o prompt
contém um bloco JSON literal e uma lista delimitada por barras verticais, e vai *verbatim* para o
modelo — conversão de aspas, indentação ou quebras de linha corromperia o conteúdo. Ver ADR-002 D7
antes de reabrir essa discussão.

O prompt padrão a usar como semente é o do BioCultPapers, que já está afinado para este domínio:
princípio de copiar exatamente e nunca inventar, completude de Comunidades Tradicionais e Plantas,
regras de formatação, a lista dos 29 tipos válidos de comunidade e a estrutura JSON esperada.

Contexto: `docs/decisions/ADR-002-extracao-por-ia.md` (D6, D7).

**Bloqueado por:** nada — pode começar imediatamente.

**Status:** done

- [x] Existe uma tabela de configuração chave-valor com data de atualização, criada de forma
      idempotente junto do restante do schema
- [x] Os acessores de leitura e escrita ficam na camada de serviço de dados existente, não num módulo
      novo
- [x] O prompt padrão é um arquivo versionado no repositório e semeia a linha no primeiro boot
- [x] A tela permite ler, editar e salvar o prompt, numa área de texto monoespaçada
- [x] **O texto salvo é preservado byte a byte** — quebras de linha, indentação e aspas retas
      sobrevivem a um ciclo de salvar e recarregar. O bloco JSON dentro do prompt continua íntegro
- [x] Restaurar o padrão devolve o conteúdo do arquivo versionado
- [x] A tela mostra quando o prompt foi alterado pela última vez
- [x] Testes cobrem: leitura antes de qualquer escrita devolve o padrão semeado; escrita e releitura
      preservam o texto exatamente; restauração volta ao arquivo; a data de atualização muda a cada
      escrita

## Comments

Tabela: `app_config(key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)`, criada em
`backend/src/shared/database.js` `_ensureSchema()`, idempotente (`CREATE TABLE IF NOT EXISTS`) junto
do resto do schema.

Acessores em `backend/src/services/database.js` (mesma camada de `insertEvidence`/`findEvidenceById`,
não um módulo novo): `getConfig`/`setConfig` genéricos (upsert via `ON CONFLICT`, `updated_at` sempre
recarimbado) e, sobre eles, `getExtractionPrompt`/`saveExtractionPrompt`/`restoreDefaultExtractionPrompt`
específicos do Prompt de Extração. `getExtractionPrompt` semeia a linha na **primeira leitura** (não
há gancho de "boot" nesta camada, e nada escreve a chave antes de a tela carregá-la pela primeira vez
— efeito idêntico ao pedido).

Padrão versionado em `backend/src/prompts/extraction-default.md` — mesmo diretório de nível que
`services/`/`models/`, já que o acessor mora em `services/database.js` e não num contexto específico.
Conteúdo é o `DefaultExtractionPrompt` real do BioCultPapers
(`src/EtnoPapers.Core/Services/AIProviderService.cs`, buscado do repositório `edalcin/BioCultPapers`
no GitHub): princípio de copiar exatamente, regra N:N de comunidades/plantas, lista dos 29 tipos de
comunidade separada por `|`, e o bloco JSON literal — convertido de string verbatim C# (`""` → `"`)
para o arquivo `.md`.

Tela em `backend/src/contexts/acquisition/views/extraction-prompt.ejs`, rotas em
`contexts/acquisition/routes.js`: `GET /extraction-prompt` (lê + semeia), `POST /extraction-prompt`
(salva), `POST /extraction-prompt/reset` (restaura). `<textarea class="font-mono ... whitespace-pre">`
monoespaçada, sem editor rich-text (D7). O texto do servidor entra via `<%= prompt %>` — EJS escapa
entidades HTML, e o parser de `<textarea>` do navegador as decodifica de volta ao valor original: é
round-trip sem perda para quebras de linha, aspas e o bloco JSON. Timestamp formatado com
`toLocaleString('pt-BR')`. Nav adicionada tanto na tela nova quanto em `views/index.ejs`
("Entrada de Dados" / "Prompt de Extração").

Verificação automatizada: 4 testes novos em `backend/tests/unit/sqlite-persistence.test.js`
("app_config (Prompt de Extração, ADR-002 D6)") — leitura antes de qualquer escrita devolve o arquivo
semeado; escrita+releitura preserva texto com indentação, JSON e aspas retas exatamente; restauração
volta ao arquivo; `updatedAt` muda a cada escrita (comparado por timestamp, não só desigualdade de
string). Suíte completa: 12/12 (8 preexistentes + 4 novos), nenhum teste existente editado.

Verificação manual na interface (`localhost:3001/extraction-prompt`, servidor local): primeira carga
mostra os 2104 bytes do arquivo padrão (`startsWith`/`endsWith` conferem literalmente); editei o
textarea com um trecho contendo indentação e um bloco `{"chave": "valor"}`, salvei, **recarreguei a
página do zero** (`tab.goto`, não apenas estado do cliente) — o valor voltou exatamente igual,
confirmando persistência server-side byte a byte; cliquei "Restaurar Padrão" — voltou aos 2104 bytes
originais.

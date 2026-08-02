# ADR-002: Extração por IA — absorção do BioCultPapers pelo BioCultDB

## Status

**Aceito** — decidido em sessão de `grill-with-docs` em 2026-08-02. Nenhum código foi alterado ao
produzir este documento: é decisão, não implementação.

Decisão arquitetural de origem a ser registrada em paralelo:
`Arquitetura-BioCultural/docs/architecture-decisions/ADR-011` (absorção do BioCultPapers), que
supersede o **D7** do ADR-004 e o **DA6** do ADR-005. Esta ADR é a contraparte operacional local —
complementa, não substitui, aquela.

## Contexto

O **BioCultPapers** é um aplicativo desktop Windows (.NET 8, WPF, MVVM) que extrai metadados
etnobotânicos de artigos científicos em PDF usando provedores de IA em nuvem, persiste localmente e
**entrega ao BioCultDB por exportação de arquivo JSON** — fronteira estabelecida pelo ADR-005 DA6.
Essa entrega manual é o atrito que esta decisão elimina: a extração passa a acontecer dentro do
BioCultDB, gravando direto no SQLite da unidade.

### Premissa corrigida

O pedido original supunha que a absorção "facilitaria a migração do BioCultPapers do MongoDB para o
SQLite". **Isso já aconteceu.** O BioCultPapers persiste em SQLite desde a emenda 1.1.0 da sua
constitution (`.specify/memory/constitution.md:98`), em cumprimento ao ADR-005 —
`src/EtnoPapers.Core/Services/DataStorageService.cs:35` cria `records(id TEXT PRIMARY KEY, data TEXT
NOT NULL)` com `PRAGMA journal_mode=WAL`. Não há MongoDB vivo no BioCultPapers.

O ganho real desta absorção é outro: **eliminar a entrega por arquivo**, e com ela o passo manual de
exportar/importar entre duas aplicações que já falam o mesmo modelo de documento.

### O que já existia no BioCultDB (não reinventar)

| Ativo | Onde | Relevância |
|---|---|---|
| `etnoChat` funcionando, multi-provedor | `backend/src/contexts/presentation/services/etnochat.js` (575 linhas) | Já resolve chave-no-browser; é o padrão a reusar |
| Chave de API só no browser | `frontend/src/presentation/scripts/etnochat.js`, `localStorage.etnochat_settings` | Precedente do requisito de segurança |
| SDKs dos três provedores instalados | `package.json` (`@anthropic-ai/sdk`, `openai`, `@google/genai`) | Zero dependência nova de provedor |
| Aquisição e Curadoria completas | contextos 3001 e 3002 | Tornam desnecessário portar a metade de gestão do BioCultPapers |
| Importador do JSON do desktop | `backend/src/scripts/import-papers.js` | Caminho de migração já construído |
| Modelo de documento idêntico | `backend/src/models/Reference.js` ≡ `ArticleRecord.cs` | Não há tradução de schema a fazer |

## Decisões

### D1 — Absorver apenas a extração

O BioCultPapers tem duas metades: a **extração** (PDF → texto → IA → JSON validado) e a **gestão dos
extraídos** (grid, edição, exclusão, exportação). Só a primeira é absorvida.

A gestão já existe: Aquisição (3001) e Curadoria (3002) operam sobre `biocultdb_records`. O
`EditRecordDialog` **não é portado**.

Consequência de UX aceita: no desktop, revisa-se *antes* de gravar; aqui, grava-se como pendente e
revisa-se na Curadoria. O passo de revisão não desaparece — muda de lugar, para o lugar onde já
existia.

### D2 — O PDF nunca chega ao servidor

A extração de texto acontece **no browser**, com `pdf.js`. O servidor recebe texto, nunca o arquivo.

Descartada a alternativa de upload multipart com parsing em memória: exigiria `multer` + parser de
PDF no servidor (duas dependências novas, pressão de RAM no container) para uma garantia mais fraca
— "não armazenamos" em vez de "não recebemos". Não existe hoje nenhum tratamento de upload no
BioCultDB (`AUDIO_STORAGE_PATH` está comentado e não é usado, `.env.example:38`).

Custo aceito: perde-se o Markdown estruturado que o `PdfPig`/`MarkdownConverter` produzia; o modelo
recebe texto corrido. **A diferença de qualidade não foi medida.**

### D3 — DOI fica fora do núcleo

Buscar artigos por DOI é capacidade **nova** — não existe no BioCultPapers, que trata DOI como campo
de texto preenchido pela IA a partir do corpo do artigo (`AIProviderService.cs:117`).

Fica adiado em dois níveis independentes:

- **Nível 1 — metadados (Crossref).** Preenche título/autores/ano. Verificado nesta sessão:
  `api.crossref.org` serve `access-control-allow-origin: *`, então o browser consulta direto, sem
  código de servidor. Ticket futuro, barato e isolado.
- **Nível 2 — texto completo aberto (Unpaywall + proxy).** Único que substitui o upload, e só quando
  o artigo é aberto. Exige rota proxy no servidor (o publisher não serve CORS). **Só construir após
  medir a cobertura OA** numa amostra real de DOIs de etnobotânica.

Nenhum dos dois níveis extrai etnobotânica: comunidades, plantas e usos só existem no corpo do
artigo.

### D4 — Módulo de provedores compartilhado

`PROVIDERS`, validação de chave, listagem de modelos e criação de cliente saem de
`contexts/presentation/services/etnochat.js` (hoje `:24-49` e `:58-110`) para
**`backend/src/services/ai-providers.js`**. O `etnochat.js` passa a consumi-lo e retém só o que é
dele (prompt do chat, DSL de query, streaming). A Extração por IA consome o mesmo módulo do contexto
de Aquisição.

**OpenRouter** entra como quarto provedor usando o SDK `openai` já instalado, com
`baseURL: 'https://openrouter.ai/api/v1'` — protocolo compatível, **zero dependência nova**.

Risco aceito: refatorar 575 linhas em produção. Mitigado pelo teste existente que cobre a DSL
(`backend/tests/unit/sqlite-persistence.test.js`).

### D5 — Chave de API por contexto, transitando sem ser persistida

`localStorage` é isolado por origem, e **porta faz parte da origem**: a chave que o etnoChat guarda
em `:3003` é invisível para a Aquisição em `:3001`. Não há como compartilhá-la entre contextos sem
enviá-la ao servidor para guardar — o que é justamente o que se quer evitar.

Portanto: **duas configurações independentes**, `etnochat_settings` (existente, intocada) e
`extracao_settings` (nova, na Aquisição), com o mesmo componente de UI e o mesmo módulo do D4.

**A chave transita pelo servidor** a cada requisição — o browser a envia no corpo do POST, o
servidor instancia o SDK, chama o provedor e descarta. Nunca é persistida: nem em disco, nem em
banco, nem em log, nem em variável de ambiente. É o comportamento que o `etnoChat` já tem. *"Não
guarda" não é o mesmo que "não passa por lá"*, e a distinção está registrada aqui de propósito.

Descartada a chamada direta browser→provedor: a Anthropic bloqueia chamadas de browser por padrão, e
duplicaria a lógica de provedores no cliente.

Descartado mover a Extração para a `:3003` para unificar a origem: a `:3003` é a porta **pública e
sem autenticação**, e escrita de Evidências ali seria escrita anônima no banco.

### D6 — Prompt de Extração em SQLite, semeado de arquivo

O prompt **não é segredo** — não há razão de segurança para mantê-lo fora do servidor, e há razão
forte para colocá-lo lá: em `localStorage`, dois curadores da mesma instância extrairiam com prompts
diferentes sem saber, e a divergência de resultados seria inexplicável.

Tabela nova `app_config(key TEXT PRIMARY KEY, value TEXT, updated_at)`, linha `extraction_prompt`. O
padrão continua versionado como arquivo no repositório (como `etnochat-system.md` já é) e semeia a
linha no primeiro boot; "restaurar padrão" relê o arquivo. Não existe nenhuma tabela de configuração
hoje.

Exposição declarada: a `:3001` não tem autenticação, então quem a alcança altera o prompt de todos.
Não é classe nova de risco — quem alcança a `:3001` já cria e altera Evidências — mas amplia a
superfície. Autenticação em 3001/3002 permanece fora de escopo (ADR-001, item 8).

### D7 — `<textarea>` monoespaçado, não TipTap

O pedido original era TipTap. Rejeitado por inadequação ao conteúdo, não por custo:

1. O prompt contém um bloco JSON literal e uma lista de 29 tipos de comunidade separada por `|`
   (`AIProviderService.cs:75-138`). Editor rich-text converte aspas retas em tipográficas,
   indentação em markup, quebras em `<p>` — e esse texto vai **verbatim** para o modelo.
2. TipTap produz HTML. Ou o HTML vai para o modelo (ruído), ou é convertido em texto ao salvar — e
   aí a formatação que o editor permitiu criar é descartada, anulando sua razão de existir.
3. O repositório não tem build step de JavaScript (Alpine, HTMX e Marked entram por CDN,
   `etnochat.ejs:187-193`). TipTap é ProseMirror em ESM e exigiria bundler, contra a regra de
   simplicidade e imagem pequena do `CLAUDE.md`.

CodeMirror 6 foi considerado como meio-termo correto para texto estruturado, e descartado pelo mesmo
custo de toolchain.

### D8 — Disponibilidade condicionada, visível porém desabilitada

O gating é necessariamente **client-side**: a chave vive no `localStorage`, então o servidor não sabe,
ao renderizar o HTML, se aquele usuário a tem. Alpine com `x-cloak` decide a exibição.

Sem chave, o item aparece apagado com o convite a configurar, em vez de sumir. Ocultar por completo
tornaria a funcionalidade mais cara do sistema indescobrível — ninguém configura chave para algo que
não sabe que existe. O objetivo real do requisito, não oferecer o que vai falhar, é atendido igual.

Aplica-se também ao `etnoChat`, que hoje está sempre visível: mudança pequena de comportamento
existente.

### D9 — Extração grava sempre como pendente

Não há bloqueio por campo obrigatório ausente. A Evidência extraída é gravada com `status` pendente e
`fonte: "extração IA — <provedor>/<modelo>"`.

Bloquear duplicaria no extrator um julgamento que pertence à Curadoria, e num lugar pior: o extrator
não sabe se falta o ano porque a IA falhou ou porque o artigo não o traz. Pior ainda, descartaria uma
extração que acertou 12 comunidades e 40 plantas por causa de um resumo ausente — jogaria fora
exatamente a parte cara.

`fonte` já é coluna gerada e indexada (`backend/src/shared/database.js`), então a Curadoria filtra
por ela e o curador vê o que veio de IA e ainda não passou por humano.

### D10 — Um PDF por vez

Sem processamento em lote.

Fila no servidor está descartada **por construção**: exigiria a chave no servidor, contra o D5. O
processamento é dirigido pelo browser, com a aba aberta.

### D11 — Modelos: lista curada para três, lista viva para o OpenRouter

Claude, OpenAI e Gemini mantêm listas curadas como hoje (`etnochat.js:24-49`) — são curtas, estáveis,
e a curadoria ajuda.

OpenRouter não: verificado nesta sessão, `GET https://openrouter.ai/api/v1/models` retorna **337
modelos**, é público e serve `Access-Control-Allow-Origin: *`. O browser busca direto e popula um
`<datalist>` nativo — o browser entrega filtragem por digitação, teclado e acessibilidade de graça,
sem UI de busca, sem biblioteca, sem estado no Alpine.

Lista curada de OpenRouter seria contradição: quem o escolhe, escolhe pela variedade.

### D12 — A funcionalidade chama-se "Extração por IA"

Descartado `etnoPapers` (simétrico a `etnoChat`, mas carrega o nome do produto sendo aposentado) e
"Extração" sozinho, que **colide com o domínio**: "Extrativistas" é um dos 29 tipos de comunidade e
"extração" aparece em atividades econômicas.

### D13 — A unidade de informação chama-se "Evidência"

Havia quatro nomes para a mesma coisa: `Reference` (modelo), `biocultdb_records` (tabela),
"referência" (interface) e `ArticleRecord`/"registro" (BioCultPapers).

Termo canônico: **Evidência** — o artigo científico é evidência da relação de uma comunidade
tradicional com a biodiversidade. O termo faz trabalho conceitual: fontes secundárias (artigos) e
primárias (relatos, no BioCultRelatos) são tipos diferentes de evidência da mesma relação.

**Uma Evidência é o artigo, não cada afirmação dentro dele.** Um artigo com 12 comunidades e 40
plantas é uma Evidência que documenta muitas relações. Modelar cada afirmação como Evidência
individual exigiria reestruturar o documento JSON, que é contrato compartilhado com o
`AcquisitionService` do BioCultTermos e com o `import-papers.js` — o ganho de precisão não paga.

Escopo do rename: **modelo, rotas e interface**. Explicitamente **não**: o nome da tabela
`biocultdb_records` nem os campos do JSON (`titulo`, `autores`, `comunidades`…) — contrato de dados.
Acoplamento a lembrar: `etnochat.js:14` importa `Status` de `models/Reference`.

Pendência de federação: "Evidência" é bom demais para ficar só no BioCultDB. Se o BioCultRelatos
chamar a mesma coisa de outro nome, a federação fala duas línguas. Vocabulário de arquitetura é
matéria do Comitê Federado (`governanca/propostaGovernanca.md` §7) — registrado como pendência, não
como bloqueio.

### D14 — Desktop aposentado, com migração única

"Congelado" significa **aposentado**, não "congelado mas ainda utilizável".

Meia-aposentadoria custaria caro: o esquema de Evidência teria dois produtores vivos, e no dia em que
um campo mudasse, o app .NET congelado continuaria produzindo o formato velho e o `import-papers.js`
viraria tradutor de versões sem mantenedor.

`import-papers.js` **permanece no repositório** como rede de segurança para algum
`biocultpapers.sqlite` esquecido, mas deixa de ser caminho anunciado.

**Ordem obrigatória**: implementar a extração → validar com PDFs reais → migrar os dados → congelar o
repositório. O congelamento é o último passo.

### D15 — Registro por superseção, não por emenda

Um **ADR-011** novo em `Arquitetura-BioCultural`, supersedindo explicitamente o D7 do ADR-004 e o DA6
do ADR-005 — em vez de emendar os documentos existentes.

É o hábito já estabelecido naquele repositório: o ADR-005 supersede o ADR-001 e o D5 do ADR-004, e o
ADR-001 está marcado `DEPRECATED` em vez de apagado. Emendar in loco apagaria a informação de que a
entrega por arquivo já foi a decisão correta em julho de 2026.

README, diagramas C4 e `CHANGELOG.md` (v3.5) são atualizados **no lugar** — são inventário do estado
atual, não registro de decisão.

## Consequências

### Trabalho a fazer em `Arquitetura-BioCultural`

| Documento | Estado atual | Ação |
|---|---|---|
| ADR-004, D7 | "BioCultPapers permanece componente exclusivo de iniciativas de fontes secundárias" | Supersedido pelo ADR-011 |
| ADR-005, DA1 | "BioCultPapers, por ser aplicativo desktop fora de container, não participa deste compartilhamento" | Supersedido pelo ADR-011 |
| ADR-005, DA6 | "BioCultPapers entrega por arquivo… exporta JSON que o BioCultDB importa" | Supersedido pelo ADR-011 |
| `README.md` | Lista BioCultPapers como app desktop .NET/WPF no inventário | Remover do inventário; descrever como funcionalidade do BioCultDB |
| `docs/c4-model/02-container-diagram.md` | Container .NET/WPF separado | Remover o container |
| `docs/c4-model/03-component-diagram.md` | — | Adicionar Extração por IA como componente do BioCultDB |
| `CHANGELOG.md` | v3.4 | Entrada v3.5 |

### Trabalho a fazer em `BioCultPapers`

Aviso em destaque no `README.md` declarando que a funcionalidade migrou para a Extração por IA dentro
do BioCultDB e que o repositório está congelado, sem atualizações futuras.

### Riscos aceitos

1. **Qualidade de extração não medida.** `pdf.js` no browser entrega texto corrido; o `PdfPig`
   entregava Markdown estruturado. O impacto sobre a qualidade da extração é desconhecido e deveria
   ser verificado com PDFs reais antes do congelamento (D14).
2. **Refatoração de código em produção.** Extrair o módulo de provedores mexe em `etnochat.js`, que
   funciona hoje.
3. **Prompt editável sem autenticação.** Ver D6.

### Fora de escopo

- DOI, níveis 1 e 2 (D3).
- Autenticação nas portas 3001/3002 — permanece como no ADR-001, item 8.
- Adoção de "Evidência" como vocabulário de toda a federação (D13).
- Processamento em lote (D10).

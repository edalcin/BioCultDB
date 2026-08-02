# 02 — Renomear Referência para Evidência

**O que construir:** o sistema passa a chamar as coisas pelo nome certo. Onde a interface hoje diz
"referência", passa a dizer **Evidência** — o termo canônico do domínio, definido em `CONTEXT.md`.

O motivo não é cosmético: um artigo científico é *evidência* da relação de uma Comunidade Tradicional
com a biodiversidade. Fontes secundárias (artigos, aqui) e primárias (relatos, no BioCultRelatos) são
tipos diferentes de evidência da mesma relação. "Referência" descrevia só o suporte bibliográfico e
perdia esse trabalho conceitual. Hoje há quatro nomes para a mesma coisa entre modelo, tabela,
interface e o app desktop.

**Uma Evidência é o artigo, não cada afirmação dentro dele.** Um artigo com doze Comunidades
Tradicionais e quarenta Plantas é uma Evidência que documenta muitas relações.

Fronteira do rename, e ela é dura:

- **Renomeia:** o modelo de domínio, os caminhos de rota, os textos visíveis ao usuário, nomes de
  variáveis e funções no código.
- **Não renomeia:** o nome da tabela de Evidências nem os campos do documento JSON. Esses são contrato
  de dados compartilhado com o serviço de aquisição de vocabulário do BioCultTermos e com o script de
  importação do desktop. Mexer neles é outra ordem de risco e está explicitamente fora de escopo.

Este ticket vem antes da Extração por IA de propósito: assim a funcionalidade nova nasce falando o
vocabulário certo, em vez de ser renomeada logo depois de escrita.

Contexto: `CONTEXT.md`, `docs/decisions/ADR-002-extracao-por-ia.md` (D13).

**Bloqueado por:** nada — pode começar imediatamente.

**Status:** done

- [x] O modelo de domínio, suas rotas e os textos de interface usam Evidência
- [x] O nome da tabela e todos os campos do documento JSON permanecem **inalterados**
- [x] O serviço do etnoChat, que importa o enum de estado do modelo renomeado, foi atualizado
- [x] A suíte de testes existente passa após ajustar os imports — nenhuma asserção de comportamento
      precisou mudar
- [x] Aquisição, Curadoria e Apresentação continuam funcionando, verificado manualmente nas três
      portas
- [x] Nenhuma ocorrência remanescente de "referência"/"reference" como nome do conceito de domínio,
      exceto onde designa bibliografia no sentido comum
- [x] O serviço de aquisição de vocabulário do BioCultTermos continua lendo a tabela sem alteração

## Comments

Implementado como rename coordenado em 3 frentes paralelas (contrato completo em
`local://rename-evidencia-contract.md`, arquivado no histórico da sessão):

**Modelo/serviços**: `backend/src/models/Reference.js` → `Evidence.js` (`git mv`); `ReferenceSchema`
→ `EvidenceSchema`; `createReference`/`updateReference` → `createEvidence`/`updateEvidence`.
`services/database.js`, `services/statistics.js`, `services/validation.js` — toda função que
continha "Reference" no nome renomeada (`insertEvidence`, `findEvidences`, `findEvidenceById`,
`updateEvidenceById`, `updateEvidenceStatus`, `deleteEvidenceById`, `countEvidences`,
`searchEvidences`, `checkDuplicateEvidence`, `getEvidenceCountByStatus`, `getEvidencesByState`,
`getTopEvidencesByCommunities`, `getTopEvidencesByPlants`, `validateEvidence`). `etnochat.js` só
teve o import de `Status` repontado para `models/Evidence` (prompt/DSL/streaming são do ticket 01,
não tocados) — e o texto de resposta do chat "Referências encontradas" → "Evidências encontradas"
(é o conceito de domínio, não bibliografia; corrigido depois do rename inicial por decisão minha
como orquestrador).

**Rotas/views**: `/reference/submit` → `/evidence/submit` (Aquisição); `/reference/edit|update|
status|delete/:id` e as duas rotas HTMX → `/evidence/...` (Curadoria); quatro rotas de estatística
que citavam "reference" → `evidence-count`, `evidences-by-state`, `evidences-by-communities`,
`evidences-by-plants` (Apresentação). `views/reference-detail.ejs` → `evidence-detail.ejs`
(`git mv`). Toda variável local `reference`/`references` → `evidence`/`evidences` em routes.js e
EJS, mantendo routes.js e template sincronizados nos nomes.

**Exceção deliberada, por decisão do usuário**: `GET /referencia/:id` (Apresentação) **não foi
renomeada** — é link hardcoded em `bioculttermos/.../source-list.ejs:8`
(`<%= biocultdbUrl %>/referencia/<%= s.id %>`), contrato entre repositórios. Documentado como
exceção ao lado da tabela/campos JSON no código (comentário no routes.js).

**Frontend/testes**: `dashboard.js` — variáveis e as 4 URLs de API renomeadas, IDs de elemento HTML
técnicos (`map-references`, `table-ref-communities`, `table-ref-plants`) mantidos de propósito (não
são texto de domínio, são conectores técnicos). `sqlite-persistence.test.js` — só imports/nomes de
chamada ajustados, nenhuma asserção alterada.

**Verificação**:
- `npx jest backend/tests/unit/sqlite-persistence.test.js` — 8/8, sem editar nenhuma asserção.
- `require()` de todo `.js` tocado (models, services, contexts/*/routes.js, contexts/*/app.js,
  scripts) — sem erro.
- Servidor local nas 3 portas: GET `/` (Aquisição), `/` (Curadoria), `/` e `/painel` (Apresentação)
  renderizam com texto "Evidência"/"Evidências", sem erro 500.
- **Ciclo HTTP completo automatizado** (não só leitura): `POST /evidence/submit` (Aquisição, criou
  registro) → `GET /evidence/edit/:id` (Curadoria, 200) → `POST /evidence/status/:id` (aprovou,
  302) → `GET /?q=...` (Apresentação, registro aparece na busca pública) → `GET /referencia/:id`
  (rota protegida do BioCultTermos, 200, dado correto) → `POST /evidence/delete/:id` (limpeza,
  302) → `GET /evidence/edit/:id` (404 "não encontrada", confirma exclusão). Todas as rotas
  renomeadas exercitadas de ponta a ponta com dado real, não só inspeção de código.
- `grep` final por `reference`/`Reference`/`referencia`/`Referência` em todo `backend/src` e
  `frontend/src`: únicas ocorrências restantes são a exceção documentada acima
  (`/referencia/:id` + seu comentário JSDoc), a exceção de bibliografia (`etnochat-system.md`), os
  IDs técnicos de elemento HTML/CSS não renomeados por design, e idiomas genéricos em inglês ("for
  reference", "order of preference") sem relação com o conceito de domínio.

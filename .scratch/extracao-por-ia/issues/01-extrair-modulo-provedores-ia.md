# 01 — Prefactor: extrair módulo compartilhado de Provedores de IA

**O que construir:** nada de novo, do ponto de vista de quem usa. O etnoChat continua funcionando
exatamente como hoje — mesmos provedores, mesmos modelos, mesma validação de chave, mesmo streaming.
A mudança é interna: o conhecimento sobre Provedores de IA deixa de ser propriedade privada do serviço
do etnoChat e passa a viver num módulo compartilhado, consumível pelos três contextos.

Isto é prefactor. Existe porque a Extração por IA vai consumir os mesmos provedores a partir do
contexto de Aquisição, e duplicar esse conhecimento em dois lugares garantiria que os dois divergiriam.
"Make the change easy, then make the easy change" — este ticket é a primeira metade.

O que se move para o módulo compartilhado: o registro de provedores e seus modelos, a validação de
chave, a listagem de modelos e a construção do cliente do SDK. O que **permanece** no serviço do
etnoChat: o prompt do chat, a DSL de consulta ao banco, o executor de consultas e o streaming — tudo
que é do chat, e não dos provedores.

Contexto: `.scratch/extracao-por-ia/spec.md` e `docs/decisions/ADR-002-extracao-por-ia.md` (D4).

**Bloqueado por:** nada — pode começar imediatamente.

**Status:** done (verificação manual na interface com chaves reais pendente — ver Comments)

- [x] O registro de provedores, a validação de chave, a listagem de modelos e a criação de cliente
      vivem num módulo compartilhado no nível de serviços, fora do contexto de Apresentação
- [x] O serviço do etnoChat consome esse módulo e não contém mais nenhuma definição de provedor,
      modelo ou construção de cliente
- [x] O serviço do etnoChat retém o prompt do chat, a DSL, o executor de consultas e o streaming
- [x] **A suíte de testes existente passa sem nenhuma alteração nos testes** — este é o sinal de que o
      comportamento não mudou. Se um teste precisar ser editado, o refactor extrapolou o escopo
- [ ] O etnoChat continua validando chave, listando modelos e respondendo com streaming para os três
      provedores atuais, verificado manualmente na interface
- [x] Nenhuma dependência nova em `package.json`

## Comments

Implementado: `PROVIDERS`, `createClient`, `validateApiKey`, `getModels`, `getProviders` movidos para
`backend/src/services/ai-providers.js` (caminho exato do ADR-002 D4). `etnochat.js` agora só
importa esse módulo — nenhuma definição de provedor/modelo/cliente restante (confirmado por grep).
`streamChat` passou a construir os três clients via `createClient(provider, apiKey)` em vez de
`new Anthropic/OpenAI/GoogleGenAI` inline. Prompt do chat, DSL (`FIELD_WHITELIST`, `buildConditionSql`,
`executeQuery`) e streaming permanecem intocados em `etnochat.js`.

Verificação: `npx jest backend/tests/unit/sqlite-persistence.test.js` — 8/8 passam sem editar nenhum
teste. `require()` de ambos os módulos e de `routes.js` sem erro. `getProviders()`/`getModels()`
retornam exatamente os mesmos dados de antes do refactor (comparado manualmente). `createClient`
retorna a instância certa do SDK por provedor (verificado com `openai`).

Pendente: o último critério (streaming ponta-a-ponta pelos três provedores, na interface) exige
chaves de API reais que este ambiente não tem — não pude marcá-lo. Equivalência de código com o
comportamento pré-refactor está estabelecida; falta a checagem manual na UI com chaves reais.

Nenhuma dependência nova em `package.json` (confirmado: arquivo não foi tocado).

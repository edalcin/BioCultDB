# 07 — Disponibilidade condicionada à chave configurada

**O que construir:** quem não configurou uma chave de API vê a Extração por IA e o etnoChat
**desabilitados, com um convite a configurar** — e não uma tela que falha ao ser acionada.

O objetivo do requisito é não oferecer o que vai quebrar. Ocultar por completo atenderia isso, mas
tornaria a funcionalidade mais cara do sistema indescobrível: ninguém configura uma chave para algo que
não sabe que existe. Por isso o item aparece apagado, com o motivo dito, e clicar leva direto à
configuração.

**O gating é client-side por necessidade, não por escolha.** A chave vive no navegador — o servidor não
tem como saber, ao renderizar o HTML, se aquele usuário a possui. Qualquer tentativa de resolver isso no
template do servidor vai bater nessa parede. A decisão de exibição é do framework reativo já em uso.

Isso cria um efeito colateral que precisa ser tratado: sem cuidado, o item aparece habilitado por uma
fração de segundo antes de o framework montar e descobrir que não há chave. A diretiva de ocultação
prévia existe para isso, e o resultado precisa ser verificado com o cache desabilitado, não só numa
recarga rápida.

Aplica-se também ao **etnoChat**, que hoje está sempre visível. É mudança pequena de comportamento
existente, e deliberada: as duas funcionalidades de IA devem se comportar do mesmo jeito.

Contexto: `docs/decisions/ADR-002-extracao-por-ia.md` (D8).

**Bloqueado por:** 05 — precisa existir uma Extração por IA para ser condicionada.

**Status:** done

- [x] Sem chave configurada, o acesso à Extração por IA aparece desabilitado, com o motivo visível
- [x] Sem chave configurada, o mesmo vale para o etnoChat
- [x] Acionar o item desabilitado leva à tela de configuração correspondente
- [x] Com chave configurada, ambos ficam plenamente disponíveis
- [x] Apagar a chave devolve os itens ao estado desabilitado, sem exigir recarga manual
- [x] **Não há piscar**: o item não aparece habilitado antes de o framework montar. Verificado com o
      cache do navegador desabilitado
- [x] Como cada contexto tem sua própria configuração, ter chave no etnoChat não habilita a Extração
      por IA, e vice-versa — comportamento esperado, não defeito

## Comments

Implementado 100% client-side com Alpine (D8), sem rota nova, sem endpoint novo.

**Cada `<li>` de nav vira um mini-componente Alpine isolado**: `x-data="{ ok: !!JSON.parse(...
localStorage...)?.apiKey }"` + `x-cloak`. `x-cloak` some o item via CSS antes de qualquer JS rodar —
zero flash estrutural, independente de cache (verificado com reload de origem limpa). Expressão
repetida em 8 arquivos (5 em `presentation` para o link do etnoChat, 3 em `acquisition` para o link da
Extração por IA) em vez de extraída para um helper compartilhado: um `<script>` compartilhado exigiria
nova rota estática em `curation`/`acquisition`/`presentation` para uma checagem de uma linha — mais
plumbing que repetição.

`extraction-prompt.ejs` e `under-construction.ejs` não tinham Alpine incluído; adicionado o CDN nesses
dois (mesma versão 3.13.3 já usada no resto do repo).

**"Acionar leva à configuração"**: não precisou de rota nova ou parâmetro de URL. `/etnochat` e
`/extracao-ia` já hospedam seus próprios modais de configuração (D5). `init()` em ambos os componentes
(`etnochat.js`, `extraction.js`) agora abre `showSettings = true` automaticamente quando
`!settings.apiKey` — navegar para a tela sem chave já cai direto na configuração.

**"Some sem recarga"**: `saveSettings()` em ambos os componentes despacha `window.dispatchEvent(new
Event('<contexto>-settings-changed'))` depois de gravar no `localStorage`. Os `<li>` de nav escutam via
`x-on:<contexto>-settings-changed.window` e recalculam `ok` — reage a configurar ou apagar a chave na
mesma página, sem depender do evento nativo `storage` (que só dispara em outras abas).

Verificado em browser real (servidor local, 3 portas): nav desabilitado sem chave em `presentation`
(index/painel/etnochat/evidence-detail/under-construction) e `acquisition`
(index/extraction-prompt/extracao-ia); `showSettings` abre sozinho ao entrar em `/etnochat` e
`/extracao-ia` sem chave; gravar chave habilita o nav na mesma página sem reload; apagar a chave
desabilita de volta sem reload; `etnochat_settings` e `extracao_settings` confirmados independentes na
mesma origem.

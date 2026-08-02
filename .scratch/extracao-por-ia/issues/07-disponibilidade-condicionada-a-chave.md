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

**Status:** ready-for-agent

- [ ] Sem chave configurada, o acesso à Extração por IA aparece desabilitado, com o motivo visível
- [ ] Sem chave configurada, o mesmo vale para o etnoChat
- [ ] Acionar o item desabilitado leva à tela de configuração correspondente
- [ ] Com chave configurada, ambos ficam plenamente disponíveis
- [ ] Apagar a chave devolve os itens ao estado desabilitado, sem exigir recarga manual
- [ ] **Não há piscar**: o item não aparece habilitado antes de o framework montar. Verificado com o
      cache do navegador desabilitado
- [ ] Como cada contexto tem sua própria configuração, ter chave no etnoChat não habilita a Extração
      por IA, e vice-versa — comportamento esperado, não defeito

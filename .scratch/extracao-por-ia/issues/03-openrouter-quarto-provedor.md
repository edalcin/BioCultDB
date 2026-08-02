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

**Status:** ready-for-agent

- [ ] OpenRouter aparece como quarta opção na configuração do etnoChat
- [ ] A validação de chave funciona e distingue chave inválida de outras falhas
- [ ] O cliente é construído com o SDK da OpenAI já instalado, apontando para a URL base do
      OpenRouter — **nenhuma dependência nova em `package.json`**
- [ ] A lista de modelos é buscada ao vivo pelo navegador, direto do endpoint público, sem rota de
      servidor intermediária
- [ ] O usuário filtra os modelos digitando, via elemento nativo de sugestões
- [ ] Uma conversa completa funciona ponta a ponta com um modelo do OpenRouter, incluindo streaming
- [ ] Falha de rede ao buscar a lista degrada com elegância: o usuário ainda pode digitar um
      identificador de modelo à mão
- [ ] Os três provedores existentes seguem com suas listas curadas, sem alteração de comportamento

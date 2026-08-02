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

**Status:** ready-for-agent

- [ ] A tela de Extração por IA existe na Aquisição, com configuração de provedor, chave e modelo
- [ ] A configuração é independente da do etnoChat e persiste entre sessões no navegador
- [ ] A chave é validada no momento em que é informada, com mensagem distinta para chave inválida
- [ ] Colar texto e acionar produz uma Evidência **pendente**, visível na Curadoria
- [ ] A fonte é carimbada como `extração IA — <provedor>/<modelo>`
- [ ] A Curadoria consegue filtrar as Evidências por essa origem
- [ ] Extração incompleta é gravada mesmo assim, nunca descartada
- [ ] Há indicação de progresso distinguindo consulta à IA de gravação
- [ ] Mensagens específicas para limite de uso do provedor, texto excedendo a janela do modelo, e
      resposta malformada — nenhuma delas quebra a tela
- [ ] Após uma falha, é possível tentar de novo sem reconfigurar nada
- [ ] **A chave nunca aparece em log algum**, nem truncada
- [ ] O parser é função pura, testada com: resposta cercada por marcação de bloco de código; texto
      explicativo antes ou depois do JSON; JSON inválido produzindo erro descritivo e não exceção
      crua; obrigatórios ausentes produzindo Evidência parcial e não falha; campo de lista chegando
      como texto com vírgulas; aninhamento de Comunidades Tradicionais e Plantas preservado; estado
      pendente e fonte corretos; resposta vazia ou só espaço em branco

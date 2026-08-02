# Spec: Extração por IA

Status: ready-for-agent

> Produzido por `/to-spec` em 2026-08-02, a partir da sessão de `grill-with-docs` da mesma data.
> Decisões e alternativas descartadas: `docs/decisions/ADR-002-extracao-por-ia.md`.
> Vocabulário: `CONTEXT.md`. Decisão de ecossistema a criar em paralelo:
> `Arquitetura-BioCultural/docs/architecture-decisions/ADR-011`.

## Problem Statement

Hoje, para transformar um artigo científico numa Evidência, o pesquisador precisa operar **duas
aplicações separadas**: o BioCultPapers, um app desktop Windows que lê o PDF e chama a IA, e o
BioCultDB, onde a Evidência precisa acabar.

A ponte entre elas é manual. O pesquisador extrai no desktop, clica em exportar, escolhe onde salvar
um arquivo JSON, encontra esse arquivo, e alguém roda um script de importação por linha de comando
apontando para ele. Essa fronteira foi decidida deliberadamente (ADR-005, DA6), quando o
BioCultPapers ainda era um app fora do container da Unidade Federada.

O custo dessa separação:

- **A extração não está onde o trabalho acontece.** Quem opera o BioCultDB pelo navegador precisa de
  uma máquina Windows, com um app instalado, para alimentar o próprio banco que está olhando.
- **O passo de importação é esquecível e invisível.** Uma Evidência extraída pode ficar parada no
  SQLite local do desktop indefinidamente, sem ninguém perceber que nunca chegou à unidade.
- **Dois produtores do mesmo documento.** Qualquer mudança no formato da Evidência precisa ser feita
  duas vezes, em duas linguagens, e um dos lados sempre descobre tarde.
- **A extração não passa pela Curadoria automaticamente.** Ela entra pela porta dos fundos, por
  script, em vez de nascer pendente como qualquer outra Evidência.

Há ainda uma premissa que precisa ser corrigida em quem lê este documento: **o BioCultPapers já não
usa MongoDB**. Migrou para SQLite em cumprimento ao ADR-005. Absorver a extração não é uma migração
de banco — é a eliminação da entrega por arquivo.

## Solution

A **Extração por IA** passa a ser uma funcionalidade do contexto de **Aquisição** do BioCultDB,
acessível pelo navegador como qualquer outra tela do sistema.

O pesquisador abre a tela de Extração por IA, configura uma vez o seu Provedor de IA e a sua chave,
escolhe um PDF na própria máquina e aciona a extração. O texto do artigo é lido **dentro do
navegador**; o PDF em si nunca é enviado ao BioCultDB. O texto segue para o Provedor de IA escolhido,
a resposta é convertida numa Evidência **pendente**, e essa Evidência aparece imediatamente na
Curadoria, no mesmo funil de todas as outras.

Três garantias moldam o desenho:

1. **O PDF nunca chega ao servidor.** Não é "não armazenamos" — é "não recebemos".
2. **A chave de API nunca é persistida.** Vive no navegador do usuário. Transita pelo servidor a cada
   requisição, em memória, e é descartada — nunca vai para disco, banco, log ou variável de ambiente.
3. **Nada é publicado sem humano.** A Extração por IA produz Evidências pendentes. Só a Curadoria
   aprova.

O Prompt de Extração — o texto que instrui o modelo — deixa de ser algo hardcoded no código e passa a
ser editável pela interface, guardado na Unidade Federada, igual para todos que a operam.

Quando isso estiver funcionando e validado com artigos reais, os dados existentes no desktop são
migrados uma única vez e o BioCultPapers é aposentado.

## User Stories

### Configuração do Provedor de IA

1. Como pesquisador, quero escolher entre Claude, OpenAI, Gemini e OpenRouter, para usar o provedor
   ao qual já tenho acesso.
2. Como pesquisador, quero informar minha própria chave de API, para não depender de uma chave da
   instituição nem de um administrador.
3. Como pesquisador, quero que minha chave fique guardada apenas no meu navegador, para que ninguém
   com acesso ao servidor consiga lê-la.
4. Como pesquisador, quero que minha chave seja validada no momento em que a informo, para descobrir
   um erro de digitação ali, e não no meio de uma extração.
5. Como pesquisador, quero ver uma mensagem clara quando a chave é rejeitada pelo provedor, para
   saber se o problema é a chave, o plano ou o modelo escolhido.
6. Como pesquisador, quero escolher o modelo dentro do provedor, para equilibrar custo e qualidade
   conforme o meu caso.
7. Como pesquisador que usa OpenRouter, quero buscar entre todos os modelos disponíveis digitando
   parte do nome, porque uma lista fixa de meia dúzia anularia a razão de eu usar OpenRouter.
8. Como pesquisador, quero que a lista de modelos do OpenRouter esteja sempre atual, para não
   descobrir que um modelo saiu do ar só quando a extração falhar.
9. Como pesquisador, quero que minhas configurações persistam entre sessões, para não reinformá-las
   toda vez que abro o sistema.
10. Como pesquisador, quero poder trocar de provedor sem perder as configurações do anterior, para
    comparar resultados entre modelos.
11. Como pesquisador, quero poder apagar minha chave do navegador, para deixar uma máquina
    compartilhada sem credencial minha.

### Disponibilidade condicionada

12. Como pesquisador sem chave configurada, quero ver que a Extração por IA existe, para saber que
    posso habilitá-la.
13. Como pesquisador sem chave configurada, quero que a Extração por IA esteja visivelmente
    desabilitada, para não acionar algo que vai falhar.
14. Como pesquisador sem chave configurada, quero que a indicação de indisponibilidade me leve
    diretamente à tela de configuração, para resolver o impedimento sem procurar.
15. Como pesquisador sem chave configurada, quero o mesmo tratamento no etnoChat, para que o sistema
    se comporte de forma coerente nas duas funcionalidades de IA.
16. Como pesquisador, não quero ver os itens desabilitados piscando enquanto a página carrega, para
    não achar que o sistema está instável.

### Extração de uma Evidência

17. Como pesquisador, quero selecionar um PDF do meu computador, para extrair dele uma Evidência.
18. Como pesquisador, quero que o PDF permaneça na minha máquina, para que documentos sob restrição
    de acesso não trafeguem para um servidor.
19. Como pesquisador, quero ser avisado quando o PDF não tem camada de texto, para saber que preciso
    de OCR antes, em vez de receber uma extração vazia.
20. Como pesquisador, quero ver o progresso da extração, para saber que o sistema está trabalhando e
    não travado.
21. Como pesquisador, quero saber em que etapa a extração está — lendo o PDF, consultando a IA,
    gravando —, para entender onde está a demora.
22. Como pesquisador, quero que a Evidência seja gravada assim que a extração termina, para não
    perder o trabalho se eu fechar a aba.
23. Como pesquisador, quero ser levado à Evidência recém-criada, para conferir o que a IA produziu.
24. Como pesquisador, quero que uma extração incompleta seja gravada mesmo assim, para não perder as
    comunidades e plantas que a IA acertou por causa de um campo de cabeçalho que faltou.
25. Como pesquisador, quero uma mensagem específica quando o provedor recusa a requisição por limite
    de uso, para saber que devo esperar em vez de tentar de novo imediatamente.
26. Como pesquisador, quero uma mensagem específica quando o artigo excede o limite do modelo, para
    saber que preciso de um modelo com janela maior.
27. Como pesquisador, quero que uma resposta malformada do modelo produza um erro compreensível, e
    não uma tela quebrada.
28. Como pesquisador, quero poder tentar novamente após uma falha sem reconfigurar nada, para não
    repetir trabalho.

### Rastreabilidade do que veio de IA

29. Como curador, quero saber que uma Evidência foi produzida por Extração por IA, para calibrar o
    rigor da minha revisão.
30. Como curador, quero saber qual provedor e qual modelo produziram a Evidência, para identificar
    se um modelo específico está errando sistematicamente.
31. Como curador, quero filtrar as Evidências pendentes pela sua origem, para revisar em lote tudo o
    que veio de IA.
32. Como curador, quero que Evidências extraídas por IA nasçam pendentes como qualquer outra, para
    que nada seja publicado sem julgamento humano.
33. Como curador, quero corrigir uma Evidência extraída usando a mesma tela com que corrijo as
    digitadas, para não aprender duas interfaces.
34. Como curador, quero rejeitar com justificativa uma Evidência mal extraída, para que o registro
    da recusa fique preservado.

### Prompt de Extração

35. Como curador, quero ler o Prompt de Extração em uso, para entender por que a IA extrai o que
    extrai.
36. Como curador, quero editar o Prompt de Extração pela interface, para melhorar a qualidade da
    extração sem depender de quem mexe no código.
37. Como curador, quero que minha edição do prompt valha para todos que operam esta unidade, para
    que os resultados sejam consistentes entre colegas.
38. Como curador, quero que o prompt preserve exatamente o que eu digitei, incluindo o bloco JSON e a
    indentação, porque o modelo recebe esse texto literalmente.
39. Como curador, quero restaurar o prompt padrão, para desfazer uma edição que piorou os
    resultados.
40. Como curador, quero saber quando o prompt foi alterado pela última vez, para correlacionar uma
    mudança de qualidade com uma mudança de prompt.
41. Como operador da unidade, quero que o prompt padrão continue versionado no repositório, para que
    uma instalação nova nasça funcionando.

### Migração e aposentadoria do BioCultPapers

42. Como operador da unidade, quero migrar as Evidências que já extraí no desktop, para não perder
    trabalho anterior.
43. Como operador da unidade, quero conferir a contagem antes e depois da migração, para ter certeza
    de que nada se perdeu.
44. Como operador da unidade, quero validar a qualidade da extração no BioCultDB contra artigos que
    já processei no desktop, para decidir com dado se posso aposentá-lo.
45. Como usuário do BioCultPapers, quero encontrar um aviso claro no repositório dizendo para onde a
    funcionalidade foi, para não continuar usando algo abandonado sem saber.
46. Como usuário do BioCultPapers, quero saber que o repositório não recebe mais atualizações, para
    não reportar problemas que ninguém vai corrigir.

### Documentação da arquitetura

47. Como mantenedor da arquitetura, quero que a decisão de absorção esteja registrada como ADR, para
    que quem ler daqui a dois anos saiba por que a entrega por arquivo deixou de existir.
48. Como mantenedor da arquitetura, quero que os ADRs anteriores continuem legíveis como estavam,
    para preservar o histórico de que a entrega por arquivo já foi a decisão correta.
49. Como mantenedor da arquitetura, quero que o inventário de componentes reflita que o
    BioCultPapers não existe mais como componente, para que ninguém tente instalá-lo.
50. Como mantenedor da arquitetura, quero que os diagramas C4 mostrem a Extração por IA dentro do
    BioCultDB, para que a topologia desenhada corresponda à real.

## Implementation Decisions

### Escopo da absorção

Absorve-se **apenas a extração**. A gestão das Evidências extraídas — listar, editar, excluir — já
existe na Aquisição e na Curadoria e não é reimplementada. O diálogo de edição do BioCultPapers não é
portado; o passo de revisão humana muda de lugar, do momento anterior à gravação para a Curadoria.

### Leitura do PDF

A conversão de PDF para texto acontece **no navegador**, via biblioteca carregada por CDN — o padrão
de scripts do repositório, que não tem build step de JavaScript. O servidor recebe texto, nunca o
arquivo binário. Nenhuma dependência nova de servidor, nenhum tratamento de upload multipart, nenhuma
pressão de memória no container.

Consequência aceita: perde-se a conversão para Markdown estruturado que a biblioteca .NET produzia; o
modelo recebe texto corrido.

### Módulo compartilhado de Provedores de IA

O registro de provedores, a validação de chave, a listagem de modelos e a criação de cliente são
**extraídos do serviço do etnoChat** para um módulo compartilhado no nível de serviços, consumível
pelos três contextos. O etnoChat passa a consumi-lo e retém apenas o que é dele: o prompt do chat, a
DSL de consulta e o streaming.

**OpenRouter** entra como quarto provedor reusando o SDK da OpenAI já instalado, apenas apontando a
`baseURL` para o endpoint do OpenRouter — o protocolo é compatível. Nenhuma dependência nova.

Esta é a única refatoração de código em produção prevista, e é pré-requisito de tudo o mais.

### Chave de API

Guardada em `localStorage`, **uma configuração por contexto**. `localStorage` é isolado por origem e
a porta faz parte da origem: a configuração do etnoChat, na Apresentação, é inacessível à Aquisição.
Não há como unificar sem enviar a chave ao servidor para guardar, que é justamente o que se evita.

A configuração existente do etnoChat permanece intocada; a Aquisição ganha a sua própria, com o mesmo
componente de interface e o mesmo módulo de provedores.

A chave **transita pelo servidor** a cada requisição: o navegador a envia no corpo do POST, o servidor
instancia o SDK, chama o provedor e descarta. Nunca é persistida em disco, banco, log ou variável de
ambiente. É o comportamento que o etnoChat já tem hoje.

Chamada direta do navegador ao provedor foi descartada: a Anthropic bloqueia requisições de navegador
por padrão, e a alternativa duplicaria a lógica de provedores no cliente.

### Prompt de Extração

Persistido no SQLite da Unidade Federada, numa tabela de configuração chave-valor com registro de
data de atualização — a primeira tabela de configuração do projeto. O schema é criado junto do
restante, de forma idempotente; os acessores ficam na mesma camada de serviço de dados que já atende
as Evidências, e não num módulo novo.

O valor padrão continua versionado como arquivo no repositório, do mesmo modo que o prompt do
etnoChat já é, e semeia a linha no primeiro boot. "Restaurar padrão" relê o arquivo.

O editor é uma área de texto monoespaçada. Editor rich-text foi descartado: o prompt contém um bloco
JSON literal e uma lista delimitada por barras verticais, e vai **verbatim** para o modelo — conversão
de aspas, indentação e quebras de linha corromperia o conteúdo. Não há bundler no projeto, e o editor
cogitado exigiria um.

### Disponibilidade condicionada

O gating é **client-side por necessidade**: a chave vive no navegador, então o servidor não tem como
saber, ao renderizar, se aquele usuário a possui. A decisão de exibição é do framework reativo já em
uso, com a diretiva que evita o piscar do conteúdo antes da montagem.

Sem chave, o acesso aparece desabilitado e leva à configuração, em vez de sumir. Ocultar tornaria a
funcionalidade mais cara do sistema indescobrível. Vale igualmente para o etnoChat, que hoje está
sempre visível — mudança pequena de comportamento existente.

### Resultado da extração

A Evidência é **sempre gravada como pendente**, mesmo com campos obrigatórios ausentes. Bloquear
duplicaria na extração um julgamento que pertence à Curadoria, e o faria com menos informação: a
extração não sabe se o ano falta porque a IA errou ou porque o artigo não o traz. Pior, descartaria
uma extração que acertou dezenas de comunidades e plantas por causa de um campo de cabeçalho.

A origem é registrada no campo de fonte, no formato `extração IA — <provedor>/<modelo>`. Esse campo
já é coluna gerada e indexada, então a filtragem na Curadoria sai de graça.

**Um PDF por vez.** Fila no servidor é impossível por construção — exigiria a chave no servidor. O
processamento é dirigido pelo navegador, com a aba aberta.

### Contrato de dados

O documento da Evidência **não muda**: os nomes de campo do JSON são contrato compartilhado com o
serviço de aquisição de vocabulário do BioCultTermos e com o script de importação. O modelo de
documento do BioCultPapers já é idêntico ao do BioCultDB — não há tradução de schema a fazer.

O nome da tabela de Evidências **não muda**, pelo mesmo motivo.

### Renomeação para Evidência

O termo canônico do domínio passa a ser **Evidência** (ver `CONTEXT.md`). O rename atinge **o modelo,
as rotas e os textos de interface**. Não atinge o nome da tabela nem os campos do JSON.

Uma Evidência é o artigo, não cada afirmação dentro dele: um artigo com doze Comunidades Tradicionais
e quarenta Plantas é uma Evidência que documenta muitas relações.

Acoplamento a observar: o serviço do etnoChat importa o enum de estado do modelo renomeado, então
entra no rename.

### Endpoints

A Aquisição ganha a tela da funcionalidade e as rotas de apoio: validação de chave, listagem de
modelos, execução da extração a partir do texto, e leitura/gravação/restauração do Prompt de
Extração. O formato espelha o que a Apresentação já expõe para o etnoChat.

A listagem de modelos do OpenRouter é a exceção: o endpoint público do OpenRouter é acessível por CORS
e dispensa autenticação, então o navegador o consulta diretamente e popula um elemento nativo de
sugestões. Nenhuma rota de servidor, nenhuma biblioteca de busca, nenhum estado adicional.

### Ordem de execução

A ordem entre os blocos é imposta por dependência, e o congelamento é o último passo:

1. Módulo compartilhado de provedores, com OpenRouter — pré-requisito de todo o resto.
2. Tabela de configuração e Prompt de Extração.
3. Renomeação para Evidência.
4. Tela de Extração por IA, leitura do PDF no navegador, gating.
5. Validação com artigos reais contra os resultados do desktop.
6. Migração dos dados existentes.
7. Congelamento do BioCultPapers e atualização da documentação de arquitetura.

## Testing Decisions

### O que faz um bom teste aqui

Um bom teste neste repositório exercita **comportamento observável através de uma função de serviço
real, contra o schema real**, em SQLite `:memory:`. Não mocka a camada de dados, não afirma sobre
estrutura interna, e falha diante de um bug plausível — não diante de uma refatoração.

O único arquivo de teste existente estabelece exatamente esse padrão, e é a arte prévia a seguir.

### Costura nova: o parser da resposta de extração

Uma função pura, sem I/O: recebe o texto cru devolvido pelo modelo e produz um documento de Evidência
ou uma falha descrita. É onde mora o risco real da funcionalidade, e não precisa de rede, chave nem
banco para ser exercitada.

Casos que precisam existir:

- Resposta cercada por marcação de bloco de código, que os modelos produzem mesmo instruídos a não o
  fazer.
- Resposta com texto explicativo antes ou depois do JSON.
- JSON sintaticamente inválido — deve falhar com erro descritivo, não lançar exceção crua.
- Campos obrigatórios ausentes — deve produzir Evidência pendente parcial, **não** falhar.
- Campos que deveriam ser lista chegando como texto com vírgulas — comportamento que o app .NET
  tratava com um conversor dedicado, portanto um bug já observado na prática.
- Aninhamento de Comunidades Tradicionais e Plantas preservado.
- Estado pendente e campo de fonte carimbados corretamente.
- Resposta vazia ou só espaço em branco.

### Costuras existentes estendidas

**Camada de serviço de dados** — acessores da tabela de configuração: leitura antes de qualquer
escrita devolve o padrão semeado; escrita e releitura preservam o texto **byte a byte**, incluindo
quebras de linha e indentação; restauração volta ao valor do arquivo versionado; a data de
atualização muda a cada escrita. Testados no mesmo `:memory:` do arquivo existente.

**Módulo de provedores** — apenas a parte determinística: o registro inclui os quatro provedores; a
resolução de modelo padrão funciona para cada um; um modelo desconhecido é recusado; o cliente do
OpenRouter é construído apontando para o endpoint correto. Validar chave de verdade exige rede e
credencial real, e fica de fora.

### Sem cobertura, deliberadamente

- **Leitura do PDF no navegador** e **gating na interface** — não executam no ambiente `node` do
  Jest.
- **Chamadas reais aos provedores** — só seriam testáveis com mock do SDK, o que verificaria a
  implementação em vez do comportamento.
- **Renomeação para Evidência** — não ganha teste próprio. O sinal de sucesso é a suíte existente
  continuar passando após a troca dos imports; se ela quebrar, o rename está incompleto.

### Sem teste de rota

O diretório de testes de integração existe e está vazio: não há convenção de teste de rota HTTP neste
projeto. Criar a primeira junto com esta funcionalidade seria decidir duas coisas ao mesmo tempo, e as
rotas aqui são finas — recebem texto e chave, delegam ao provedor, passam ao parser, gravam. Toda a
lógica que pode errar está nas costuras acima.

## Out of Scope

- **Busca de artigos por DOI**, em qualquer nível. Metadados via Crossref é ticket futuro, barato e
  isolado. Texto completo aberto depende de medir antes a cobertura numa amostra real de DOIs de
  etnobotânica — sem esse número, construir a rota de proxy é aposta.
- **Autenticação nas portas de Aquisição e Curadoria.** Permanece fora de escopo como já estava.
  Registre-se a consequência: o Prompt de Extração passa a ser editável por quem alcança a rede da
  Aquisição. Não é classe nova de risco — quem a alcança já cria e altera Evidências — mas amplia a
  superfície.
- **Processamento em lote.**
- **Adoção de "Evidência" como vocabulário de toda a federação.** É matéria do Comitê Federado.
- **Renomear a tabela de Evidências ou os campos do documento JSON.**
- **Portar o diálogo de edição do BioCultPapers.**
- **Manter o BioCultPapers utilizável após a migração.**

## Further Notes

### O risco que não foi medido

A troca da biblioteca .NET de PDF pela biblioteca de navegador substitui Markdown estruturado por
texto corrido, e **o impacto disso sobre a qualidade da extração é desconhecido**. É o único risco
desta spec capaz de invalidar a premissa da funcionalidade.

Por isso a validação com artigos reais é etapa própria na ordem de execução, **antes** da migração e
do congelamento: enquanto o BioCultPapers existir e funcionar, existe um comparativo. Depois de
congelado, não existe mais. Se a qualidade cair de forma relevante, a decisão de ler o PDF no
navegador precisa ser reaberta — provavelmente para leitura no servidor em memória, que era a
alternativa descartada.

### Sobre o rename

Renomear modelo, rotas e interface é a mudança de maior alcance e menor risco individual desta spec.
Vale fazê-la como bloco próprio, e não diluída na implementação da funcionalidade: assim, se a suíte
existente quebrar, a causa é inequívoca.

### O congelamento é o último passo

Aposentar o BioCultPapers antes de a extração estar validada elimina o único ponto de comparação
disponível. A ordem — implementar, validar, migrar, congelar — não é preferência de processo; é o que
mantém a reversibilidade enquanto ela ainda importa.

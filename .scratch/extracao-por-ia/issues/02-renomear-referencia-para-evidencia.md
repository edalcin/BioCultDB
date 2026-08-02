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

**Status:** ready-for-agent

- [ ] O modelo de domínio, suas rotas e os textos de interface usam Evidência
- [ ] O nome da tabela e todos os campos do documento JSON permanecem **inalterados**
- [ ] O serviço do etnoChat, que importa o enum de estado do modelo renomeado, foi atualizado
- [ ] A suíte de testes existente passa após ajustar os imports — nenhuma asserção de comportamento
      precisou mudar
- [ ] Aquisição, Curadoria e Apresentação continuam funcionando, verificado manualmente nas três
      portas
- [ ] Nenhuma ocorrência remanescente de "referência"/"reference" como nome do conceito de domínio,
      exceto onde designa bibliografia no sentido comum
- [ ] O serviço de aquisição de vocabulário do BioCultTermos continua lendo a tabela sem alteração

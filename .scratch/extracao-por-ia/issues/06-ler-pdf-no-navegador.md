# 06 — Ler o PDF no navegador

**O que construir:** ao lado da caixa de texto colado, um seletor de arquivo. O pesquisador escolhe um
PDF do computador dele, e o texto do artigo é extraído **dentro do navegador** antes de qualquer coisa
ser enviada. O resto do fluxo é o que o ticket 05 já construiu.

**O PDF nunca chega ao servidor.** Esta é a garantia central da funcionalidade, e é mais forte que
"não armazenamos": é "não recebemos". Documentos sob restrição de acesso não trafegam. O servidor
recebe texto, nunca o arquivo binário.

Consequências de desenho que vêm junto:

- **Nenhuma dependência nova de servidor.** Sem tratamento de upload multipart, sem parser de PDF no
  backend, sem pressão de memória no container. A biblioteca de leitura de PDF é carregada por CDN, que
  é o padrão de scripts deste repositório — ele não tem build step de JavaScript.
- **PDF sem camada de texto precisa ser detectado.** Um PDF escaneado produz texto vazio ou lixo. O
  usuário precisa ser avisado de que precisa de OCR antes, e não receber uma extração silenciosamente
  vazia. Nesse caso, a entrada por texto colado do ticket 05 é a saída — e é por isso que ela
  permanece.

Risco conhecido e declarado: esta abordagem entrega **texto corrido**, enquanto o app desktop
convertia o PDF em Markdown estruturado antes de mandar ao modelo. O impacto disso sobre a qualidade da
extração é **desconhecido**, e é exatamente o que o ticket 08 vai medir. Não resolva isso aqui;
entregue e meça.

Contexto: `docs/decisions/ADR-002-extracao-por-ia.md` (D2).

**Bloqueado por:** 05 — o caminho completo precisa estar funcionando com texto antes de trocar a
entrada.

**Status:** ready-for-agent

- [ ] O seletor de arquivo aceita PDF e convive com a caixa de texto colado, que **permanece**
- [ ] O texto é extraído no navegador; **nenhuma requisição carrega o arquivo binário** — verificável
      na aba de rede do navegador
- [ ] Nenhuma dependência nova no `package.json`; a biblioteca entra por CDN, como Alpine e HTMX já
      entram
- [ ] PDF sem camada de texto é detectado e produz aviso explícito sugerindo OCR ou a entrada por
      texto, em vez de extração vazia
- [ ] Arquivo que não é PDF é recusado com mensagem clara
- [ ] O progresso distingue a leitura do PDF da consulta à IA
- [ ] Um artigo real de etnobotânica, com Comunidades Tradicionais e Plantas, é extraído ponta a ponta
      a partir do PDF e gravado como Evidência pendente

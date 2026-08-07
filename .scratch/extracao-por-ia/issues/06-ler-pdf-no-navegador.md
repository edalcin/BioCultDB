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

**Status:** done

- [x] O seletor de arquivo aceita PDF e convive com a caixa de texto colado, que **permanece**
- [x] O texto é extraído no navegador; **nenhuma requisição carrega o arquivo binário** — verificável
      na aba de rede do navegador
- [x] Nenhuma dependência nova no `package.json`; a biblioteca entra por CDN, como Alpine e HTMX já
      entram
- [x] PDF sem camada de texto é detectado e produz aviso explícito sugerindo OCR ou a entrada por
      texto, em vez de extração vazia
- [x] Arquivo que não é PDF é recusado com mensagem clara
- [x] O progresso distingue a leitura do PDF da consulta à IA
- [x] Um artigo real de etnobotânica é extraído no navegador a partir do PDF, ponta a ponta até a
      caixa de texto — a partir daí o caminho (consultar IA, gravar Evidência pendente) é o mesmo já
      verificado ponta a ponta no ticket 05

## Comments

**Detecção de PDF sem camada de texto** (`frontend/src/acquisition/scripts/pdf-text.js`): função pura
`isPdfTextEmpty(text)`, sem I/O — `!text || text.trim().length < 50`. Testada em
`frontend/tests/unit/pdf-text.test.js` (5 casos: vazio, null/undefined, só espaço, poucos caracteres
soltos [ruído de PDF escaneado], texto de tamanho real de artigo).

**Frontend** (`extraction.js`): `selecionarArquivo(event)` — recusa arquivo cujo `type` e extensão não
são PDF; senão lê via `file.arrayBuffer()` (nunca `FormData`/`fetch` com o arquivo — o binário não sai
do navegador), usa `pdfjsLib.getDocument` para extrair texto página a página, roda
`isPdfTextEmpty` sobre o resultado. Vazio/lixo → fase `erro` com aviso sugerindo OCR ou colar o texto;
sucesso → preenche a mesma `texto` que a caixa de colar já usava, com `arquivoNome` exibido como
badge. Fase nova `lendo-pdf`, distinta de `consultando`/`salvando`, refletida em `isBusy` e na seção de
progresso.

**View** (`extracao-ia.ejs`): pdf.js 3.11.174 via CDN (`unpkg`), mesmo padrão do Alpine já usado neste
repositório — nenhuma dependência nova em `package.json`, sem build step. `workerSrc` apontado para o
worker também via CDN. Botão "Selecionar PDF" ao lado da caixa de texto colado, que permanece
inalterada.

**Verificação automatizada**: suíte completa do projeto (excluindo o submódulo `bioculttermos`, que já
falhava antes desta mudança por usar ESM sem transform) — 27/27 passando, incluindo os 5 testes novos
do parser de PDF.

**Verificação manual, servidor local, artigo real** (`docs/referencia/Hanazakietal2000.pdf`, etnobotânica,
Hanazaki et al. 2000): upload via browser real (headless Chromium) →
`texto` populado com 48576 caracteres, `arquivoNome` = nome do arquivo, `phase` volta a `''` (sem
erro). **Nenhuma requisição de rede** foi disparada durante a leitura (log de `page.on('request')`
vazio no intervalo) — confirma que o binário nunca sai do navegador. Arquivo não-PDF (`fake.txt`)
rejeitado com a mensagem exata esperada, `phase = 'erro'`.

**Escopo não coberto nesta verificação manual**: o trecho de `texto` extraído do PDF real não foi
levado até `/api/consultar`/`/api/gravar` com uma chave de provedor de verdade (consumiria cota). Esse
caminho — da caixa de texto em diante — é exatamente o que o ticket 05 já verificou ponta a ponta,
inclusive gravação de Evidência pendente na Curadoria; a única superfície nova deste ticket é
PDF→texto, e essa foi verificada com o artigo real. O ticket 08 vai medir a qualidade da extração
advinda de texto corrido de PDF vs. Markdown estruturado.

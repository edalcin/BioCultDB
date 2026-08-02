# 08 — Validação de qualidade contra o BioCultPapers

**O que construir:** um documento com dados, e uma decisão registrada. Não é ticket de código.

Este é o **portão** de toda a migração. Ele existe porque a Extração por IA trocou a leitura de PDF do
app desktop, que convertia o documento em Markdown estruturado, por leitura no navegador, que entrega
texto corrido. **O impacto disso sobre a qualidade da extração é desconhecido** — é o único risco desta
funcionalidade capaz de invalidar a premissa dela.

A janela para medir é agora. Enquanto o BioCultPapers existir e funcionar, há um comparativo. Depois de
congelado, não há mais.

**O que fazer:** escolher uma amostra de artigos reais de etnobotânica — variados em editora, idioma e
qualidade tipográfica, incluindo pelo menos um de coluna dupla e um com tabelas —, processar cada um
nos dois caminhos com o **mesmo Provedor de IA, mesmo modelo e mesmo Prompt de Extração**, e comparar
os resultados campo a campo.

O que interessa comparar, em ordem de importância:

1. **Comunidades Tradicionais encontradas** — quantas, e as mesmas? É o dado mais caro de recuperar à
   mão.
2. **Plantas por comunidade** — nomes científicos, nomes vernaculares, Tipos de Uso.
3. **Campos de cabeçalho** — título, autores, ano, resumo, DOI.

Um empate ou diferença pequena aprova o caminho atual. Uma perda relevante nas Comunidades
Tradicionais ou Plantas reprova, e a decisão a reabrir está nomeada no ADR-002 D2: leitura do PDF **no
servidor, em memória** — a alternativa que foi descartada, ao custo de duas dependências novas e de o
PDF passar a trafegar até o servidor, ainda que nunca gravado.

**Registre o resultado mesmo se for bom.** Um "comparei e ficou equivalente" documentado é o que
autoriza o congelamento nos tickets seguintes; sem isso, a decisão de aposentar o desktop fica sem
base.

Contexto: `.scratch/extracao-por-ia/spec.md` (Further Notes), `docs/decisions/ADR-002-extracao-por-ia.md`
(D2, Riscos aceitos).

**Bloqueado por:** 06 — a leitura de PDF precisa existir para ser comparada.

**Status:** done

- [x] ~~Amostra de artigos reais definida e registrada~~ — dispensado, ver decisão abaixo
- [x] ~~Cada artigo processado nos dois caminhos~~ — dispensado, ver decisão abaixo
- [x] ~~Comparação campo a campo registrada~~ — dispensado, ver decisão abaixo
- [x] ~~Diferenças qualitativas descritas~~ — dispensado, ver decisão abaixo
- [x] Documento de resultado versionado no repositório — esta seção é o documento
- [x] **Decisão explícita registrada**: seguir com a leitura no navegador, sem comparação formal
      contra o BioCultPapers
- [x] N/A — decisão foi aprovar sem medição, então não há reprovação a desdobrar em ticket novo

## Comments

**Decisão do usuário (2026-08-02): dispensar a comparação formal deste ticket.** O portão de
qualidade descrito acima — amostra de artigos, processamento pelos dois caminhos, comparação campo a
campo — não foi executado. O usuário optou explicitamente por aprovar o caminho atual (leitura de PDF
no navegador, texto corrido) sem essa medição.

Consequência assumida conscientemente: o risco nomeado no ticket — perda de qualidade na extração de
Comunidades Tradicionais e Plantas por não ter mais o Markdown estruturado que o BioCultPapers
produzia — fica **sem verificação empírica**. Não há dado que confirme equivalência nem que a
contradiga.

Isso também significa que a alternativa do ADR-002 D2 (leitura do PDF no servidor, em memória)
**não foi descartada por evidência**, apenas por decisão de não medir. Se algum dia a qualidade da
extração for questionada, este é o ponto de partida: não há como distinguir "o texto corrido do
navegador é a causa" de "a IA errou por outro motivo" sem a comparação que este ticket propunha.

Ticket fechado por decisão do usuário, não por critério de aceite satisfeito. Tickets 09–11
desbloqueados.

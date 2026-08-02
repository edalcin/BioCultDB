# 09 — Migrar as Evidências do desktop

**O que construir:** as Evidências que já foram extraídas no BioCultPapers passam a existir no
BioCultDB. Uma vez só.

O caminho já está construído e não precisa ser reinventado: o app desktop exporta um arquivo JSON com
um array de registros, e o BioCultDB já tem um script de importação que consome exatamente esse
formato. O modelo de documento dos dois lados é idêntico — não há tradução de schema a fazer.

O trabalho aqui é de **operação cuidadosa**, não de código: exportar tudo do desktop, contar antes,
importar, contar depois, e conferir por amostragem que o conteúdo aninhado — Comunidades Tradicionais e
Plantas — sobreviveu inteiro.

Pontos de atenção:

- **Contagem antes e depois.** O número de registros exportados do desktop precisa bater com o número
  de Evidências novas no BioCultDB. Divergência silenciosa é o modo de falha desta operação.
- **Estado das Evidências importadas.** Elas chegam com o estado que tinham no desktop. Decida e
  registre: se entram como pendentes, passam pela Curadoria como qualquer outra; se preservam o estado
  original, verifique que nenhuma entra aprovada sem ter sido revisada por um humano nesta unidade.
- **Backup antes.** O arquivo SQLite da unidade deve ser copiado antes da importação. O procedimento
  de backup já está descrito na documentação de integração da unidade.
- **Idempotência.** Rodar a importação duas vezes por engano não pode duplicar Evidências. Se o script
  não garante isso hoje, verifique antes de rodar, não depois.

O script de importação **permanece no repositório** depois disto, como rede de segurança para algum
banco de desktop esquecido numa máquina. Mas deixa de ser caminho anunciado.

Contexto: `docs/decisions/ADR-002-extracao-por-ia.md` (D14).

**Bloqueado por:** 08 — não se migra para uma funcionalidade cuja qualidade ainda não foi aprovada.

**Status:** ready-for-agent

- [ ] Backup do arquivo SQLite da unidade feito e verificado antes da importação
- [ ] Todas as Evidências do desktop exportadas, com a contagem registrada
- [ ] Importação executada e a contagem posterior confere com a anterior
- [ ] Amostragem manual confirma que Comunidades Tradicionais e Plantas aninhadas chegaram íntegras
- [ ] O estado das Evidências importadas foi decidido e registrado; nenhuma ficou aprovada sem
      revisão humana nesta unidade
- [ ] Comportamento de reexecução verificado: rodar de novo não duplica
- [ ] As Evidências importadas aparecem normalmente na Curadoria e na busca
- [ ] Resultado da migração registrado, com números

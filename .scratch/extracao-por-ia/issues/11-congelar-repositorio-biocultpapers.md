# 11 — Congelar o repositório BioCultPapers

**O que construir:** quem chegar ao repositório do BioCultPapers descobre, na primeira tela e sem
precisar procurar, que a funcionalidade migrou e que aquele código não recebe mais atualizações.

Este trabalho acontece no repositório **`BioCultPapers`**, não no BioCultDB.

O aviso vai **em destaque no topo do README**, antes de qualquer outra coisa — antes da descrição do
projeto, das instruções de instalação e das capturas de tela. Alguém que chega ali via busca ou link
antigo precisa entender a situação sem rolar a página.

O aviso precisa dizer três coisas, e é melhor que diga exatamente estas:

1. **Para onde foi.** A extração de dados de artigos científicos por IA agora é a **Extração por IA**,
   dentro do BioCultDB, acessível pelo navegador — com link para o repositório do BioCultDB.
2. **Que está congelado.** O repositório não recebe mais atualizações, correções nem respostas a
   problemas relatados.
3. **O que fazer com dados antigos.** Quem ainda tiver um banco local com Evidências não migradas deve
   exportá-las e importá-las no BioCultDB pelo script que continua existindo lá.

Dois cuidados:

- **Não apague o histórico nem o código.** Congelar é parar de evoluir, não destruir. O repositório
  continua sendo o registro de como aquilo funcionou, e a validação do ticket 08 pode precisar ser
  reexaminada.
- **As instruções de instalação existentes ficam**, abaixo do aviso. Quem precisar rodar o app uma
  última vez para exportar dados antigos ainda precisa delas — este é justamente o caso de uso que o
  ponto 3 do aviso descreve.

Se o repositório tiver a opção de ser marcado como arquivado na plataforma, avalie: ela comunica o
congelamento de forma inequívoca, mas também impede novas issues, o que pode ser cedo demais se ainda
houver alguém migrando. O aviso no README é o requisito; o arquivamento é opcional e reversível.

Contexto: `docs/decisions/ADR-002-extracao-por-ia.md` (D14 e Consequências).

**Bloqueado por:** 09 — não se anuncia a aposentadoria antes de os dados estarem migrados.

**Status:** done

- [x] Aviso em destaque no topo do README, antes de qualquer outro conteúdo
- [x] O aviso diz para onde a funcionalidade foi, com link para o BioCultDB
- [x] O aviso declara que o repositório está congelado e não recebe mais atualizações
- [x] O aviso explica como migrar dados locais remanescentes
- [x] Instruções de instalação preservadas abaixo do aviso, para quem precise exportar dados antigos
- [x] Histórico e código preservados — nada apagado
- [x] Decisão sobre arquivar o repositório na plataforma tomada e registrada, seja ela qual for

## Comments

Implementado no repositório `BioCultPapers` (commit `c2dae01`), via subagente delegado em paralelo
com o ticket 10. Único arquivo tocado: `README.md`.

Aviso em blockquote inserido como as 9 primeiras linhas do arquivo, antes do título/badges/descrição:
"⚠️ REPOSITÓRIO CONGELADO", com as três informações na ordem pedida — (a) para onde foi, com link
`https://github.com/edalcin/BioCultDB`; (b) declaração de congelamento (sem atualizações, correções
ou resposta a issues); (c) como migrar dados antigos, citando a função "Exportar para BioCultDB" do
próprio app e o script `backend/src/scripts/import-papers.js` do BioCultDB (nome real confirmado no
código).

Decisão de arquivamento registrada em nova seção ao final do README ("Status do Repositório no
GitHub"): **não arquivar por enquanto** — releases/instalador precisam continuar acessíveis para quem
for exportar dados antigos, e arquivamento bloquearia issues/escrita durante o período de migração.
Reavaliação prevista para quando a migração for considerada encerrada. Arquivamento não foi executado
na plataforma, só a decisão foi documentada, conforme o ticket permite.

Verificação: `git diff --stat README.md` = +18/-0 (apenas adições, nenhuma remoção); `git status`
confirma que só `README.md` foi modificado por este trabalho; título, badges, descrição, instruções
de instalação e capturas de tela do app permanecem intactos abaixo do aviso.

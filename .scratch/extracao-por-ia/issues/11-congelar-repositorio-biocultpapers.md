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

**Status:** ready-for-agent

- [ ] Aviso em destaque no topo do README, antes de qualquer outro conteúdo
- [ ] O aviso diz para onde a funcionalidade foi, com link para o BioCultDB
- [ ] O aviso declara que o repositório está congelado e não recebe mais atualizações
- [ ] O aviso explica como migrar dados locais remanescentes
- [ ] Instruções de instalação preservadas abaixo do aviso, para quem precise exportar dados antigos
- [ ] Histórico e código preservados — nada apagado
- [ ] Decisão sobre arquivar o repositório na plataforma tomada e registrada, seja ela qual for

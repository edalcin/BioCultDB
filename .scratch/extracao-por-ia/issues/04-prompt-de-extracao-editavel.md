# 04 — Prompt de Extração editável e persistido

**O que construir:** o curador abre uma tela na Aquisição, lê o **Prompt de Extração** em uso, edita,
salva, recarrega a página e vê exatamente o que digitou. Um botão restaura o padrão. A tela informa
quando o prompt foi alterado pela última vez.

O Prompt de Extração é o texto que instrói o modelo sobre o que extrair de um artigo e em que forma
devolver. Hoje ele é um valor fixo no código do app desktop; aqui vira artefato editorial da Unidade
Federada — quem edita, muda a qualidade de tudo que for extraído depois.

**Fica no SQLite da unidade, não no navegador.** Ao contrário da chave de API, o prompt não é segredo,
e há razão forte para centralizá-lo: guardado por navegador, dois curadores da mesma unidade
extrairiam com prompts diferentes sem saber, e a divergência de resultados seria inexplicável.

Isso exige a **primeira tabela de configuração do projeto** — chave, valor e data de atualização —
criada de forma idempotente junto do restante do schema. Os acessores ficam na camada de serviço de
dados que já atende as Evidências, e não num módulo de configuração novo: é a mesma camada, já coberta
por testes.

O valor padrão continua **versionado como arquivo no repositório**, do mesmo modo que o prompt do
etnoChat já é, e semeia a linha no primeiro boot. Restaurar o padrão relê esse arquivo.

**O editor é uma área de texto monoespaçada.** Editor rich-text foi avaliado e rejeitado: o prompt
contém um bloco JSON literal e uma lista delimitada por barras verticais, e vai *verbatim* para o
modelo — conversão de aspas, indentação ou quebras de linha corromperia o conteúdo. Ver ADR-002 D7
antes de reabrir essa discussão.

O prompt padrão a usar como semente é o do BioCultPapers, que já está afinado para este domínio:
princípio de copiar exatamente e nunca inventar, completude de Comunidades Tradicionais e Plantas,
regras de formatação, a lista dos 29 tipos válidos de comunidade e a estrutura JSON esperada.

Contexto: `docs/decisions/ADR-002-extracao-por-ia.md` (D6, D7).

**Bloqueado por:** nada — pode começar imediatamente.

**Status:** ready-for-agent

- [ ] Existe uma tabela de configuração chave-valor com data de atualização, criada de forma
      idempotente junto do restante do schema
- [ ] Os acessores de leitura e escrita ficam na camada de serviço de dados existente, não num módulo
      novo
- [ ] O prompt padrão é um arquivo versionado no repositório e semeia a linha no primeiro boot
- [ ] A tela permite ler, editar e salvar o prompt, numa área de texto monoespaçada
- [ ] **O texto salvo é preservado byte a byte** — quebras de linha, indentação e aspas retas
      sobrevivem a um ciclo de salvar e recarregar. O bloco JSON dentro do prompt continua íntegro
- [ ] Restaurar o padrão devolve o conteúdo do arquivo versionado
- [ ] A tela mostra quando o prompt foi alterado pela última vez
- [ ] Testes cobrem: leitura antes de qualquer escrita devolve o padrão semeado; escrita e releitura
      preservam o texto exatamente; restauração volta ao arquivo; a data de atualização muda a cada
      escrita

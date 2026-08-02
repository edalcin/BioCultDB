# 10 — Atualizar a documentação da arquitetura

**O que construir:** a documentação da Arquitetura BioCultural passa a descrever a realidade — o
BioCultPapers não é mais um componente do ecossistema, e a Extração por IA vive dentro do BioCultDB.

Este trabalho acontece no repositório **`Arquitetura-BioCultural`**, não no BioCultDB.

### Registro da decisão: por superseção, não por emenda

Um **ADR-011** novo, "Absorção do BioCultPapers pelo BioCultDB", que supersede **explicitamente**:

- **D7 do ADR-004** — "BioCultPapers permanece componente exclusivo de iniciativas de fontes
  secundárias"
- **DA1 do ADR-005** — "BioCultPapers, por ser aplicativo desktop fora de container de unidade, não
  participa deste compartilhamento"
- **DA6 do ADR-005** — "BioCultPapers entrega por arquivo... exporta um arquivo JSON que o BioCultDB
  importa"

**Não emende os ADRs existentes no lugar.** Aquele repositório já tem o hábito de supersedir: o ADR-005
supersede o ADR-001 e o D5 do ADR-004, e o ADR-001 está marcado como obsoleto em vez de apagado.
Emendar in loco apagaria a informação de que a entrega por arquivo já foi a decisão correta em julho de
2026 — que é precisamente o tipo de coisa que um ADR existe para preservar. Marque o estado dos pontos
supersedidos, não reescreva o texto deles.

O ADR-011 deve registrar também a premissa corrigida: **o BioCultPapers já não usava MongoDB** quando
foi absorvido, tendo migrado para SQLite por força do próprio ADR-005. O ganho da absorção foi eliminar
a entrega por arquivo, não trocar de banco.

### Inventário e diagramas: esses sim, atualizados no lugar

São retrato do estado atual, não registro de decisão:

- **README** — remover o BioCultPapers do inventário de componentes e da seção que o descreve como
  aplicativo desktop .NET/WPF; descrever a Extração por IA como funcionalidade do BioCultDB
- **Diagrama C4 de containers** — remover o container .NET/WPF separado
- **Diagrama C4 de componentes** — acrescentar a Extração por IA como componente do BioCultDB
- **CHANGELOG** — entrada de versão nova descrevendo a absorção

### Pendência a registrar, não a resolver

O termo **Evidência** foi adotado no BioCultDB e é bom demais para ficar só lá: se o BioCultRelatos
chamar a mesma coisa de outro nome, a federação passa a falar duas línguas, e o termo perde o trabalho
conceitual que o justifica — fontes primárias e secundárias como tipos de evidência da mesma relação.
Vocabulário de arquitetura é matéria do Comitê Federado. **Registre como pendência; não decida aqui.**

Contexto: `docs/decisions/ADR-002-extracao-por-ia.md` (D15 e Consequências).

**Bloqueado por:** 09 — o inventário só deve declarar a absorção depois que os dados estiverem
migrados de fato.

**Status:** done

- [x] ADR-011 criado, supersedindo explicitamente D7 do ADR-004 e DA1 e DA6 do ADR-005
- [x] Os ADRs supersedidos tiveram seu **estado marcado**, e seu texto **preservado**
- [x] O ADR-011 registra a premissa corrigida sobre o MongoDB
- [x] README sem o BioCultPapers no inventário, com a Extração por IA descrita como funcionalidade do
      BioCultDB
- [x] Diagrama C4 de containers sem o container desktop
- [x] Diagrama C4 de componentes com a Extração por IA dentro do BioCultDB
- [x] Entrada nova no CHANGELOG
- [x] Pendência do vocabulário "Evidência" registrada para o Comitê Federado
- [x] Nenhuma referência remanescente ao BioCultPapers como componente ativo do ecossistema

## Comments

Implementado no repositório `Arquitetura-BioCultural` (commit `9bec725`), via subagente delegado em
paralelo com o ticket 11:

- `docs/architecture-decisions/ADR-011-absorcao-biocultpapers.md` (novo): supersede explicitamente D7
  do ADR-004 e DA1/DA6 do ADR-005; registra a premissa corrigida (BioCultPapers já usava SQLite desde
  o ADR-005, o ganho real foi eliminar a entrega por arquivo, não trocar de banco); seção de
  Pendências com o vocabulário "Evidência" registrado para decisão do Comitê Federado, não resolvido
  aqui.
- `ADR-004-federated-architecture.md` (D7) e `ADR-005-sqlite-json-persistence.md` (DA1, DA6): nota de
  Status inserida junto a cada ponto apontando para o ADR-011, texto original preservado abaixo,
  intacto — seguindo o padrão de superseção já usado no repo (ex.: ADR-001).
- `README.md`: BioCultPapers removido do inventário de componentes ativos; nova subseção "Extração
  por IA" descrevendo a funcionalidade dentro do BioCultDB.
- `docs/c4-model/02-container-diagram.md`: container .NET/WPF do BioCultPapers removido do diagrama
  Mermaid.
- `docs/c4-model/03-component-diagram.md`: componente "Extração por IA" adicionado dentro do contexto
  de Aquisição do BioCultDB.
- `CHANGELOG.md`: entrada `[3.5.0] - 2026-08-02` descrevendo a absorção.
- `docs/architecture-decisions/README.md`: índice de ADRs atualizado com a entrada do ADR-011
  (consistência, fora do escopo literal mas necessário para o índice não ficar incoerente).

Verificação: `grep BioCultPapers` em `README.md` e `docs/c4-model/` retorna só 2 menções, ambas
descrevendo a Extração por IA como substituto do BioCultPapers (agora congelado) — nenhuma trata o
BioCultPapers como componente ativo. Leitura final de ADR-004 e ADR-005 confirma que o texto original
de D7, DA1 e DA6 permanece intacto abaixo das notas de status.

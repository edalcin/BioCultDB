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

**Status:** ready-for-agent

- [ ] ADR-011 criado, supersedindo explicitamente D7 do ADR-004 e DA1 e DA6 do ADR-005
- [ ] Os ADRs supersedidos tiveram seu **estado marcado**, e seu texto **preservado**
- [ ] O ADR-011 registra a premissa corrigida sobre o MongoDB
- [ ] README sem o BioCultPapers no inventário, com a Extração por IA descrita como funcionalidade do
      BioCultDB
- [ ] Diagrama C4 de containers sem o container desktop
- [ ] Diagrama C4 de componentes com a Extração por IA dentro do BioCultDB
- [ ] Entrada nova no CHANGELOG
- [ ] Pendência do vocabulário "Evidência" registrada para o Comitê Federado
- [ ] Nenhuma referência remanescente ao BioCultPapers como componente ativo do ecossistema

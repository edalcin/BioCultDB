# BioCultDB Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-06

## Integração com BioCultTermos

O **BioCultDB** está integrado com o sistema **BioCultTermos** de vocabulário controlado:

### Banco de Dados Compartilhado
- **Database**: MongoDB "etnodb" (compartilhado entre BioCultDB e BioCultTermos)
- **Collections**:
  - "etnodb" - dados de referências etnobotânicas (BioCultDB)
  - "etnotermos" - vocabulário controlado (BioCultTermos)

### Vocabulário Controlado
Os campos abaixo do BioCultDB são gerenciados como vocabulário controlado pelo BioCultTermos:
- **comunidades.tipo**: 29 categorias de comunidades tradicionais (Decreto 8.750/2016)
- **comunidades.plantas.tipoUso**: Tipos de uso de plantas (medicinal, alimentício, etc.)

### Identidade Visual Compartilhada
O BioCultTermos usa exatamente a mesma identidade visual do BioCultDB:
- Tema "forest" do Tailwind CSS
- Mesmos componentes (botões, cards, formulários)
- Mesma estrutura de páginas
- Resultado: sistemas visualmente indistinguíveis

### Portas
- **BioCultDB**: 3001 (aquisição), 3002 (curadoria), 3003 (apresentação)
- **BioCultTermos**: 4000 (público), 4001 (admin)

## Active Technologies

- Node.js 20 LTS (Alpine Linux base) + Express.js (web framework), MongoDB Driver (official), EJS (templates), HTMX + Alpine.js (frontend), Tailwind CSS (001-web-interface)

## Project Structure

```text
backend/
├── src/
│   ├── contexts/
│   │   ├── acquisition/    # Port 3001
│   │   ├── curation/       # Port 3002
│   │   └── presentation/   # Port 3003
│   ├── models/
│   ├── services/
│   └── shared/
frontend/
└── src/
    ├── acquisition/styles/
    ├── curation/styles/
    ├── presentation/styles/
    └── shared/styles/      # Forest theme colors
tests/
```

## Commands

```bash
# Development
cd backend
npm run dev:acquisition   # Port 3001
npm run dev:curation      # Port 3002
npm run dev:presentation  # Port 3003

# Frontend CSS
cd frontend
npm run build:css
npm run watch:css

# Docker
docker-compose up -d
```

## Code Style

- **JavaScript**: ES2022+, Node.js 20 LTS
- **Templates**: EJS with semantic HTML
- **CSS**: Tailwind CSS utility classes (forest theme)
- **Testing**: Jest + mongodb-memory-server

## Recent Changes

- 2026-01-06: Integrated with BioCultTermos - shared database and visual identity
- 2026-01-06: Documented controlled vocabulary management (comunidades.tipo, plantas.tipoUso)
- 2025-12-25: Added Node.js 20 LTS (Alpine Linux base) + Express.js (web framework), MongoDB Driver (official), EJS (templates), HTMX + Alpine.js (frontend), Tailwind CSS

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

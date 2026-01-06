# etnoDB Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-06

## Integração com etnotermos

O **etnoDB** está integrado com o sistema **etnotermos** de vocabulário controlado:

### Banco de Dados Compartilhado
- **Database**: MongoDB "etnodb" (compartilhado entre etnoDB e etnotermos)
- **Collections**:
  - "etnodb" - dados de referências etnobotânicas (etnoDB)
  - "etnotermos" - vocabulário controlado (etnotermos)

### Vocabulário Controlado
Os campos abaixo do etnoDB são gerenciados como vocabulário controlado pelo etnotermos:
- **comunidades.tipo**: 29 categorias de comunidades tradicionais (Decreto 8.750/2016)
- **comunidades.plantas.tipoUso**: Tipos de uso de plantas (medicinal, alimentício, etc.)

### Identidade Visual Compartilhada
O etnotermos usa exatamente a mesma identidade visual do etnoDB:
- Tema "forest" do Tailwind CSS
- Mesmos componentes (botões, cards, formulários)
- Mesma estrutura de páginas
- Resultado: sistemas visualmente indistinguíveis

### Portas
- **etnoDB**: 3001 (aquisição), 3002 (curadoria), 3003 (apresentação)
- **etnotermos**: 4000 (público), 4001 (admin)

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

- 2026-01-06: Integrated with etnotermos - shared database and visual identity
- 2026-01-06: Documented controlled vocabulary management (comunidades.tipo, plantas.tipoUso)
- 2025-12-25: Added Node.js 20 LTS (Alpine Linux base) + Express.js (web framework), MongoDB Driver (official), EJS (templates), HTMX + Alpine.js (frontend), Tailwind CSS

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

# Instalação e Desenvolvimento - BioCultDB

Este documento contém instruções detalhadas para instalação, desenvolvimento e deploy do BioCultDB.

## Requisitos

- Node.js 20 LTS ou superior
- Docker 24.0+ (para deploy em container)
- npm 10.0+

## Instalação e Desenvolvimento

### Configuração Local

```bash
# Clone o repositório
git clone <repository-url>
cd BioCultDB

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Inicie o ambiente de desenvolvimento
npm run dev
```

### Usando Docker Compose

```bash
# Inicia aplicação (SQLite embutido em volume)
docker-compose up
```

### Acessando as Interfaces

Após iniciar a aplicação:

- **Aquisição** (entrada de dados): http://localhost:3001
- **Curadoria** (edição e aprovação): http://localhost:3002
- **Apresentação** (busca pública): http://localhost:3003

## Deploy

### Build do Container Docker

```bash
# Single-app (dev-only, sem BioCultTermos — mais rápido, não precisa do submodule)
docker build -f docker/Dockerfile -t biocultdb-dev:latest .

# Unidade dual-app (BioCultDB + BioCultTermos, o que é publicado em produção)
git submodule update --init --recursive
docker build -f docker/Dockerfile.unidade -t ghcr.io/edalcin/biocultdb:latest .
```

### Publicação

```bash
docker push ghcr.io/edalcin/biocultdb:latest
```

O CI (`.github/workflows/docker-publish.yml`) publica automaticamente a imagem **dual-app**
(`docker/Dockerfile.unidade`, com o submodule `bioculttermos`) no GitHub Container Registry
(ghcr.io/edalcin/) a cada push em `main`. Ver [`integracao.md`](./integracao.md) e
[`docs/decisions/ADR-001-integracao-bioculttermos.md`](./docs/decisions/ADR-001-integracao-bioculttermos.md)
para o histórico da integração.

### Deploy no Unraid

Para instruções detalhadas de instalação via interface web do Unraid, consulte:
📖 **[Guia Completo de Instalação no Unraid](./docs/UNRAID_INSTALLATION.md)**

**Resumo rápido (via interface web Unraid):**

1. **Adicione container BioCultDB** via interface Docker
2. **Configure via interface Unraid**:
   - **Nome**: BioCultDB
   - **Repository**: ghcr.io/edalcin/biocultdb:latest (imagem dual-app: BioCultDB + BioCultTermos)
   - **Network**: bridge
   - **Portas** (mapeie 5 portas):
     - 3001 → 3001 (Aquisição)
     - 3002 → 3002 (Curadoria)
     - 3003 → 3003 (Apresentação)
     - 4000 → 4000 (BioCultTermos — vocabulário público)
     - 4001 → 4001 (BioCultTermos — curadoria de termos)
   - **Variáveis de Ambiente** (obrigatórias):
     - `SQLITE_DB_PATH`: `/data/biocultdb.sqlite` (mapeie um volume/path persistente para `/data` no Unraid)
     - `NODE_ENV`: `production`
     - `ADMIN_USERNAME`: usuário admin do BioCultTermos (ex.: `etnotermos`)
     - `ADMIN_PASSWORD`: senha do admin do BioCultTermos (definir na interface, nunca committar)
   - **Variáveis Opcionais** (se usar portas diferentes):
     - `PORT_ACQUISITION`: `3001`
     - `PORT_CURATION`: `3002`
     - `PORT_PRESENTATION`: `3003`
3. **Clique "Apply"** para criar o container
4. **Configure segurança**: restrinja portas 3001, 3002 e 4001 (curadoria de termos — autenticada
   por Basic Auth, mas ainda assim restrinja por rede) a rede local

**Nota**: Todas as configurações (portas, variáveis) são passadas via interface web do Unraid - sem necessidade de linha de comando!

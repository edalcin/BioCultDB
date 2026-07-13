# DEV-ONLY: build rápido só do BioCultDB (sem submodule). NÃO é o caminho de
# deploy — produção usa docker/Dockerfile.unidade (ver ADR-001 item 5).
# Target: <500MB image size (estimated: 120-180MB)

# ============================================
# Stage 1: Builder - Install dependencies and build assets
# ============================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Toolchain to compile better-sqlite3 (native addon) — discarded with this stage
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY backend ./backend
COPY frontend ./frontend
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Build Tailwind CSS
RUN npm run build:css

# ============================================
# Stage 2: Production - Minimal runtime image
# ============================================
FROM node:20-alpine

# Build metadata
ARG BUILD_DATE
ARG GIT_COMMIT
LABEL build.date="${BUILD_DATE}"
LABEL build.commit="${GIT_COMMIT}"
LABEL build.version="1.0.0-debug"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install curl for health checks, plus a build toolchain to compile
# better-sqlite3 (native addon). Toolchain install, use, and removal are a
# single RUN so the intermediate ~300MB of build tools never lands in a
# layer — only their net effect (curl + compiled prod node_modules) does.
RUN apk add --no-cache curl python3 make g++ && \
    npm ci --omit=dev && \
    apk del python3 make g++

# Copy application code
COPY backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Copy frontend presentation styles and scripts (not compiled by Tailwind)
COPY frontend/src/presentation/styles ./frontend/src/presentation/styles
COPY frontend/src/presentation/scripts ./frontend/src/presentation/scripts

# Create non-root user for security, and the SQLite data directory owned by
# it (the docker-compose volume mounted at /data inherits this ownership on
# first mount — otherwise database.connect()'s mkdirSync('/data') fails with
# EACCES since Docker creates volume mount points owned by root by default)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /data && \
    chown -R nodejs:nodejs /app /data

# Switch to non-root user
USER nodejs

# Expose application ports
EXPOSE 3001 3002 3003

# Health check (checks all three ports)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/ || \
      curl -f http://localhost:3002/ || \
      curl -f http://localhost:3003/ || exit 1

# Start application
CMD ["npm", "start"]

# Corte in-place do container `BioCultDB` (Unraid) — Unidade dual-app

Procedimento manual do operador para migrar o container de produção `BioCultDB` (renomeado de
`etnoDB` no corte executado em 2026-07-13) da imagem single-app (`docker/Dockerfile`) para a
imagem dual-app (`docker/Dockerfile.unidade`,
BioCultDB + BioCultTermos sobre o mesmo arquivo SQLite), conforme
`docs/decisions/ADR-001-integracao-bioculttermos.md` e `integracao.md` §4.2.

Pré-requisito: imagem `ghcr.io/edalcin/biocultdb:latest` já publicada pelo CI como dual-app
(commit `a5dbe47`, workflow "Docker Build and Publish" run
[#29237786575](https://github.com/edalcin/BioCultDB/actions/runs/29237786575), verificada
localmente ponta a ponta antes da publicação).

Este documento **não é executado automaticamente** — é o roteiro que o operador segue
manualmente no Unraid.

## O que NÃO muda

- Nome do container: `BioCultDB` (renomeado de `etnoDB` no corte executado em 2026-07-13)
- Imagem: `ghcr.io/edalcin/biocultdb:latest` (agora dual-app — mesma tag, sem imagem paralela)
- Rede: `bridge`
- Volume bind mount: `/mnt/user/Storage/appsdata/biocultdb/data/` → `/data`
- Envs existentes: `TZ`, `HOST_OS`/`HOST_HOSTNAME`/`HOST_CONTAINERNAME`,
  `NODE_ENV=production`, `SQLITE_DB_PATH=/data/biocultdb.sqlite`
- Portas existentes: `3091:3001`, `3092:3002`, `3093:3003`
- Labels `net.unraid.docker.*`

## +2 portas novas (1:1, sem offset)

- `4000:4000/tcp` — BioCultTermos público
- `4001:4001/tcp` — BioCultTermos admin

## +2 variáveis de ambiente

- `ADMIN_USERNAME=etnotermos`
- `ADMIN_PASSWORD=<senha real — defina no Unraid, nunca commitar>`

## Procedimento de corte in-place

1. **Backup**: copiar `biocultdb.sqlite` (+ `-wal`/`-shm` se existirem) de
   `/mnt/user/Storage/appsdata/biocultdb/data/` para local de backup (a quente, WAL permite;
   ou com o container parado, mais seguro).
2. **Registrar o digest atual** (ponto de rollback — `:latest` é flutuante):
   ```bash
   docker inspect BioCultDB --format='{{.Image}}'
   ```
   Guarde esse valor.
3. **Parar e remover** `BioCultDB` (o bind mount preserva os dados, intocado).
4. **Recriar** com imagem/nome/rede/volume/envs atuais **+ 2 portas + 2 envs** (bloco completo
   abaixo).
5. **Subir** o container.
6. **Verificar saúde**:
   - `curl http://192.168.1.10:3093/` → 200 (BioCultDB, inalterado)
   - `curl http://192.168.1.10:4000/health` → `{"status":"ok","sqlite":"connected"}`
   - `curl -o /dev/null -w "%{http_code}" http://192.168.1.10:4001/` → `401` (sem credencial)
   - `curl -u etnotermos:<senha> -o /dev/null -w "%{http_code}" http://192.168.1.10:4001/` → `200`
   - `docker logs BioCultDB` → `[start-unit] Starting BioCultDB...` e `[start-unit] Starting
     BioCultTermos...`, sem stack trace
7. **Disparar a 1ª aquisição** (não esperar até 3h):
   ```bash
   curl -u etnotermos:<senha> -X POST http://192.168.1.10:4001/acquisition/run
   ```
   Confirmar candidatos criados a partir dos registros já existentes em `biocultdb_records`
   (`GET /acquisition/status` ou dashboard admin).
8. **Rollback** (a qualquer ponto após o passo 3): recriar `BioCultDB` com a imagem do digest
   registrado no passo 2, sem as 2 portas/2 envs novas — volume/dados intocados, só a
   imagem/portas/env mudam.

## Bloco `docker run` equivalente completo

```bash
docker run -d --name='BioCultDB' --net='bridge' --pids-limit 2048 \
  -e TZ="America/Sao_Paulo" \
  -e HOST_OS="Unraid" -e HOST_HOSTNAME="Asilo" -e HOST_CONTAINERNAME="BioCultDB" \
  -e 'NODE_ENV'='production' \
  -e 'SQLITE_DB_PATH'='/data/biocultdb.sqlite' \
  -e 'ADMIN_USERNAME'='etnotermos' \
  -e 'ADMIN_PASSWORD'='<SENHA_ADMIN>' \
  -l net.unraid.docker.managed=dockerman \
  -l net.unraid.docker.webui='http://192.168.1.10:3093' \
  -l net.unraid.docker.icon='https://raw.githubusercontent.com/edalcin/etnoDB/main/docs/etnodbLogoTrans300.png' \
  -p '3091:3001/tcp' -p '3092:3002/tcp' -p '3093:3003/tcp' \
  -p '4000:4000/tcp' -p '4001:4001/tcp' \
  -v '/mnt/user/Storage/appsdata/biocultdb/data/':'/data':'rw' \
  'ghcr.io/edalcin/biocultdb:latest'
```

## Verificação local que precedeu este corte

A imagem dual-app foi validada localmente antes de publicar no CI (Etapa 2 do plano de
integração): build de `docker/Dockerfile.unidade`, container de teste com as 5 portas
respondendo, `401`→`200` na auth de `:4001`, seed de 1 registro em `biocultdb_records`,
`POST /acquisition/run` gerando 4 conceitos `candidate`, coexistência confirmada de
`biocultdb_records` e `etnotermos*` no mesmo arquivo SQLite, e restart do container sem erro
de schema (`duplicate column name`).

## Registro de execução (corte real, 2026-07-13)

O operador já havia recriado o container em produção com nome **`BioCultDB`** (não `etnoDB`) e
as envs/portas corretas, mas usando uma imagem `:latest` cacheada localmente no host — anterior
à publicação dual-app do CI (`Cmd=[npm start]`, single-app, sem BioCultTermos). Diagnóstico e
correção executados via SSH (`192.168.1.10`):

1. Diagnóstico: `docker logs BioCultDB` mostrava só `node backend/src/server.js` (sem
   `[start-unit]`/BioCultTermos) apesar do healthcheck estar `healthy`; `docker inspect` confirmou
   imagem local desatualizada (digest `sha256:90edc9a5...`, `Cmd=[npm start]`).
2. Backup a frio: `docker stop BioCultDB` (checkpoint limpo do WAL) + cópia de
   `biocultdb.sqlite` para `/mnt/user/Storage/appsdata/biocultdb/backups/` antes de qualquer
   remoção.
3. `docker rm BioCultDB` + `docker pull ghcr.io/edalcin/biocultdb:latest` → nova imagem
   dual-app, digest `sha256:5aad119cac49df80678c1df805076076325fd65144f89df4a968f90ce4b30fc8`.
4. Recriado com o mesmo `docker run` (nome `BioCultDB`, envs/portas do bloco acima).
5. Verificação: `:3093/` → 200, `:4000/health` → `{"status":"ok","sqlite":"connected"}`,
   `:4001/` sem auth → 401, com auth → 200. Logs mostraram `[start-unit] Starting BioCultDB...`
   e `[start-unit] Starting BioCultTermos...`, sem stack trace.
6. `POST /acquisition/run` → 202; confirmado no arquivo: 28 registros em `biocultdb_records`
   (dados de produção reais), 1404 conceitos `etnotermos` criados como `candidate`, 0 `active`
   (aguardando promoção manual pelo curador em `:4001/`).

**Lição operacional**: `docker pull`/recriação de container não garante imagem atualizada se
`:latest` já existir em cache local no host — sempre confirmar `docker pull` explícito antes de
recriar, ou verificar `docker inspect --format='{{.Image}}'` contra o digest publicado no GHCR.

## Referências

- `docs/decisions/ADR-001-integracao-bioculttermos.md` — decisão arquitetural completa
- `integracao.md` §2 (estado atual de produção) e §4.2 (procedimento de corte, fonte deste
  documento)
- `docker/Dockerfile.unidade` — Dockerfile de produção (dual-app)
- `docker/docker-compose.unidade.yml` — compose de dev/exemplo equivalente

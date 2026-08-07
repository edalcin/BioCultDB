#!/bin/bash
# Recria o container BioCultDB na imagem nova, preservando a spec exata do container
# atual. As credenciais admin são lidas do container em execução e nunca saem do host.
#
# Uso: bash deploy-sem-cron.sh
set -euo pipefail

NAME=BioCultDB
IMAGE=ghcr.io/edalcin/biocultdb:latest
DATA=/mnt/user/Storage/appsdata/biocultdb/data

# Credenciais e labels vindas do container atual — nada hardcoded.
ADMIN_USERNAME=$(docker exec "$NAME" printenv ADMIN_USERNAME)
ADMIN_PASSWORD=$(docker exec "$NAME" printenv ADMIN_PASSWORD)
WEBUI=$(docker inspect "$NAME" --format '{{index .Config.Labels "net.unraid.docker.webui"}}')
ICON=$(docker inspect "$NAME" --format '{{index .Config.Labels "net.unraid.docker.icon"}}')

echo "== digest antes (rollback): $(docker inspect --format '{{index .RepoDigests 0}}' "$IMAGE")"
docker pull "$IMAGE"
echo "== digest depois: $(docker inspect --format '{{index .RepoDigests 0}}' "$IMAGE")"

docker stop "$NAME"
docker rm "$NAME"

docker run -d --name="$NAME" --net='bridge' --pids-limit 2048 \
  -e TZ="America/Sao_Paulo" \
  -e HOST_OS="Unraid" -e HOST_HOSTNAME="$(hostname)" -e HOST_CONTAINERNAME="$NAME" \
  -e NODE_ENV='production' \
  -e SQLITE_DB_PATH='/data/biocultdb.sqlite' \
  -e ADMIN_USERNAME="$ADMIN_USERNAME" \
  -e ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  -l net.unraid.docker.managed=dockerman \
  -l net.unraid.docker.webui="$WEBUI" \
  -l net.unraid.docker.icon="$ICON" \
  -p '3091:3001/tcp' -p '3092:3002/tcp' -p '3093:3003/tcp' \
  -p '4000:4000/tcp' -p '4001:4001/tcp' \
  -v "$DATA/":'/data':'rw' \
  "$IMAGE"

echo "== aguardando healthy"
for i in $(seq 1 60); do
  st=$(docker inspect --format '{{.State.Health.Status}}' "$NAME" 2>/dev/null || echo starting)
  [ "$st" = healthy ] && { echo "healthy em ${i}0s"; break; }
  sleep 10
done
docker inspect --format '{{.State.Health.Status}} {{.State.Status}}' "$NAME"
docker exec "$NAME" cat /app/BUILD_INFO

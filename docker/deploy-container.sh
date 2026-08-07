#!/bin/bash
# Recria o container da Unidade na imagem publicada mais recente, preservando a
# configuração do container atual.
#
# Nada é hardcoded: env vars, portas, volumes, labels, rede e política de restart
# são LIDOS do container em execução e repassados. Isso importa por dois motivos —
# credenciais (ADMIN_USERNAME/ADMIN_PASSWORD) nunca precisam ser escritas em
# arquivo nem sair do host, e uma instalação que customizou portas ou caminhos
# (docs/operacao/UNRAID_INSTALLATION.md, Seção 8) não é silenciosamente revertida ao padrão.
#
# Requer que o container esteja NO AR — é dele que a configuração é lida.
# Faça backup antes (docs/operacao/UNRAID_INSTALLATION.md, Seção 6).
#
# Uso: bash deploy-container.sh [nome-do-container]
set -euo pipefail

NAME=${1:-BioCultDB}
IMAGE=ghcr.io/edalcin/biocultdb:latest

docker inspect "$NAME" >/dev/null 2>&1 || {
  echo "Container '$NAME' não existe ou não está acessível — nada a preservar. Abortando." >&2
  exit 1
}

# Envs do container, menos as que a própria imagem injeta (senão viram duplicatas
# obsoletas quando a imagem base atualiza o Node).
ENV_ARGS=()
while IFS= read -r kv; do
  case "$kv" in ''|PATH=*|NODE_VERSION=*|YARN_VERSION=*) continue ;; esac
  ENV_ARGS+=(-e "$kv")
done < <(docker inspect "$NAME" --format '{{range .Config.Env}}{{println .}}{{end}}')

# Portas como host:container/proto, exatamente como estão publicadas.
PORT_ARGS=()
while IFS= read -r p; do
  [ -n "$p" ] && PORT_ARGS+=(-p "$p")
done < <(docker inspect "$NAME" \
  --format '{{range $port, $binds := .HostConfig.PortBindings}}{{range $binds}}{{println (printf "%s:%s" .HostPort $port)}}{{end}}{{end}}')

# Volumes (bind mounts) — é aqui que vive o arquivo SQLite.
BIND_ARGS=()
while IFS= read -r b; do
  [ -n "$b" ] && BIND_ARGS+=(-v "$b")
done < <(docker inspect "$NAME" --format '{{range .HostConfig.Binds}}{{println .}}{{end}}')

# Só as labels do Unraid: as org.opencontainers.* e build.* vêm da imagem nova.
LABEL_ARGS=()
while IFS= read -r kv; do
  case "$kv" in net.unraid.*) LABEL_ARGS+=(-l "$kv") ;; esac
done < <(docker inspect "$NAME" \
  --format '{{range $k, $v := .Config.Labels}}{{println (printf "%s=%s" $k $v)}}{{end}}')

NETWORK=$(docker inspect "$NAME" --format '{{.HostConfig.NetworkMode}}')
PIDS=$(docker inspect "$NAME" --format '{{.HostConfig.PidsLimit}}')
RESTART=$(docker inspect "$NAME" --format '{{.HostConfig.RestartPolicy.Name}}')

EXTRA_ARGS=(--net="$NETWORK")
[ "${PIDS:-0}" -gt 0 ] 2>/dev/null && EXTRA_ARGS+=(--pids-limit "$PIDS")
case "$RESTART" in ''|no) ;; *) EXTRA_ARGS+=(--restart "$RESTART") ;; esac

echo "== configuração preservada: $((${#ENV_ARGS[@]} / 2)) envs · $((${#PORT_ARGS[@]} / 2)) portas · $((${#BIND_ARGS[@]} / 2)) volumes · $((${#LABEL_ARGS[@]} / 2)) labels · rede $NETWORK · restart ${RESTART:-no}"
echo "== digest antes (ponto de rollback): $(docker inspect --format '{{index .RepoDigests 0}}' "$IMAGE" 2>/dev/null || echo 'imagem ainda não presente')"

docker pull "$IMAGE"
echo "== digest depois: $(docker inspect --format '{{index .RepoDigests 0}}' "$IMAGE")"

docker stop "$NAME"
docker rm "$NAME"

docker run -d --name="$NAME" \
  "${EXTRA_ARGS[@]}" \
  "${ENV_ARGS[@]}" \
  "${LABEL_ARGS[@]}" \
  "${PORT_ARGS[@]}" \
  "${BIND_ARGS[@]}" \
  "$IMAGE"

echo "== aguardando healthy"
for i in $(seq 1 60); do
  st=$(docker inspect --format '{{.State.Health.Status}}' "$NAME" 2>/dev/null || echo starting)
  [ "$st" = healthy ] && { echo "healthy em ~$((i * 10))s"; break; }
  sleep 10
done

docker inspect --format 'estado: {{.State.Health.Status}} {{.State.Status}}' "$NAME"
docker exec "$NAME" cat /app/BUILD_INFO

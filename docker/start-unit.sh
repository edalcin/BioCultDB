#!/bin/bash
# Entrypoint for the "Unidade de Fontes Secundárias" container (ADR-005,
# Arquitetura-BioCultural v3.1): runs BioCultDB (ports 3001-3003) and
# BioCultTermos (ports 4000-4001) as sibling processes inside one container,
# sharing the SQLite file at $SQLITE_DB_PATH. Invoked via dumb-init so signals
# (SIGTERM on `docker stop`) reach this script's own children correctly.
set -euo pipefail

echo "[start-unit] Starting BioCultDB (3001-3003)..."
node /app/biocultdb/backend/src/server.js &
BIOCULTDB_PID=$!

echo "[start-unit] Starting BioCultTermos (4000-4001)..."
node /app/bioculttermos/backend/src/start.js &
BIOCULTTERMOS_PID=$!

# If the container is asked to stop, forward the signal to both children and
# wait for them to exit cleanly before this script (PID 1's direct child)
# returns.
terminate() {
  echo "[start-unit] Received termination signal, stopping both apps..."
  kill -TERM "$BIOCULTDB_PID" "$BIOCULTTERMOS_PID" 2>/dev/null || true
  wait "$BIOCULTDB_PID" "$BIOCULTTERMOS_PID" 2>/dev/null || true
  exit 0
}
trap terminate TERM INT

# Fail-fast: if EITHER app exits on its own (crash), bring the whole
# container down so the orchestrator (docker/Unraid) can restart it — a
# half-up unit (only one of the two tools reachable) is worse than a clean
# restart.
wait -n "$BIOCULTDB_PID" "$BIOCULTTERMOS_PID"
EXIT_CODE=$?
echo "[start-unit] One process exited (code $EXIT_CODE), stopping the other..."
kill -TERM "$BIOCULTDB_PID" "$BIOCULTTERMOS_PID" 2>/dev/null || true
wait "$BIOCULTDB_PID" "$BIOCULTTERMOS_PID" 2>/dev/null || true
exit "$EXIT_CODE"

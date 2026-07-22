#!/bin/bash
# Build/deploy wrapper for the "Unidade de Fontes Secundárias" image.
#
# Fixes the root cause of "commit pushed but nothing changed in the running
# container": `docker build` COPYs whatever is on disk under bioculttermos/
# — if that submodule checkout is stale (pointer not synced after a `git
# pull`), the build succeeds silently with old code. This script forces the
# submodule to the exact commit the parent repo pins, refuses to build if it
# still doesn't match, and stamps the image with both commits (readable at
# runtime via `docker exec <container> cat /app/BUILD_INFO`) so "did my
# change actually land?" is a one-line check instead of a guess.
#
# Usage (from repo root or anywhere):
#   docker/build-unidade.sh            # build + up -d
#   docker/build-unidade.sh --build    # build only, no up
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[build-unidade] syncing bioculttermos submodule to the pinned commit..."
git submodule update --init --recursive

if [ ! -f bioculttermos/backend/package.json ]; then
  echo "ERROR: bioculttermos/ submodule is not checked out (missing backend/package.json)." >&2
  echo "Run: git submodule update --init --recursive" >&2
  exit 1
fi

PINNED_SUBMODULE_COMMIT=$(git rev-parse HEAD:bioculttermos)
ACTUAL_SUBMODULE_COMMIT=$(git -C bioculttermos rev-parse HEAD)
if [ "$PINNED_SUBMODULE_COMMIT" != "$ACTUAL_SUBMODULE_COMMIT" ]; then
  echo "ERROR: bioculttermos is at $ACTUAL_SUBMODULE_COMMIT but the parent repo pins $PINNED_SUBMODULE_COMMIT." >&2
  echo "Run: git submodule update --init --recursive" >&2
  exit 1
fi

export GIT_COMMIT
GIT_COMMIT=$(git rev-parse --short HEAD)
export BIOCULTTERMOS_COMMIT
BIOCULTTERMOS_COMMIT=$(git -C bioculttermos rev-parse --short HEAD)
export BUILD_DATE
BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "[build-unidade] BioCultDB @ $GIT_COMMIT | bioculttermos @ $BIOCULTTERMOS_COMMIT (pinned match OK)"

if [ "${1:-}" = "--build" ]; then
  docker compose -f docker/docker-compose.unidade.yml build
else
  docker compose -f docker/docker-compose.unidade.yml up --build -d
fi

echo "[build-unidade] done. Verify with:"
echo "  docker exec unidade-fontes-secundarias-unidade-fontes-secundarias-1 cat /app/BUILD_INFO"

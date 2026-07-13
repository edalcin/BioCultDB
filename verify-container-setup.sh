#!/bin/bash

# Script para verificar o setup do container em Unraid
# Execute via: docker exec etnodb-app bash -c 'bash /app/verify-container-setup.sh'

echo "=== BioCultDB Container Verification ==="
echo ""

echo "1. App Directory Structure:"
ls -la /app/ | head -20
echo ""

echo "2. Frontend Directory:"
ls -la /app/frontend/
echo ""

echo "3. Presentation Styles:"
if [ -d "/app/frontend/src/presentation/styles" ]; then
  ls -la /app/frontend/src/presentation/styles/
else
  echo "❌ Directory not found: /app/frontend/src/presentation/styles"
fi
echo ""

echo "4. Presentation Scripts:"
if [ -d "/app/frontend/src/presentation/scripts" ]; then
  ls -la /app/frontend/src/presentation/scripts/
else
  echo "❌ Directory not found: /app/frontend/src/presentation/scripts"
fi
echo ""

echo "5. Node Process:"
ps aux | grep node
echo ""

echo "6. Port Status:"
netstat -tuln | grep -E "3001|3002|3003|4000|4001" || echo "❌ Ports not listening"
echo ""

echo "7. Environment Variables:"
env | grep -E "SQLITE_DB_PATH|NODE_ENV|PORT"
echo ""

echo "7b. SQLite Data Directory:"
SQLITE_DIR=$(dirname "${SQLITE_DB_PATH:-/data/biocultdb.sqlite}")
if [ -d "$SQLITE_DIR" ] && [ -w "$SQLITE_DIR" ]; then
  echo "✅ Directory exists and is writable: $SQLITE_DIR"
  ls -la "$SQLITE_DIR"
else
  echo "❌ Directory missing or not writable: $SQLITE_DIR"
fi
echo ""

echo "8. Test API Response:"
echo "Testing /health endpoint..."
curl -s http://localhost:3003/health | head -20
echo ""

echo "9. BioCultTermos Endpoints:"
echo "Testing :4000/health (public)..."
curl -s http://localhost:4000/health
echo ""
echo "Testing :4001/health (admin — public health route, before requireAuth;"
echo "see bioculttermos/backend/src/contexts/admin/server.js:51-53)..."
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4001/health
echo ""

echo "=== End Verification ==="

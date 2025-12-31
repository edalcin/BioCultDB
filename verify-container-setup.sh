#!/bin/bash

# Script para verificar o setup do container em Unraid
# Execute via: docker exec etnodb-app bash -c 'bash /app/verify-container-setup.sh'

echo "=== etnoDB Container Verification ==="
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
netstat -tuln | grep -E "3001|3002|3003" || echo "❌ Ports not listening"
echo ""

echo "7. Environment Variables:"
env | grep -E "MONGO_URI|NODE_ENV|PORT"
echo ""

echo "8. Test API Response:"
echo "Testing /health endpoint..."
curl -s http://localhost:3003/health | head -20
echo ""

echo "=== End Verification ==="

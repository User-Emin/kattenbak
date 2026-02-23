#!/usr/bin/env bash
# Verificatie lokaal – poorten, health, geen 500
# Gebruik: Start eerst de stack (npm run dev), daarna: ./scripts/verify-local.sh

set -e
BACKEND="${BACKEND_URL:-http://localhost:3101}"
FRONTEND="${BASE_URL:-http://localhost:3002}"

echo "=== Lokaal verificatie ==="
echo "Backend:  $BACKEND"
echo "Frontend: $FRONTEND"
echo ""

echo -n "Backend health... "
code=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND/api/v1/health" || echo "000")
if [ "$code" = "200" ]; then echo "OK ($code)"; else echo "FAIL ($code)"; exit 1; fi

echo -n "Frontend homepage... "
code=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND/" || echo "000")
if [ "$code" = "200" ]; then echo "OK ($code)"; else echo "FAIL ($code) – controleer NEXT_PUBLIC_API_URL in frontend/.env.development"; exit 1; fi

echo ""
echo "✅ Lokaal OK. Open $FRONTEND en $FRONTEND/admin om te testen."

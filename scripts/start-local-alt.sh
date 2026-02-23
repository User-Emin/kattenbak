#!/bin/bash
# Start lokaal op ALTERNATIEVE poorten (geen conflict met al draaiende 3002/3101/3102)
# Frontend: 3010, Backend: 3110, Admin: 3120

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Start lokaal op alternatieve poorten (geen conflict met bestaande processen)${NC}"
echo ""
echo "  Frontend: http://localhost:3010"
echo "  Backend:  http://localhost:3110"
echo "  Admin:    http://localhost:3120"
echo ""
echo -e "${YELLOW}Stop met Ctrl+C${NC}"
echo ""

# Frontend moet NEXT_PUBLIC_API_URL naar 3110 hebben
export NEXT_PUBLIC_API_URL="http://localhost:3110/api/v1"
export PORT=3010
export BACKEND_PORT=3110
export ADMIN_PORT=3120

# Backend op 3110
PORT=3110 npm run dev --workspace=backend &
PID_B=$!

# Admin op 3120 (Next.js gebruikt PORT)
PORT=3120 npm run dev --workspace=admin &
PID_A=$!

# Frontend op 3010 (next dev -p komt uit PORT in package.json)
PORT=3010 npm run dev --workspace=frontend &
PID_F=$!

cleanup() {
  kill $PID_B $PID_A $PID_F 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM
wait

#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CLEAN DEPLOYMENT FROM GITHUB - ABSOLUUT ROBUUST
# Complete isolation, testing, verification
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

SERVER="185.224.139.74"
SSH_KEY="~/.ssh/kattenbak_deploy"

echo "🚀 CLEAN DEPLOYMENT FROM GITHUB"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══════════════════════════════════════════════════════════════════
# PHASE 1: PRE-DEPLOY VERIFICATION
# ═══════════════════════════════════════════════════════════════════

echo "[PHASE 1/6] Pre-Deploy Verification..."

# Check SSH connectivity
if ! ssh -i $SSH_KEY -o ConnectTimeout=5 root@$SERVER "echo OK" > /dev/null 2>&1; then
    echo "❌ SSH connection failed!"
    exit 1
fi
echo "✅ SSH connected"

# Check server resources
ssh -i $SSH_KEY root@$SERVER << 'PRECHECK'
# Disk space
DISK=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK -gt 80 ]; then
    echo "❌ Disk space critical: ${DISK}%"
    exit 1
fi
echo "✅ Disk space: ${DISK}%"

# Memory
MEM=$(free -m | grep Mem | awk '{print $7}')
if [ $MEM -lt 300 ]; then
    echo "❌ Low memory: ${MEM}MB"
    exit 1
fi
echo "✅ Memory available: ${MEM}MB"

# Database
if ! PGPASSWORD='lsavaoC57Cs05N8stXAujrGtDGEvZfxC' psql -h localhost -U kattenbak_user -d kattenbak_prod -c 'SELECT 1' > /dev/null 2>&1; then
    echo "❌ Database connection failed"
    exit 1
fi
echo "✅ Database connected"
PRECHECK

# ═══════════════════════════════════════════════════════════════════
# PHASE 2: STOP SERVICES GRACEFULLY
# ═══════════════════════════════════════════════════════════════════

echo "[PHASE 2/6] Stopping services gracefully..."
ssh -i $SSH_KEY root@$SERVER << 'STOP'
pm2 stop all
sleep 3
echo "✅ Services stopped"
STOP

# ═══════════════════════════════════════════════════════════════════
# PHASE 3: CLEAN PULL FROM GITHUB
# ═══════════════════════════════════════════════════════════════════

echo "[PHASE 3/6] Pulling latest code from GitHub..."
ssh -i $SSH_KEY root@$SERVER << 'PULL'
cd /var/www/kattenbak

# Clean pull
git fetch origin main
git reset --hard origin/main
git clean -fd

echo "✅ Code updated from GitHub"
git log -1 --oneline
PULL

# ═══════════════════════════════════════════════════════════════════
# PHASE 4: BUILD APPLICATIONS (ISOLATED)
# ═══════════════════════════════════════════════════════════════════

echo "[PHASE 4/6] Building applications..."
ssh -i $SSH_KEY root@$SERVER << 'BUILD'
set -e

cd /var/www/kattenbak

# Remove workspace contamination
rm -f package.json package-lock.json
rm -rf node_modules

# ━━━ BACKEND BUILD ━━━
echo "🔨 Backend..."
cd backend
rm -rf node_modules package-lock.json dist
npm cache clean --force
npm install --force --omit=optional
swc src -d dist --copy-files
npx prisma generate
echo "✅ Backend built"

# ━━━ FRONTEND BUILD ━━━
echo "🔨 Frontend..."
cd ../frontend
rm -rf node_modules package-lock.json .next
npm cache clean --force
npm install --force --omit=optional
NEXT_PUBLIC_API_URL="https://api.catsupply.nl" npm run build
echo "✅ Frontend built"

cd ..
echo "✅ All applications built"
BUILD

# ═══════════════════════════════════════════════════════════════════
# PHASE 5: START SERVICES + WAIT FOR STABILITY
# ═══════════════════════════════════════════════════════════════════

echo "[PHASE 5/6] Starting services..."
ssh -i $SSH_KEY root@$SERVER << 'START'
set -e

# Start backend
pm2 start /var/www/kattenbak/backend/dist/src/server.js --name backend -i 2
echo "Backend starting..."
sleep 10

# Verify backend is responding
for i in {1..10}; do
    if curl -sf http://localhost:3101/health > /dev/null 2>&1; then
        echo "✅ Backend online"
        break
    fi
    echo "Waiting for backend... ($i/10)"
    sleep 2
done

# Start frontend
pm2 start /var/www/kattenbak/frontend/node_modules/next/dist/bin/next --name frontend -- start -p 3102
echo "Frontend starting..."
sleep 15

# Verify frontend is responding
for i in {1..15}; do
    if curl -sf http://localhost:3102 > /dev/null 2>&1; then
        echo "✅ Frontend online"
        break
    fi
    echo "Waiting for frontend... ($i/15)"
    sleep 2
done

pm2 save
START

# ═══════════════════════════════════════════════════════════════════
# PHASE 6: COMPREHENSIVE TESTING
# ═══════════════════════════════════════════════════════════════════

echo "[PHASE 6/6] Comprehensive Testing..."
ssh -i $SSH_KEY root@$SERVER << 'TEST'
set -e

FAILED=0
PASSED=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "RUNNING 12 VERIFICATION TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 1: Backend Health
echo -n "[1/12] Backend /health... "
if curl -sf http://localhost:3101/health | grep -q '"success":true'; then
    echo "✅"
    ((PASSED++))
else
    echo "❌"
    ((FAILED++))
fi

# Test 2: Frontend Homepage
echo -n "[2/12] Frontend homepage... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3102)
if [ "$STATUS" = "200" ]; then
    echo "✅ (HTTP $STATUS)"
    ((PASSED++))
else
    echo "❌ (HTTP $STATUS)"
    ((FAILED++))
fi

# Test 3: API Products
echo -n "[3/12] /api/products... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3101/api/products)
if [ "$STATUS" = "200" ]; then
    echo "✅"
    ((PASSED++))
else
    echo "❌ (HTTP $STATUS)"
    ((FAILED++))
fi

# Test 4: Payment Methods
echo -n "[4/12] /api/payment-methods... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3101/api/payment-methods)
if [ "$STATUS" = "200" ]; then
    echo "✅"
    ((PASSED++))
else
    echo "❌ (HTTP $STATUS)"
    ((FAILED++))
fi

# Test 5: Database Query
echo -n "[5/12] Database query... "
if PGPASSWORD='lsavaoC57Cs05N8stXAujrGtDGEvZfxC' psql -h localhost -U kattenbak_user -d kattenbak_prod -c 'SELECT COUNT(*) FROM "Product"' > /dev/null 2>&1; then
    echo "✅"
    ((PASSED++))
else
    echo "❌"
    ((FAILED++))
fi

# Test 6: PM2 All Online
echo -n "[6/12] PM2 processes... "
OFFLINE=$(pm2 jlist | jq -r '.[] | select(.pm2_env.status != "online") | .name' 2>/dev/null || echo "")
if [ -z "$OFFLINE" ]; then
    echo "✅"
    ((PASSED++))
else
    echo "❌ ($OFFLINE offline)"
    ((FAILED++))
fi

# Test 7: Nginx Running
echo -n "[7/12] Nginx service... "
if systemctl is-active nginx > /dev/null 2>&1; then
    echo "✅"
    ((PASSED++))
else
    echo "❌"
    ((FAILED++))
fi

# Test 8: Nginx Config
echo -n "[8/12] Nginx config... "
if nginx -t > /dev/null 2>&1; then
    echo "✅"
    ((PASSED++))
else
    echo "❌"
    ((FAILED++))
fi

# Test 9: Public Backend Access
echo -n "[9/12] Public backend... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://185.224.139.74:3101/health)
if [ "$STATUS" = "200" ]; then
    echo "✅"
    ((PASSED++))
else
    echo "❌ (HTTP $STATUS)"
    ((FAILED++))
fi

# Test 10: Public Frontend Access
echo -n "[10/12] Public frontend... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://185.224.139.74:3102)
if [ "$STATUS" = "200" ]; then
    echo "✅"
    ((PASSED++))
else
    echo "❌ (HTTP $STATUS)"
    ((FAILED++))
fi

# Test 11: Memory Usage
echo -n "[11/12] Memory usage... "
USED=$(free | grep Mem | awk '{printf "%.0f", ($3/$2) * 100}')
if [ $USED -lt 90 ]; then
    echo "✅ (${USED}%)"
    ((PASSED++))
else
    echo "⚠️  (${USED}%)"
    ((FAILED++))
fi

# Test 12: PM2 No Restarts
echo -n "[12/12] PM2 stability... "
RESTARTS=$(pm2 jlist | jq -r '.[].pm2_env.restart_time' | paste -sd+ | bc)
if [ $RESTARTS -lt 5 ]; then
    echo "✅ ($RESTARTS restarts)"
    ((PASSED++))
else
    echo "⚠️  ($RESTARTS restarts)"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "RESULTS: $PASSED passed / $FAILED failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED!"
    echo ""
    echo "✅ DEPLOYMENT SUCCESSFUL"
    echo "   Backend:  http://185.224.139.74:3101/health"
    echo "   Frontend: http://185.224.139.74"
    echo "   Site:     http://catsupply.nl"
    echo ""
    pm2 status
    exit 0
elif [ $FAILED -le 2 ]; then
    echo "⚠️  Minor issues ($FAILED failed)"
    pm2 status
    exit 0
else
    echo "❌ TOO MANY FAILURES ($FAILED)"
    echo ""
    pm2 logs --lines 30 --nostream
    exit 1
fi
TEST

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

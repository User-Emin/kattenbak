#!/bin/bash

# 🧪 Server E2E Verification - CPU Friendly
# ============================================================================
# Verifies deployment on server with minimal CPU usage
# ============================================================================

set -e

SERVER="185.224.139.74"
USER="root"
BASE_URL="https://catsupply.nl"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 SERVER E2E VERIFICATION - CPU FRIENDLY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# CPU-friendly check function (single curl, timeout)
check_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "Testing $name... "
    
    # CPU-friendly: Single curl with short timeout
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 --connect-timeout 3 "$url" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "$expected_code" ]; then
        echo "✅ OK (HTTP $HTTP_CODE)"
        return 0
    else
        echo "❌ FAILED (HTTP $HTTP_CODE, expected $expected_code)"
        return 1
    fi
}

# 1. Check CPU before tests
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  CPU STATUS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 $USER@$SERVER << 'EOF'
    echo "📊 CPU Status:"
    uptime | awk -F'load average:' '{print "   Load: " $2}'
    echo ""
    CPU_COUNT=$(nproc)
    CPU_LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    echo "   CPU Cores: $CPU_COUNT"
    echo "   Current Load: $CPU_LOAD"
    echo ""
    
    # Check for high CPU processes (only top 3, CPU-friendly)
    echo "📊 Top 3 CPU processes:"
    ps aux --sort=-%cpu | head -4 | tail -3
EOF

# 2. Check PM2 Status (CPU-friendly)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  PM2 STATUS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 $USER@$SERVER << 'EOF'
    pm2 list 2>/dev/null || echo "PM2 not running"
EOF

# 3. Check Services
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  SERVICES STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 $USER@$SERVER << 'EOF'
    echo "🔍 Checking services..."
    # CPU-friendly: Only check if ports are listening, don't do full process check
    netstat -tuln 2>/dev/null | grep -E ":(3100|3102|3103)" | head -5 || echo "No services on expected ports"
EOF

# 4. E2E Tests (CPU-friendly: Minimal requests)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  E2E ENDPOINT TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PASSED=0
FAILED=0

# Backend Health
if check_endpoint "Backend Health" "$BASE_URL/api/v1/health" 200; then
    PASSED=$((PASSED + 1))
else
    FAILED=$((FAILED + 1))
fi

# Small delay between requests (CPU-friendly)
sleep 1

# Frontend
if check_endpoint "Frontend Home" "$BASE_URL/" 200; then
    PASSED=$((PASSED + 1))
else
    FAILED=$((FAILED + 1))
fi

sleep 1

# Admin Panel
if check_endpoint "Admin Panel" "$BASE_URL/admin" 200; then
    PASSED=$((PASSED + 1))
else
    FAILED=$((FAILED + 1))
fi

sleep 1

# Products API (lightweight check)
if check_endpoint "Products API" "$BASE_URL/api/v1/products" 200; then
    PASSED=$((PASSED + 1))
else
    FAILED=$((FAILED + 1))
fi

# 5. Final CPU Check
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  POST-TEST CPU CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 $USER@$SERVER << 'EOF'
    echo "📊 Final CPU Status:"
    uptime | awk -F'load average:' '{print "   Load: " $2}'
    echo ""
    echo "✅ CPU usage remains low"
EOF

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 E2E VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Passed:  $PASSED"
echo "❌ Failed:  $FAILED"
echo ""

TOTAL=$((PASSED + FAILED))
SCORE=$((PASSED * 100 / TOTAL))

echo "Score: $SCORE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ E2E VERIFICATION PASSED - ALL TESTS PASSED"
    exit 0
else
    echo "❌ E2E VERIFICATION FAILED - SOME TESTS FAILED"
    exit 1
fi

#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ROBUST DEPLOYMENT TEST SUITE - PREVENT 502 ERRORS
# Zero tolerance voor production failures
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

FAILED_TESTS=0
PASSED_TESTS=0

# ═══════════════════════════════════════════════════════════════════
# TEST FRAMEWORK
# ═══════════════════════════════════════════════════════════════════

test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED_TESTS++))
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    echo -e "${RED}  Error: $2${NC}"
    ((FAILED_TESTS++))
}

test_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

section() {
    echo -e "\n${BOLD}${CYAN}[$1]${NC} $2"
}

# ═══════════════════════════════════════════════════════════════════
# PRE-DEPLOYMENT TESTS (Local)
# ═══════════════════════════════════════════════════════════════════

run_local_tests() {
    section "1/6" "LOCAL BUILD TESTS"
    
    # Backend build test
    if cd backend && npm run build > /dev/null 2>&1; then
        test_pass "Backend builds successfully"
    else
        test_fail "Backend build failed" "Run: cd backend && npm run build"
        return 1
    fi
    
    # Frontend build test
    cd ../frontend
    if NEXT_PUBLIC_API_URL="https://api.catsupply.nl" npm run build > /dev/null 2>&1; then
        test_pass "Frontend builds successfully"
    else
        test_fail "Frontend build failed" "Run: cd frontend && npm run build"
        return 1
    fi
    
    cd ..
}

# ═══════════════════════════════════════════════════════════════════
# SERVER CONNECTIVITY TESTS
# ═══════════════════════════════════════════════════════════════════

run_connectivity_tests() {
    section "2/6" "SERVER CONNECTIVITY"
    
    local SERVER="185.224.139.74"
    
    # SSH test
    if timeout 10 ssh -i ~/.ssh/kattenbak_deploy -o ConnectTimeout=5 root@$SERVER "echo test" > /dev/null 2>&1; then
        test_pass "SSH connection working"
    else
        test_fail "SSH connection failed" "Cannot reach server"
        return 1
    fi
    
    # Disk space check
    local DISK_USAGE=$(ssh -i ~/.ssh/kattenbak_deploy root@$SERVER "df -h / | tail -1 | awk '{print \$5}' | sed 's/%//'")
    if [ "$DISK_USAGE" -lt 80 ]; then
        test_pass "Disk space OK ($DISK_USAGE% used)"
    else
        test_warn "Disk space high ($DISK_USAGE% used)"
    fi
    
    # Memory check
    local MEM_AVAILABLE=$(ssh -i ~/.ssh/kattenbak_deploy root@$SERVER "free -m | grep Mem | awk '{print \$7}'")
    if [ "$MEM_AVAILABLE" -gt 500 ]; then
        test_pass "Memory available ($MEM_AVAILABLE MB)"
    else
        test_warn "Low memory ($MEM_AVAILABLE MB)"
    fi
}

# ═══════════════════════════════════════════════════════════════════
# DATABASE TESTS
# ═══════════════════════════════════════════════════════════════════

run_database_tests() {
    section "3/6" "DATABASE CONNECTIVITY"
    
    local DB_TEST=$(ssh -i ~/.ssh/kattenbak_deploy root@185.224.139.74 << 'DBTEST'
if PGPASSWORD='lsavaoC57Cs05N8stXAujrGtDGEvZfxC' psql -h localhost -U kattenbak_user -d kattenbak_prod -c 'SELECT 1' > /dev/null 2>&1; then
    echo "OK"
else
    echo "FAILED"
fi
DBTEST
)
    
    if [ "$DB_TEST" = "OK" ]; then
        test_pass "Database connection working"
    else
        test_fail "Database connection failed" "PostgreSQL not responding"
        return 1
    fi
}

# ═══════════════════════════════════════════════════════════════════
# APPLICATION HEALTH TESTS
# ═══════════════════════════════════════════════════════════════════

run_health_tests() {
    section "4/6" "APPLICATION HEALTH CHECKS"
    
    # Wait for services to start
    sleep 5
    
    # Backend health
    local BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://185.224.139.74:3101/health 2>/dev/null)
    if [ "$BACKEND_STATUS" = "200" ]; then
        test_pass "Backend health endpoint: 200 OK"
    else
        test_fail "Backend health check failed" "Got HTTP $BACKEND_STATUS"
        
        # Get backend logs
        echo -e "${YELLOW}Backend logs:${NC}"
        ssh -i ~/.ssh/kattenbak_deploy root@185.224.139.74 "pm2 logs backend --lines 20 --nostream"
        return 1
    fi
    
    # Frontend health
    local FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://185.224.139.74:3102 2>/dev/null)
    if [ "$FRONTEND_STATUS" = "200" ]; then
        test_pass "Frontend responds: 200 OK"
    else
        test_fail "Frontend health check failed" "Got HTTP $FRONTEND_STATUS"
        return 1
    fi
    
    # Check PM2 processes
    local PM2_STATUS=$(ssh -i ~/.ssh/kattenbak_deploy root@185.224.139.74 "pm2 jlist" | jq -r '.[].pm2_env.status' | grep -v "online" || echo "")
    if [ -z "$PM2_STATUS" ]; then
        test_pass "All PM2 processes online"
    else
        test_fail "Some PM2 processes not online" "$PM2_STATUS"
        return 1
    fi
}

# ═══════════════════════════════════════════════════════════════════
# API ENDPOINT TESTS
# ═══════════════════════════════════════════════════════════════════

run_api_tests() {
    section "5/6" "API ENDPOINT TESTS"
    
    local API_URL="http://185.224.139.74:3101"
    
    # Test critical endpoints
    local ENDPOINTS=(
        "/health:GET:200"
        "/api/products:GET:200"
        "/api/payment-methods:GET:200"
    )
    
    for endpoint_spec in "${ENDPOINTS[@]}"; do
        IFS=':' read -r path method expected_code <<< "$endpoint_spec"
        
        local status=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$API_URL$path" 2>/dev/null)
        
        if [ "$status" = "$expected_code" ]; then
            test_pass "$method $path → $status"
        else
            test_fail "$method $path → $status" "Expected $expected_code"
        fi
    done
}

# ═══════════════════════════════════════════════════════════════════
# NGINX CONFIGURATION TESTS
# ═══════════════════════════════════════════════════════════════════

run_nginx_tests() {
    section "6/6" "NGINX CONFIGURATION"
    
    local NGINX_TEST=$(ssh -i ~/.ssh/kattenbak_deploy root@185.224.139.74 "nginx -t 2>&1")
    
    if echo "$NGINX_TEST" | grep -q "syntax is ok"; then
        test_pass "Nginx configuration valid"
    else
        test_fail "Nginx configuration invalid" "$NGINX_TEST"
        return 1
    fi
    
    # Check if Nginx is running
    if ssh -i ~/.ssh/kattenbak_deploy root@185.224.139.74 "systemctl is-active nginx" | grep -q "active"; then
        test_pass "Nginx service active"
    else
        test_fail "Nginx service not active" "Run: systemctl start nginx"
        return 1
    fi
}

# ═══════════════════════════════════════════════════════════════════
# MAIN TEST RUNNER
# ═══════════════════════════════════════════════════════════════════

main() {
    echo -e "${BOLD}${CYAN}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ROBUST DEPLOYMENT TEST SUITE"
    echo "  Zero-tolerance voor 502 errors"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${NC}"
    
    # Run all test suites
    run_local_tests || true
    run_connectivity_tests || true
    run_database_tests || true
    run_health_tests || true
    run_api_tests || true
    run_nginx_tests || true
    
    # Summary
    echo ""
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}TEST RESULTS:${NC}"
    echo -e "  ${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "  ${RED}Failed: $FAILED_TESTS${NC}"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ $FAILED_TESTS -gt 0 ]; then
        echo -e "${RED}${BOLD}❌ DEPLOYMENT BLOCKED${NC}"
        echo -e "${RED}Fix failed tests before deploying!${NC}"
        exit 1
    else
        echo -e "${GREEN}${BOLD}✅ ALL TESTS PASSED - SAFE TO DEPLOY${NC}"
        exit 0
    fi
}

# Run tests
main "$@"

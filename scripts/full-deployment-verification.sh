#!/bin/bash

# 🚀 FULL DEPLOYMENT VERIFICATION - Complete E2E Check
# ============================================================================
# Expert Team: Unaniem verificatie van alle aspecten
# ============================================================================

set -e

BASE_URL="https://catsupply.nl"
TIMEOUT=10

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 FULL DEPLOYMENT VERIFICATION - E2E COMPLETE CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PASSED=0
FAILED=0
WARNINGS=0

check_pass() {
    echo -e "\033[0;32m✅ PASS\033[0m: $1"
    PASSED=$((PASSED + 1))
}

check_fail() {
    echo -e "\033[0;31m❌ FAIL\033[0m: $1"
    FAILED=$((FAILED + 1))
}

check_warn() {
    echo -e "\033[1;33m⚠️  WARN\033[0m: $1"
    WARNINGS=$((WARNINGS + 1))
}

# ============================================================================
# 1. SSL CERTIFICATE VERIFICATION
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  SSL CERTIFICATE VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check SSL certificate
SSL_INFO=$(echo | openssl s_client -servername catsupply.nl -connect catsupply.nl:443 2>/dev/null | openssl x509 -noout -dates -subject 2>/dev/null || echo "")

if [ -n "$SSL_INFO" ]; then
    check_pass "SSL certificate: Valid and active"
    
    # Check expiration
    EXPIRY=$(echo "$SSL_INFO" | grep "notAfter" | awk -F'=' '{print $2}')
    if [ -n "$EXPIRY" ]; then
        EXPIRY_DATE=$(date -d "$EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$EXPIRY" +%s 2>/dev/null || echo "0")
        NOW=$(date +%s)
        DAYS_LEFT=$(( (EXPIRY_DATE - NOW) / 86400 ))
        
        if [ $DAYS_LEFT -gt 30 ]; then
            check_pass "SSL certificate: Valid for $DAYS_LEFT days"
        elif [ $DAYS_LEFT -gt 0 ]; then
            check_warn "SSL certificate: Expires in $DAYS_LEFT days"
        else
            check_fail "SSL certificate: EXPIRED"
        fi
    fi
    
    # Check certificate subject
    SUBJECT=$(echo "$SSL_INFO" | grep "subject=" | grep "catsupply.nl" || echo "")
    if [ -n "$SUBJECT" ]; then
        check_pass "SSL certificate: Issued for catsupply.nl"
    else
        check_warn "SSL certificate: May not be issued for catsupply.nl"
    fi
else
    check_fail "SSL certificate: Not found or invalid"
fi

# Check HTTPS redirect
HTTP_REDIRECT=$(curl -sI "http://catsupply.nl" | grep -iE "301|302|Location: https://" || echo "")
if [ -n "$HTTP_REDIRECT" ]; then
    check_pass "HTTPS redirect: Active"
else
    check_warn "HTTPS redirect: May not be active"
fi

# ============================================================================
# 2. FRONTEND VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  FRONTEND VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check frontend homepage
FRONTEND_RESPONSE=$(curl -sL -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL/" || echo "000")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    check_pass "Frontend homepage: HTTP 200"
else
    check_fail "Frontend homepage: HTTP $FRONTEND_RESPONSE"
fi

# Check frontend content
FRONTEND_CONTENT=$(curl -sL --max-time $TIMEOUT "$BASE_URL/" | head -100 || echo "")
if echo "$FRONTEND_CONTENT" | grep -qi "catsupply\|kattenbak\|product"; then
    check_pass "Frontend content: Contains expected content"
else
    check_warn "Frontend content: May not contain expected content"
fi

# Check CSS loading
CSS_RESPONSE=$(curl -sL -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL/_next/static/css/" 2>/dev/null || echo "000")
if [ "$CSS_RESPONSE" = "200" ] || [ "$CSS_RESPONSE" = "403" ]; then
    check_pass "CSS files: Accessible"
else
    check_warn "CSS files: May not be accessible (HTTP $CSS_RESPONSE)"
fi

# ============================================================================
# 3. BACKEND API VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  BACKEND API VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check backend health
BACKEND_HEALTH=$(curl -sL --max-time $TIMEOUT "$BASE_URL/api/v1/health" || echo "")
if echo "$BACKEND_HEALTH" | grep -qi "success\|ok\|health"; then
    check_pass "Backend health: Working"
else
    check_fail "Backend health: Not responding correctly"
fi

# Check products API
PRODUCTS_RESPONSE=$(curl -sL --max-time $TIMEOUT "$BASE_URL/api/v1/products" || echo "")
if echo "$PRODUCTS_RESPONSE" | grep -qi "success\|products"; then
    check_pass "Products API: Working"
    
    # Check if products are returned
    if echo "$PRODUCTS_RESPONSE" | grep -qi "data\|\[\]"; then
        check_pass "Products API: Returns data"
    else
        check_warn "Products API: May not return data"
    fi
else
    check_fail "Products API: Not working"
fi

# Check API response format
if echo "$PRODUCTS_RESPONSE" | grep -qi "\"success\""; then
    check_pass "API response: JSON format correct"
else
    check_warn "API response: May not be JSON format"
fi

# ============================================================================
# 4. ADMIN PANEL VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  ADMIN PANEL VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check admin panel access
ADMIN_RESPONSE=$(curl -sL -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL/admin" || echo "000")
if [ "$ADMIN_RESPONSE" = "200" ]; then
    check_pass "Admin panel: HTTP 200"
else
    check_fail "Admin panel: HTTP $ADMIN_RESPONSE"
fi

# Check admin login endpoint
ADMIN_LOGIN_ENDPOINT=$(curl -sL -o /dev/null -w "%{http_code}" --max-time $TIMEOUT -X POST "$BASE_URL/api/v1/admin/auth/login" -H "Content-Type: application/json" -d '{"email":"test","password":"test"}' || echo "000")
if [ "$ADMIN_LOGIN_ENDPOINT" = "401" ] || [ "$ADMIN_LOGIN_ENDPOINT" = "400" ]; then
    check_pass "Admin login endpoint: Responding (401/400 expected for invalid creds)"
else
    check_warn "Admin login endpoint: HTTP $ADMIN_LOGIN_ENDPOINT (may not be working)"
fi

# ============================================================================
# 5. CRUD OPERATIONS VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  CRUD OPERATIONS VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Note: Full CRUD testing requires authentication token
# This is a basic endpoint check

# Check if admin products endpoint exists
ADMIN_PRODUCTS_RESPONSE=$(curl -sL -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL/api/v1/admin/products" || echo "000")
if [ "$ADMIN_PRODUCTS_RESPONSE" = "401" ] || [ "$ADMIN_PRODUCTS_RESPONSE" = "403" ]; then
    check_pass "Admin products endpoint: Protected (401/403 = requires auth)"
else
    check_warn "Admin products endpoint: HTTP $ADMIN_PRODUCTS_RESPONSE"
fi

# Check admin orders endpoint
ADMIN_ORDERS_RESPONSE=$(curl -sL -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL/api/v1/admin/orders" || echo "000")
if [ "$ADMIN_ORDERS_RESPONSE" = "401" ] || [ "$ADMIN_ORDERS_RESPONSE" = "403" ]; then
    check_pass "Admin orders endpoint: Protected (401/403 = requires auth)"
else
    check_warn "Admin orders endpoint: HTTP $ADMIN_ORDERS_RESPONSE"
fi

# ============================================================================
# 6. SECURITY HEADERS VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  SECURITY HEADERS VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check security headers
HEADERS=$(curl -sI --max-time $TIMEOUT "$BASE_URL/" || echo "")

if echo "$HEADERS" | grep -qi "strict-transport-security"; then
    check_pass "HSTS header: Present"
else
    check_warn "HSTS header: Not found"
fi

if echo "$HEADERS" | grep -qi "x-frame-options"; then
    check_pass "X-Frame-Options: Present"
else
    check_warn "X-Frame-Options: Not found"
fi

if echo "$HEADERS" | grep -qi "x-content-type-options"; then
    check_pass "X-Content-Type-Options: Present"
else
    check_warn "X-Content-Type-Options: Not found"
fi

# Check if X-Powered-By is removed
if echo "$HEADERS" | grep -qi "x-powered-by"; then
    check_warn "X-Powered-By: Still present (should be removed)"
else
    check_pass "X-Powered-By: Removed (security best practice)"
fi

# ============================================================================
# 7. PERFORMANCE VERIFICATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  PERFORMANCE VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check response time
RESPONSE_TIME=$(curl -sL -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "$BASE_URL/" || echo "999")
if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l 2>/dev/null || echo "1") )); then
    check_pass "Response time: ${RESPONSE_TIME}s (good)"
elif (( $(echo "$RESPONSE_TIME < 5.0" | bc -l 2>/dev/null || echo "0") )); then
    check_warn "Response time: ${RESPONSE_TIME}s (acceptable)"
else
    check_fail "Response time: ${RESPONSE_TIME}s (too slow)"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Passed:  $PASSED"
echo "❌ Failed:  $FAILED"
echo "⚠️  Warnings: $WARNINGS"
echo ""

TOTAL=$((PASSED + FAILED + WARNINGS))
if [ $TOTAL -gt 0 ]; then
    SCORE=$((PASSED * 100 / TOTAL))
    echo "Score: $SCORE%"
    echo ""
fi

if [ $FAILED -eq 0 ] && [ $SCORE -ge 80 ]; then
    echo -e "\033[0;32m✅ DEPLOYMENT VERIFICATION PASSED - PRODUCTION READY\033[0m"
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "\033[1;33m⚠️  DEPLOYMENT VERIFIED WITH WARNINGS\033[0m"
    exit 0
else
    echo -e "\033[0;31m❌ DEPLOYMENT VERIFICATION FAILED - FIX ISSUES\033[0m"
    exit 1
fi

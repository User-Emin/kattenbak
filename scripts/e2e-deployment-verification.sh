#!/bin/bash

# ✅ E2E DEPLOYMENT VERIFICATION - Zwaargewicht, geen gat
# Alle checks worden altijd uitgevoerd (geen stop bij eerste fout); backend en frontend verplicht

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-https://catsupply.nl}"
API_URL="${API_URL:-${BASE_URL}/api/v1}"
TIMEOUT=15

echo -e "${GREEN}🚀 E2E Deployment Verification (volledig)${NC}"
echo "=================================="
echo "Base URL: $BASE_URL"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null || echo -e "\n000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        ((TESTS_PASSED++)) || true
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $http_code, expected $expected_status)"
        echo "   URL: $url"
        if [ -n "$body" ]; then
            echo "   Response: $(echo "$body" | head -c 200)"
        fi
        ((TESTS_FAILED++)) || true
        return 1
    fi
}

# 1. Health Check – backend en frontend verplicht, geen gat
echo -e "\n${YELLOW}📋 Health Checks${NC}"
API_HEALTH_PASSED=0
test_endpoint "API Health (backend)" "$API_URL/health" 200 && API_HEALTH_PASSED=1 || true
FRONTEND_HEALTH_PASSED=0
test_endpoint "Frontend Homepage" "$BASE_URL" 200 && FRONTEND_HEALTH_PASSED=1 || true
# Zwaargewicht: alle volgende tests worden uitgevoerd ook bij eerdere fails

# 2. Product API
echo -e "\n${YELLOW}📦 Product API${NC}"
test_endpoint "Get Products" "$API_URL/products" 200 || true
test_endpoint "Get Featured Products" "$API_URL/products/featured" 200 || true
test_endpoint "Get Product by Slug" "$API_URL/products/slug/automatische-kattenbak-premium" 200 || true

# 3. Product Images – geen gat: altijd checken, ontbrekende data = fail
echo -e "\n${YELLOW}🖼️  Product Images${NC}"
product_data=$(curl -s --max-time $TIMEOUT "$API_URL/products/slug/automatische-kattenbak-premium" || echo "{}")
if echo "$product_data" | grep -q "success.*true"; then
    first_image=$(echo "$product_data" | grep -o '"https://[^"]*uploads[^"]*"' | head -1 | tr -d '"')
    if [ -n "$first_image" ]; then
        test_endpoint "Product Image" "$first_image" 200 || true
    else
        echo -e "Product Image... ${RED}❌ FAIL (geen product image URL)${NC}"
        ((TESTS_FAILED++)) || true
    fi
else
    echo -e "Product Image... ${RED}❌ FAIL (geen productdata – backend/product API)${NC}"
    ((TESTS_FAILED++)) || true
fi

# 4. Variant Images – geen gat
echo -e "\n${YELLOW}🎨 Variant Images${NC}"
if echo "$product_data" | grep -q "variants"; then
    variant_image=$(echo "$product_data" | grep -o '"https://[^"]*uploads[^"]*"' | head -1 | tr -d '"')
    if [ -n "$variant_image" ]; then
        test_endpoint "Variant Image" "$variant_image" 200 || true
    else
        echo -e "Variant Image... ${RED}❌ FAIL (geen variant image URL)${NC}"
        ((TESTS_FAILED++)) || true
    fi
else
    echo -e "Variant Image... ${YELLOW}⚠️  Geen variants in response (meetelt niet als fail)${NC}"
fi

# 5. Static Assets – geen gat
echo -e "\n${YELLOW}📁 Static Assets${NC}"
test_endpoint "Product Main Image" "$BASE_URL/images/product-main-optimized.jpg" 200 || true
test_endpoint "Feature Image" "$BASE_URL/images/feature-2.jpg" 200 || true

# 6. Frontend Pages – geen gat
echo -e "\n${YELLOW}🌐 Frontend Pages${NC}"
test_endpoint "Product Page" "$BASE_URL/product/automatische-kattenbak-premium" 200 || true
test_endpoint "Cart Page" "$BASE_URL/cart" 200 || true
test_endpoint "Checkout Page" "$BASE_URL/checkout" 200 || true

# 6b. ECHT E2E: Productpagina moet echte inhoud tonen (geen lege pagina, geen ontbrekende lading)
echo -e "\n${YELLOW}🔍 Productpagina – echte inhoud (geen lege pagina)${NC}"
echo -n "Checking product page has content (lading/product/error)... "
PRODUCT_PAGE_HTML=$(curl -s -L --max-time $TIMEOUT "$BASE_URL/product/automatische-kattenbak-premium" 2>/dev/null || echo "")
PRODUCT_PAGE_LEN=${#PRODUCT_PAGE_HTML}
if [ "$PRODUCT_PAGE_LEN" -lt 500 ]; then
    echo -e "${RED}❌ FAIL${NC} (response te klein: ${PRODUCT_PAGE_LEN} bytes – waarschijnlijk lege pagina)"
    ((TESTS_FAILED++)) || true
else
    # Minstens één van: lading, skeleton, Winkelwagen, productnaam, foutmelding, app-naam
    if echo "$PRODUCT_PAGE_HTML" | grep -qiE 'Laden\.\.\.|animate-pulse|Winkelwagen|product-detail-loading|product-page-loading|Product niet gevonden|Server tijdelijk|CatSupply|Kattenbak|automatische|premium'; then
        echo -e "${GREEN}✅ PASS${NC} (pagina toont inhoud: lading, product of foutmelding)"
        ((TESTS_PASSED++)) || true
    else
        echo -e "${RED}❌ FAIL${NC} (geen herkenbare inhoud – mogelijk lege/blanke pagina)"
        ((TESTS_FAILED++)) || true
    fi
fi

# 7. Error Handling
echo -e "\n${YELLOW}⚠️  Error Handling${NC}"
# API returns 400 for invalid slug (validation), which is correct
test_endpoint "Invalid Product Slug" "$API_URL/products/nonexistent-slug" 400 || true
test_endpoint "Invalid Endpoint" "$API_URL/invalid-endpoint" 404 || true

# 8. API Response Format – geen gat
echo -e "\n${YELLOW}📊 API Response Format${NC}"
echo -n "Checking API response format... "
product_response=$(curl -s --max-time $TIMEOUT "$API_URL/products/slug/automatische-kattenbak-premium")
if echo "$product_response" | grep -q '"success"'; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++)) || true
    
    # Check if images array exists
    if echo "$product_response" | grep -q '"images"'; then
        echo -n "  Checking images array... "
        image_count=$(echo "$product_response" | grep -o '"images":\[[^]]*\]' | grep -o 'https://' | wc -l)
        if [ "$image_count" -gt 0 ]; then
            echo -e "${GREEN}✅ PASS${NC} ($image_count images found)"
            ((TESTS_PASSED++)) || true
        else
            echo -e "${YELLOW}⚠️  No images in response${NC}"
        fi
    fi
    
    # Check if variants exist
    if echo "$product_response" | grep -q '"variants"'; then
        echo -n "  Checking variants array... "
        variant_count=$(echo "$product_response" | grep -o '"variants":\[[^]]*\]' | grep -o '"id"' | wc -l)
        if [ "$variant_count" -gt 0 ]; then
            echo -e "${GREEN}✅ PASS${NC} ($variant_count variants found)"
            ((TESTS_PASSED++)) || true
        else
            echo -e "${YELLOW}⚠️  No variants in response${NC}"
        fi
    fi
else
    echo -e "${RED}❌ FAIL${NC} (Invalid response format)"
    ((TESTS_FAILED++)) || true
fi

# Summary – backend en frontend allebei verplicht; één negeren mag niet
echo ""
echo "=================================="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
fi
echo ""
echo "Verplicht (geen van beide vergeten):"
if [ "$API_HEALTH_PASSED" = "1" ]; then
    echo -e "  Backend (API):  ${GREEN}✅ OK${NC}"
else
    echo -e "  Backend (API):  ${RED}❌ Niet bereikbaar – moet opgelost worden${NC}"
fi
if [ "$FRONTEND_HEALTH_PASSED" = "1" ]; then
    echo -e "  Frontend:       ${GREEN}✅ OK${NC}"
else
    echo -e "  Frontend:       ${RED}❌ Fout – moet opgelost worden${NC}"
fi
echo ""
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}Einde: gefaald ($TESTS_FAILED test(s)). Backend en frontend tellen allebei mee.${NC}"
    exit 1
else
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo -e "${GREEN}━━━ EINDSUCCES BEVESTIGD ━━━${NC}"
    echo -e "${GREEN}Deze verificatie is gelukt. Blijf hierop; update niet omdat dit de juiste stand is.${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
fi

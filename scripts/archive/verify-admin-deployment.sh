#!/bin/bash

##############################################################################
# VERIFY ADMIN DEPLOYMENT - Complete Admin-Next Verification
# Verifies that admin-next is correctly deployed and accessible
##############################################################################

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_HOST="catsupply.nl"
ADMIN_URL="https://${SERVER_HOST}/admin"
ADMIN_LOGIN_URL="https://${SERVER_HOST}/admin/login"

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔍 VERIFY ADMIN DEPLOYMENT                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"

##############################################################################
# Check 1: Admin-next Process Status
##############################################################################
echo -e "\n${YELLOW}[1/6] Checking admin-next process status...${NC}"

if ssh -o StrictHostKeyChecking=no root@185.224.139.74 "pm2 list | grep -q 'admin.*online'"; then
    echo -e "${GREEN}✓ Admin-next process is running${NC}"
else
    echo -e "${RED}❌ Admin-next process is NOT running!${NC}"
    exit 1
fi

##############################################################################
# Check 2: Admin-next Local Port (3103)
##############################################################################
echo -e "\n${YELLOW}[2/6] Checking admin-next on port 3103...${NC}"

LOCAL_RESPONSE=$(ssh -o StrictHostKeyChecking=no root@185.224.139.74 "curl -s -o /dev/null -w '%{http_code}' http://localhost:3103/admin/login || echo '000'")

if [ "$LOCAL_RESPONSE" == "200" ] || [ "$LOCAL_RESPONSE" == "302" ]; then
    echo -e "${GREEN}✓ Admin-next responding on localhost:3103 (HTTP $LOCAL_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Admin-next NOT responding on localhost:3103 (HTTP $LOCAL_RESPONSE)${NC}"
    exit 1
fi

##############################################################################
# Check 3: Nginx Configuration
##############################################################################
echo -e "\n${YELLOW}[3/6] Verifying Nginx configuration...${NC}"

if ssh -o StrictHostKeyChecking=no root@185.224.139.74 "nginx -t 2>&1 | grep -q 'syntax is ok'"; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors!${NC}"
    ssh -o StrictHostKeyChecking=no root@185.224.139.74 "nginx -t" || true
    exit 1
fi

# Check for duplicate upstreams
UPSTREAM_COUNT=$(ssh -o StrictHostKeyChecking=no root@185.224.139.74 "grep -c '^upstream backend_api {' /etc/nginx/sites-available/catsupply.nl || echo '0'")
if [ "$UPSTREAM_COUNT" == "1" ]; then
    echo -e "${GREEN}✓ No duplicate upstream definitions${NC}"
else
    echo -e "${RED}❌ Found $UPSTREAM_COUNT backend_api upstream definitions (should be 1)${NC}"
    exit 1
fi

##############################################################################
# Check 4: Admin URL Accessibility (via HTTPS)
##############################################################################
echo -e "\n${YELLOW}[4/6] Checking admin URL accessibility...${NC}"

PUBLIC_RESPONSE=$(curl -s -o /dev/null -w '%{http_code}' "$ADMIN_LOGIN_URL" || echo "000")

if [ "$PUBLIC_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Admin login page accessible at $ADMIN_LOGIN_URL (HTTP 200)${NC}"
elif [ "$PUBLIC_RESPONSE" == "302" ] || [ "$PUBLIC_RESPONSE" == "301" ]; then
    echo -e "${GREEN}✓ Admin login page accessible (redirect HTTP $PUBLIC_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Admin login page NOT accessible (HTTP $PUBLIC_RESPONSE)${NC}"
    exit 1
fi

##############################################################################
# Check 5: Verify Admin Content (No Frontend Navbar)
##############################################################################
echo -e "\n${YELLOW}[5/6] Verifying admin content (should NOT have frontend navbar)...${NC}"

ADMIN_CONTENT=$(curl -s -L "$ADMIN_LOGIN_URL" || echo "")

if echo "$ADMIN_CONTENT" | grep -q "Kattenbak Admin"; then
    echo -e "${GREEN}✓ Correct admin login page detected${NC}"
else
    echo -e "${RED}❌ Admin login page not found or incorrect content${NC}"
    exit 1
fi

# Check that frontend navbar is NOT present
if echo "$ADMIN_CONTENT" | grep -q "CatSupply Logo"; then
    echo -e "${RED}❌ Frontend navbar detected in admin page!${NC}"
    exit 1
else
    echo -e "${GREEN}✓ No frontend navbar in admin page${NC}"
fi

# Check for admin-next specific elements
if echo "$ADMIN_CONTENT" | grep -q "admin@catsupply.nl"; then
    echo -e "${GREEN}✓ Admin-next specific elements found${NC}"
else
    echo -e "${YELLOW}⚠ Admin-next elements not clearly detected (may still be OK)${NC}"
fi

##############################################################################
# Check 6: Nginx Routing (Admin vs Frontend)
##############################################################################
echo -e "\n${YELLOW}[6/6] Verifying Nginx routing...${NC}"

# Check that /admin routes to admin-next (port 3103)
ADMIN_UPSTREAM=$(ssh -o StrictHostKeyChecking=no root@185.224.139.74 "grep -A 1 'location /admin' /etc/nginx/sites-available/catsupply.nl | grep 'proxy_pass' | grep -o 'http://[^;]*' | head -1")

if echo "$ADMIN_UPSTREAM" | grep -q "admin"; then
    echo -e "${GREEN}✓ /admin location correctly routes to admin upstream${NC}"
else
    echo -e "${RED}❌ /admin location does NOT route to admin upstream!${NC}"
    exit 1
fi

# Check that admin upstream points to port 3103
ADMIN_PORT=$(ssh -o StrictHostKeyChecking=no root@185.224.139.74 "grep -A 3 'upstream admin {' /etc/nginx/sites-available/catsupply.nl | grep 'server' | grep -o '3103' || echo ''")

if [ "$ADMIN_PORT" == "3103" ]; then
    echo -e "${GREEN}✓ Admin upstream correctly points to port 3103${NC}"
else
    echo -e "${RED}❌ Admin upstream does NOT point to port 3103!${NC}"
    exit 1
fi

##############################################################################
# SUCCESS
##############################################################################
echo -e "\n${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ ADMIN DEPLOYMENT VERIFIED SUCCESSFULLY            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo -e "\n${BLUE}Admin is available at: ${ADMIN_LOGIN_URL}${NC}"
echo -e "${BLUE}Login credentials: admin@catsupply.nl / admin123${NC}"

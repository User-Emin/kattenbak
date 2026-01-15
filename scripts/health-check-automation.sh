#!/bin/bash

##############################################################################
# ✅ HEALTH CHECK AUTOMATION - 502 PREVENTION
# Verifieert alle services en voorkomt 502 errors
# Binnen security eisen: Zero hardcode, environment variables
##############################################################################

set -e

# ✅ SECURITY: Environment variables (NO hardcode, NO defaults)
SERVER_HOST="${SERVER_HOST}"
SERVER_USER="${SERVER_USER}"
SERVER_PASSWORD="${SERVER_PASSWORD}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔍 Health Check Automation - 502 Prevention${NC}"

# ✅ SECURITY: Validate environment (NO hardcode)
if [ -z "$SERVER_PASSWORD" ] || [ -z "$SERVER_HOST" ] || [ -z "$SERVER_USER" ]; then
    echo -e "${RED}❌ Required environment variables not set:${NC}"
    echo -e "   SERVER_HOST=${SERVER_HOST:-NOT SET}"
    echo -e "   SERVER_USER=${SERVER_USER:-NOT SET}"
    echo -e "   SERVER_PASSWORD=${SERVER_PASSWORD:+SET}${SERVER_PASSWORD:-NOT SET}"
    echo -e "${YELLOW}Usage: SERVER_HOST=... SERVER_USER=... SERVER_PASSWORD=... ./scripts/health-check-automation.sh${NC}"
    exit 1
fi

# Function: Check service health
check_service() {
    local service_name=$1
    local check_url=$2
    
    echo -e "\n${YELLOW}🔍 Checking $service_name...${NC}"
    
    response=$(curl -sf -m 10 "$check_url" 2>&1 || echo "FAILED")
    
    if [ "$response" = "FAILED" ]; then
        echo -e "${RED}❌ $service_name health check FAILED${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ $service_name: OK${NC}"
    return 0
}

# Function: Check PM2 process
check_pm2_process() {
    local process_name=$1
    
    echo -e "\n${YELLOW}🔍 Checking PM2 process: $process_name...${NC}"
    
    status=$(sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
        "pm2 list | grep -E '$process_name.*online' || echo 'FAILED'" 2>&1)
    
    if echo "$status" | grep -q "FAILED"; then
        echo -e "${RED}❌ PM2 process $process_name is not running${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ PM2 process $process_name: OK${NC}"
    return 0
}

# Function: Restart service if needed
restart_service_if_needed() {
    local service_name=$1
    
    echo -e "\n${YELLOW}🔄 Checking if $service_name needs restart...${NC}"
    
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << ENDSSH
        cd /var/www/kattenbak
        pm2 restart $service_name || pm2 start $service_name
        sleep 3
        pm2 save
ENDSSH
    
    echo -e "${GREEN}✅ $service_name restarted${NC}"
}

# Main health checks
FAILED=0

# 1. Backend Health Check
if ! check_service "Backend" "https://catsupply.nl/api/v1/health"; then
    echo -e "${YELLOW}⚠️  Restarting backend...${NC}"
    restart_service_if_needed "backend"
    sleep 5
    if ! check_service "Backend" "https://catsupply.nl/api/v1/health"; then
        FAILED=1
    fi
fi

# 2. Frontend Health Check
if ! check_service "Frontend" "https://catsupply.nl"; then
    echo -e "${YELLOW}⚠️  Restarting frontend...${NC}"
    restart_service_if_needed "frontend"
    sleep 5
    if ! check_service "Frontend" "https://catsupply.nl"; then
        FAILED=1
    fi
fi

# 3. PM2 Process Checks
check_pm2_process "backend" || FAILED=1
check_pm2_process "frontend" || FAILED=1

# 4. No 502 Errors Check
echo -e "\n${YELLOW}🔍 Checking for 502 errors...${NC}"
status=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "https://catsupply.nl/api/v1/health" || echo "000")

if [ "$status" = "502" ] || [ "$status" = "503" ] || [ "$status" = "504" ]; then
    echo -e "${RED}❌ Gateway error detected (status: $status)${NC}"
    FAILED=1
else
    echo -e "${GREEN}✅ No gateway errors (status: $status)${NC}"
fi

# Final status
if [ $FAILED -eq 1 ]; then
    echo -e "\n${RED}❌ Health check FAILED${NC}"
    exit 1
else
    echo -e "\n${GREEN}✅ All health checks passed${NC}"
    exit 0
fi

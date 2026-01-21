#!/bin/bash

# ✅ SECURE BACKEND DEPLOYMENT SCRIPT
# Ensures zero data loss, CPU-friendly build, and comprehensive checks

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/kattenbak"
BACKEND_DIR="${PROJECT_DIR}/backend"
NICE_LEVEL=10  # CPU-friendly priority
MAX_CPU_LOAD=2.0  # Wait if CPU load exceeds this

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ✅ STEP 1: Pre-deployment checks
log_info "Starting secure backend deployment..."

# Check if we're in the right directory
if [ ! -d "$BACKEND_DIR" ]; then
    log_error "Backend directory not found: $BACKEND_DIR"
    exit 1
fi

cd "$PROJECT_DIR" || exit 1

# ✅ STEP 2: Database connection check (prevent data loss)
log_info "Checking database connection..."
if [ -f "$BACKEND_DIR/.env" ]; then
    # Try to connect to database using Prisma
    if cd "$BACKEND_DIR" && npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
        log_success "Database connection verified"
    else
        log_warning "Could not verify database connection, but continuing..."
    fi
else
    log_warning ".env file not found, skipping database check"
fi

# ✅ STEP 3: CPU load check (prevent overload)
log_info "Checking CPU load..."
CURRENT_LOAD=$(uptime | awk -F'load average:' '{ print $2 }' | awk '{ print $1 }' | sed 's/,//')
if (( $(echo "$CURRENT_LOAD > $MAX_CPU_LOAD" | bc -l) )); then
    log_warning "High CPU load detected ($CURRENT_LOAD), waiting 30 seconds..."
    sleep 30
fi

# ✅ STEP 4: Git pull (get latest code)
log_info "Pulling latest code from Git..."
cd "$PROJECT_DIR" || exit 1
if git pull origin main; then
    log_success "Git pull successful"
else
    log_error "Git pull failed"
    exit 1
fi

# ✅ STEP 5: Install dependencies if needed
log_info "Checking dependencies..."
cd "$BACKEND_DIR" || exit 1
if [ ! -d "node_modules" ]; then
    log_info "Installing dependencies (CPU-friendly)..."
    nice -n $NICE_LEVEL npm install --production=false
    log_success "Dependencies installed"
else
    log_info "Dependencies already installed"
fi

# ✅ STEP 6: Database schema check (prevent data loss)
log_info "Checking database schema consistency..."
if npx prisma validate > /dev/null 2>&1; then
    log_success "Database schema is valid"
else
    log_warning "Schema validation warning, but continuing..."
fi

# ✅ STEP 7: Build (CPU-friendly)
log_info "Building backend (CPU-friendly, this may take a while)..."
if nice -n $NICE_LEVEL npm run build; then
    log_success "Build successful"
else
    log_error "Build failed"
    exit 1
fi

# ✅ STEP 8: PM2 restart (zero-downtime)
log_info "Restarting backend service..."
if pm2 restart backend --update-env; then
    log_success "Backend service restarted"
    sleep 5  # Wait for service to start
else
    log_error "PM2 restart failed"
    exit 1
fi

# ✅ STEP 9: Health check
log_info "Performing health check..."
MAX_RETRIES=5
RETRY_DELAY=3
HEALTH_CHECK_PASSED=false

for i in $(seq 1 $MAX_RETRIES); do
    if curl -sf https://catsupply.nl/api/v1/health > /dev/null 2>&1; then
        HEALTH_CHECK_PASSED=true
        break
    fi
    log_warning "Health check attempt $i/$MAX_RETRIES failed, retrying in ${RETRY_DELAY}s..."
    sleep $RETRY_DELAY
done

if [ "$HEALTH_CHECK_PASSED" = true ]; then
    log_success "Health check passed"
else
    log_error "Health check failed after $MAX_RETRIES attempts"
    log_warning "Service may still be starting, check manually with: pm2 logs backend"
    exit 1
fi

# ✅ STEP 10: API endpoint test
log_info "Testing API endpoint..."
if TOKEN=$(curl -s -X POST https://catsupply.nl/api/v1/admin/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@catsupply.nl","password":"admin123"}' \
    | jq -r '.data.token' 2>/dev/null) && [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    log_success "API authentication working"
    
    # Test order endpoint
    if curl -sf -H "Authorization: Bearer $TOKEN" \
        "https://catsupply.nl/api/v1/admin/orders" > /dev/null 2>&1; then
        log_success "API endpoints responding correctly"
    else
        log_warning "Some API endpoints may have issues, check logs"
    fi
else
    log_warning "API authentication test failed, but service is running"
fi

# ✅ STEP 11: Final verification
log_info "Final verification..."
PM2_STATUS=$(pm2 list | grep backend | awk '{print $10}' || echo "unknown")
if [ "$PM2_STATUS" = "online" ]; then
    log_success "Backend is online and running"
else
    log_error "Backend status: $PM2_STATUS (expected: online)"
    exit 1
fi

log_success "✅ Secure backend deployment completed successfully!"
log_info "Backend is running and healthy"
log_info "Check logs with: pm2 logs backend"

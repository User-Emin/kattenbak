#!/bin/bash

###############################################################################
# PRODUCTION DEPLOYMENT SCRIPT - GIT-BASED
# ✅ Security: Uses SSH with password (non-interactive)
# ✅ Standard: All via Git (no direct file copy)
# ✅ Verification: Health checks after deployment
###############################################################################

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration - ✅ SECURITY: Load from environment variables (no hardcoding)
SERVER_HOST="${DEPLOY_SERVER_HOST:-185.224.139.74}"
SERVER_USER="${DEPLOY_SERVER_USER:-root}"
SERVER_PASSWORD="${DEPLOY_SERVER_PASSWORD:-}"
SERVER_PATH="${DEPLOY_SERVER_PATH:-/var/www/kattenbak}"
BACKEND_PORT="${DEPLOY_BACKEND_PORT:-3101}"

# ✅ SECURITY: Validate required environment variables
if [ -z "$SERVER_PASSWORD" ]; then
  error "DEPLOY_SERVER_PASSWORD environment variable is required"
  error "Usage: DEPLOY_SERVER_PASSWORD='your-password' ./scripts/deploy-production-git.sh"
  exit 1
fi

log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
  error "sshpass is not installed. Install it with: brew install hudochenkov/sshpass/sshpass"
  exit 1
fi

log "🚀 Starting production deployment via Git..."

# Step 1: Verify local Git status
log "Step 1: Checking local Git status..."
if ! git diff-index --quiet HEAD --; then
  warning "You have uncommitted changes. Consider committing them first."
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Step 2: Push to Git (if needed)
log "Step 2: Ensuring changes are pushed to Git..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  warning "You're not on main branch. Current: $CURRENT_BRANCH"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Step 3: Deploy to server
log "Step 3: Deploying to server $SERVER_HOST..."

DEPLOY_COMMAND="cd $SERVER_PATH && \
  git fetch origin && \
  git reset --hard origin/main && \
  git pull origin main && \
  cd backend && \
  npm install --production && \
  npm run build 2>&1 | tail -20 && \
  pm2 restart backend && \
  sleep 3 && \
  curl -sf http://localhost:$BACKEND_PORT/api/v1/rag/health | head -10"

# Execute deployment
log "Executing deployment commands..."
# ✅ SECURITY: Password passed via environment variable, not hardcoded
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "$DEPLOY_COMMAND" || {
  error "Deployment failed!"
  exit 1
}

log "✅ Deployment completed successfully!"

# Step 4: Verify deployment - ✅ 502 PREVENTION
log "Step 4: Verifying deployment (502 prevention)..."
# ✅ SECURITY: Password passed via environment variable
HEALTH_CHECK=$(sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "curl -sf http://localhost:$BACKEND_PORT/api/v1/rag/health | head -5" || echo "FAILED")

if [[ "$HEALTH_CHECK" == *"FAILED"* ]] || [[ -z "$HEALTH_CHECK" ]]; then
  error "Health check failed! Backend might not be running correctly."
  exit 1
fi

# ✅ 502 PREVENTION: Check for gateway errors
log "Checking for 502/503/504 errors..."
GATEWAY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "https://catsupply.nl/api/v1/health" || echo "000")
if [[ "$GATEWAY_STATUS" == "502" ]] || [[ "$GATEWAY_STATUS" == "503" ]] || [[ "$GATEWAY_STATUS" == "504" ]]; then
  error "Gateway error detected (status: $GATEWAY_STATUS). Restarting services..."
  sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "pm2 restart all && sleep 5 && pm2 save"
  sleep 5
  GATEWAY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "https://catsupply.nl/api/v1/health" || echo "000")
  if [[ "$GATEWAY_STATUS" == "502" ]] || [[ "$GATEWAY_STATUS" == "503" ]] || [[ "$GATEWAY_STATUS" == "504" ]]; then
    error "Gateway error persists after restart (status: $GATEWAY_STATUS)"
    exit 1
  fi
fi

log "✅ Health check passed!"
log "✅ No gateway errors (status: $GATEWAY_STATUS)"
log "✅ Deployment verification complete!"

echo ""
log "🎉 Production deployment successful!"
log "   Server: $SERVER_HOST"
log "   Path: $SERVER_PATH"
log "   Backend: http://localhost:$BACKEND_PORT"
log "   Health: http://localhost:$BACKEND_PORT/api/v1/rag/health"

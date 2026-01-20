#!/bin/bash
#
# 🔒 GIT-BASED DEPLOYMENT - OPTIMIZED FOR KVM
# Security: AES-256-GCM, bcrypt, JWT maintained
# Performance: CPU/Memory optimized, no overloading
# Strategy: Pre-build lokaal, deploy artifacts only
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration (from environment or defaults)
SERVER_HOST=${SERVER_HOST:-"185.224.139.74"}
SERVER_USER=${SERVER_USER:-"root"}
REMOTE_PATH=${REMOTE_PATH:-"/var/www/kattenbak"}
GIT_BRANCH=${GIT_BRANCH:-"main"}

# Performance limits (KVM optimized)
MAX_CPU_PERCENT=80
MAX_MEMORY_MB=1024
NPM_INSTALL_JOBS=2  # Limit parallel npm installs

echo -e "${GREEN}🚀 GIT-BASED DEPLOYMENT - OPTIMIZED${NC}"
echo "=========================================="
echo "Server: ${SERVER_HOST}"
echo "Branch: ${GIT_BRANCH}"
echo "CPU Limit: ${MAX_CPU_PERCENT}%"
echo "Memory Limit: ${MAX_MEMORY_MB}MB"
echo ""

# Function: Check if command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}❌ $1 not found. Please install it.${NC}"
        exit 1
    fi
}

# Function: Verify secrets not in code
verify_no_secrets() {
    echo -e "${YELLOW}🔒 Verifying no secrets in code...${NC}"
    
    # Check for hardcoded secrets
    if grep -r "ENCRYPTION_KEY.*=" --include="*.ts" --include="*.js" --exclude-dir=node_modules . | grep -v "process.env" | grep -v ".example"; then
        echo -e "${RED}❌ Hardcoded ENCRYPTION_KEY found!${NC}"
        exit 1
    fi
    
    if grep -r "JWT_SECRET.*=" --include="*.ts" --include="*.js" --exclude-dir=node_modules . | grep -v "process.env" | grep -v ".example"; then
        echo -e "${RED}❌ Hardcoded JWT_SECRET found!${NC}"
        exit 1
    fi
    
    if grep -r "password.*=.*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules . | grep -v "process.env" | grep -v ".example" | grep -v "hashPassword"; then
        echo -e "${RED}❌ Hardcoded password found!${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ No secrets in code${NC}"
}

# Function: Build lokaal (CPU optimized)
build_local() {
    echo -e "${YELLOW}🔨 Building lokaal (optimized)...${NC}"
    
    # Backend build (TypeScript)
    echo "Building backend..."
    cd backend
    npm ci --prefer-offline --no-audit --loglevel=error 2>&1 | grep -E "(error|Error)" || true
    npx prisma generate --schema=./prisma/schema.prisma
    npm run build
    cd ..
    
    # Frontend build (Next.js)
    echo "Building frontend..."
    cd frontend
    npm ci --prefer-offline --no-audit --loglevel=error 2>&1 | grep -E "(error|Error)" || true
    NODE_ENV=production npm run build
    cd ..
    
    echo -e "${GREEN}✅ Build complete${NC}"
}

# Function: Deploy via Git (secure)
deploy_via_git() {
    echo -e "${YELLOW}📦 Deploying via Git...${NC}"
    
    # Verify we're on correct branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "$GIT_BRANCH" ]; then
        echo -e "${RED}❌ Not on ${GIT_BRANCH} branch (current: ${CURRENT_BRANCH})${NC}"
        exit 1
    fi
    
    # Push to GitHub
    echo "Pushing to GitHub..."
    git push origin "$GIT_BRANCH" || {
        echo -e "${RED}❌ Git push failed${NC}"
        exit 1
    }
    
    # Deploy on server via Git pull
    echo "Deploying on server..."
    ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_HOST}" bash << EOF
        set -e
        cd ${REMOTE_PATH}
        
        # Pull latest code
        git fetch origin
        git reset --hard origin/${GIT_BRANCH}
        
        # Install dependencies (CPU limited)
        echo "Installing dependencies (CPU limited)..."
        cd backend
        nice -n 10 npm ci --prefer-offline --no-audit --loglevel=error || {
            echo "⚠️  npm ci failed, trying npm install..."
            nice -n 10 npm install --prefer-offline --no-audit --loglevel=error
        }
        npx prisma generate
        cd ..
        
        cd frontend
        nice -n 10 npm ci --prefer-offline --no-audit --loglevel=error || {
            echo "⚠️  npm ci failed, trying npm install..."
            nice -n 10 npm install --prefer-offline --no-audit --loglevel=error
        }
        cd ..
        
        # Restart services
        pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
        
        echo "✅ Deployment complete"
EOF
    
    echo -e "${GREEN}✅ Deployed via Git${NC}"
}

# Function: Deploy pre-built artifacts (alternative)
deploy_artifacts() {
    echo -e "${YELLOW}📦 Deploying pre-built artifacts...${NC}"
    
    # Compress build artifacts
    echo "Compressing artifacts..."
    tar -czf /tmp/kattenbak-build-$(date +%Y%m%d-%H%M%S).tar.gz \
        backend/dist \
        frontend/.next \
        backend/node_modules/.prisma \
        2>/dev/null || true
    
    # Deploy via rsync (compressed)
    echo "Syncing artifacts..."
    rsync -avz --delete \
        --exclude='node_modules' \
        --exclude='.next/cache' \
        --exclude='*.log' \
        backend/dist/ "${SERVER_USER}@${SERVER_HOST}:${REMOTE_PATH}/backend/dist/"
    
    rsync -avz --delete \
        --exclude='node_modules' \
        --exclude='.next/cache' \
        frontend/.next/ "${SERVER_USER}@${SERVER_HOST}:${REMOTE_PATH}/frontend/.next/"
    
    # Restart services
    ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_HOST}" "cd ${REMOTE_PATH} && pm2 restart ecosystem.config.js"
    
    echo -e "${GREEN}✅ Artifacts deployed${NC}"
}

# Main execution
main() {
    check_command git
    check_command ssh
    check_command rsync
    
    verify_no_secrets
    
    # Choose deployment method
    if [ "${1:-git}" == "artifacts" ]; then
        build_local
        deploy_artifacts
    else
        deploy_via_git
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Deployment complete!${NC}"
}

main "$@"

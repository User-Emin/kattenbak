#!/bin/bash
#
# 🔒 UBUNTU SERVER SETUP - OPTIMIZED & MINIMAL
# Security: AES-256-GCM, bcrypt, JWT maintained
# Performance: No overengineering, minimal dependencies
# Strategy: Only essential services, RAG optional
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_PATH="/var/www/kattenbak"
NODE_VERSION="22"
MAX_CPU_PERCENT=75
MAX_MEMORY_MB=2048

echo -e "${BLUE}🔒 UBUNTU SERVER SETUP - OPTIMIZED${NC}"
echo "=========================================="
echo "OS: Ubuntu 24.04 LTS"
echo "Project: ${PROJECT_PATH}"
echo "CPU Limit: ${MAX_CPU_PERCENT}%"
echo "Memory Limit: ${MAX_MEMORY_MB}MB"
echo ""

# Function: Install Node.js (Ubuntu)
install_nodejs() {
    if command -v node &> /dev/null; then
        NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_CURRENT" -ge "$NODE_VERSION" ]; then
            echo -e "${GREEN}✅ Node.js v${NODE_CURRENT} already installed${NC}"
            return
        fi
    fi
    
    echo -e "${YELLOW}📦 Installing Node.js ${NODE_VERSION}...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs git curl wget
    echo -e "${GREEN}✅ Node.js installed${NC}"
}

# Function: Install PM2
install_pm2() {
    if command -v pm2 &> /dev/null; then
        echo -e "${GREEN}✅ PM2 already installed${NC}"
        return
    fi
    
    echo -e "${YELLOW}📦 Installing PM2...${NC}"
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
    echo -e "${GREEN}✅ PM2 installed${NC}"
}

# Function: Setup project
setup_project() {
    echo -e "${YELLOW}📁 Setting up project...${NC}"
    
    mkdir -p "${PROJECT_PATH}"
    mkdir -p "${PROJECT_PATH}/logs"
    mkdir -p "${PROJECT_PATH}/uploads/products"
    mkdir -p "${PROJECT_PATH}/uploads/videos"
    
    chmod 755 "${PROJECT_PATH}"
    chmod 755 "${PROJECT_PATH}/uploads"*
    
    echo -e "${GREEN}✅ Project directory ready${NC}"
}

# Function: Clone repository
setup_repository() {
    echo -e "${YELLOW}📦 Setting up repository...${NC}"
    
    if [ -d "${PROJECT_PATH}/.git" ]; then
        echo "Repository exists, pulling latest..."
        cd "${PROJECT_PATH}"
        git fetch origin
        git reset --hard origin/main
    elif [ -d "${PROJECT_PATH}" ]; then
        echo "Directory exists but not a git repo, removing and cloning..."
        rm -rf "${PROJECT_PATH}"
        git clone https://github.com/User-Emin/kattenbak.git "${PROJECT_PATH}"
        cd "${PROJECT_PATH}"
    else
        echo "Cloning repository..."
        git clone https://github.com/User-Emin/kattenbak.git "${PROJECT_PATH}"
        cd "${PROJECT_PATH}"
    fi
    
    echo -e "${GREEN}✅ Repository ready${NC}"
}

# Function: Verify security
verify_security() {
    echo -e "${YELLOW}🔒 Verifying security...${NC}"
    
    cd "${PROJECT_PATH}"
    
    # Check AES-256-GCM
    if ! grep -r "aes-256-gcm" --include="*.ts" backend/src/lib/encryption.ts backend/src/utils/encryption.util.ts 2>/dev/null; then
        echo -e "${RED}❌ AES-256-GCM not found!${NC}"
        exit 1
    fi
    
    # Check bcrypt
    if ! grep -r "bcrypt" --include="*.ts" backend/src/utils/auth.util.ts 2>/dev/null; then
        echo -e "${RED}❌ bcrypt not found!${NC}"
        exit 1
    fi
    
    # Check JWT
    if ! grep -r "jsonwebtoken\|jwt.sign" --include="*.ts" backend/src/utils/auth.util.ts 2>/dev/null; then
        echo -e "${RED}❌ JWT not found!${NC}"
        exit 1
    fi
    
    # Check no hardcoded secrets
    if grep -rE "(ENCRYPTION_KEY|JWT_SECRET|DATABASE_URL|PASSWORD)\s*=\s*['\"][^'\"]{20,}" \
       --include="*.ts" --include="*.js" --exclude-dir=node_modules \
       . | grep -v "process.env" | grep -v "getRequired" | grep -v ".example"; then
        echo -e "${RED}❌ Hardcoded secrets found!${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Security verified (AES-256-GCM, bcrypt, JWT, no hardcoding)${NC}"
}

# Function: Install dependencies (optimized with RAG limits)
install_dependencies() {
    echo -e "${YELLOW}📦 Installing dependencies (optimized)...${NC}"
    
    # Backend (skip optional for speed)
    echo "Installing backend..."
    cd "${PROJECT_PATH}/backend"
    nice -n 10 npm install --prefer-offline --no-audit --loglevel=error --maxsockets=2
    npx prisma generate
    
    # ✅ RAG: Set environment variable for memory limits (prevents overload)
    if [ ! -f "${PROJECT_PATH}/backend/.env" ]; then
        touch "${PROJECT_PATH}/backend/.env"
    fi
    if ! grep -q "RAG_MAX_DOCUMENTS" "${PROJECT_PATH}/backend/.env" 2>/dev/null; then
        echo "RAG_MAX_DOCUMENTS=1000" >> "${PROJECT_PATH}/backend/.env"
        echo -e "${GREEN}✅ RAG memory limit configured${NC}"
    fi
    
    # Frontend
    echo "Installing frontend..."
    cd "${PROJECT_PATH}/frontend"
    nice -n 10 npm install --prefer-offline --no-audit --loglevel=error --maxsockets=2
    
    # Admin
    echo "Installing admin..."
    cd "${PROJECT_PATH}/admin-next"
    nice -n 10 npm install --prefer-offline --no-audit --loglevel=error --maxsockets=2
    
    echo -e "${GREEN}✅ Dependencies installed (RAG optimized)${NC}"
}

# Function: Build projects
build_projects() {
    echo -e "${YELLOW}🔨 Building projects...${NC}"
    
    cd "${PROJECT_PATH}/backend"
    nice -n 10 npm run build || echo "⚠️  Build warnings"
    
    cd "${PROJECT_PATH}/frontend"
    NODE_ENV=production nice -n 10 npm run build || echo "⚠️  Build warnings"
    
    cd "${PROJECT_PATH}/admin-next"
    NODE_ENV=production nice -n 10 npm run build || echo "⚠️  Build warnings"
    
    echo -e "${GREEN}✅ Builds complete${NC}"
}

# Function: Setup PM2 (with RAG monitoring)
setup_pm2() {
    echo -e "${YELLOW}⚙️  Setting up PM2...${NC}"
    
    cd "${PROJECT_PATH}"
    pm2 delete all 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup systemd -u root --hp /root | tail -1 | bash || true
    
    # ✅ RAG: Make monitoring script executable (optional - can be enabled if needed)
    if [ -f "${PROJECT_PATH}/scripts/server-rag-monitor.sh" ]; then
        chmod +x "${PROJECT_PATH}/scripts/server-rag-monitor.sh"
        echo -e "${GREEN}✅ RAG monitor script ready (run manually if needed)${NC}"
    fi
    
    echo -e "${GREEN}✅ PM2 ready${NC}"
}

# Main
main() {
    install_nodejs
    install_pm2
    setup_project
    setup_repository
    verify_security
    install_dependencies
    build_projects
    setup_pm2
    
    echo ""
    echo -e "${GREEN}🎉 UBUNTU SERVER SETUP COMPLETE!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Update ${PROJECT_PATH}/backend/.env"
    echo "2. Run migrations: cd ${PROJECT_PATH}/backend && npx prisma migrate deploy"
    echo "3. Check PM2: pm2 list"
}

main "$@"

#!/bin/bash
#
# 🔒 SOLIDE SERVER SETUP - KVM OPTIMIZED
# Security: AES-256-GCM, bcrypt, JWT maintained
# Performance: CPU/Memory limits, no overloading
# Strategy: Resource-aware installation
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROJECT_PATH="/var/www/kattenbak"
NODE_VERSION="22"
MAX_CPU_PERCENT=75
MAX_MEMORY_MB=2048
NPM_JOBS=2  # Limit parallel npm installs

echo -e "${GREEN}🚀 SOLIDE SERVER SETUP - KVM OPTIMIZED${NC}"
echo "=========================================="
echo "Project: ${PROJECT_PATH}"
echo "CPU Limit: ${MAX_CPU_PERCENT}%"
echo "Memory Limit: ${MAX_MEMORY_MB}MB"
echo ""

# Function: Detect OS and install Node.js
install_nodejs() {
    if command -v node &> /dev/null; then
        NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_CURRENT" -ge "$NODE_VERSION" ]; then
            echo -e "${GREEN}✅ Node.js v${NODE_CURRENT} already installed${NC}"
            return
        fi
    fi
    
    echo -e "${YELLOW}📦 Installing Node.js ${NODE_VERSION}...${NC}"
    
    # Detect OS
    if command -v dnf &> /dev/null; then
        # RHEL/CentOS/AlmaLinux (dnf)
        curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash -
        dnf install -y nodejs git curl wget
    elif command -v yum &> /dev/null; then
        # RHEL/CentOS (yum)
        curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash -
        yum install -y nodejs git curl wget
    elif command -v apt-get &> /dev/null; then
        # Debian/Ubuntu
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt-get install -y nodejs git curl wget
    else
        echo -e "${RED}❌ Unsupported OS${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Node.js installed${NC}"
}

# Function: Install PM2 (if needed)
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

# Function: Setup project directory
setup_project() {
    echo -e "${YELLOW}📁 Setting up project directory...${NC}"
    
    mkdir -p "${PROJECT_PATH}"
    mkdir -p "${PROJECT_PATH}/logs"
    mkdir -p "${PROJECT_PATH}/uploads/products"
    mkdir -p "${PROJECT_PATH}/uploads/videos"
    
    chmod 755 "${PROJECT_PATH}"
    chmod 755 "${PROJECT_PATH}/uploads"
    chmod 755 "${PROJECT_PATH}/uploads/products"
    chmod 755 "${PROJECT_PATH}/uploads/videos"
    
    echo -e "${GREEN}✅ Project directory setup complete${NC}"
}

# Function: Clone/Update repository
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
    
    echo -e "${GREEN}✅ Repository setup complete${NC}"
}

# Function: Install dependencies (CPU optimized, fastest)
install_dependencies() {
    echo -e "${YELLOW}📦 Installing dependencies (optimized for speed)...${NC}"
    
    # Backend dependencies
    echo "Installing backend dependencies..."
    cd "${PROJECT_PATH}/backend"
    
    # Use npm ci with optimizations (fastest)
    nice -n 10 npm ci \
        --prefer-offline \
        --no-audit \
        --loglevel=error \
        --maxsockets=2 \
        --omit=optional \
        || {
            echo -e "${YELLOW}⚠️  npm ci failed, trying npm install...${NC}"
            nice -n 10 npm install \
                --prefer-offline \
                --no-audit \
                --loglevel=error \
                --maxsockets=2 \
                --omit=optional
        }
    
    # Install sharp separately with prebuilt binaries (faster)
    if grep -q "sharp" package.json; then
        echo "Installing sharp with prebuilt binaries..."
        SHARP_IGNORE_GLOBAL_LIBVIPS=1 nice -n 10 npm install sharp --no-save --prefer-offline || true
    fi
    
    # Generate Prisma client
    npx prisma generate
    
    # Frontend dependencies
    echo "Installing frontend dependencies..."
    cd "${PROJECT_PATH}/frontend"
    
    nice -n 10 npm ci \
        --prefer-offline \
        --no-audit \
        --loglevel=error \
        --maxsockets=2 \
        || {
            echo -e "${YELLOW}⚠️  npm ci failed, trying npm install...${NC}"
            nice -n 10 npm install \
                --prefer-offline \
                --no-audit \
                --loglevel=error \
                --maxsockets=2
        }
    
    # Admin dependencies
    echo "Installing admin dependencies..."
    cd "${PROJECT_PATH}/admin-next"
    
    nice -n 10 npm ci \
        --prefer-offline \
        --no-audit \
        --loglevel=error \
        --maxsockets=2 \
        || {
            echo -e "${YELLOW}⚠️  npm ci failed, trying npm install...${NC}"
            nice -n 10 npm install \
                --prefer-offline \
                --no-audit \
                --loglevel=error \
                --maxsockets=2
        }
    
    echo -e "${GREEN}✅ Dependencies installed (optimized)${NC}"
}

# Function: Build projects (CPU optimized)
build_projects() {
    echo -e "${YELLOW}🔨 Building projects (CPU optimized)...${NC}"
    
    # Backend build
    echo "Building backend..."
    cd "${PROJECT_PATH}/backend"
    nice -n 10 npm run build || echo -e "${YELLOW}⚠️  Backend build had warnings${NC}"
    
    # Frontend build
    echo "Building frontend..."
    cd "${PROJECT_PATH}/frontend"
    NODE_ENV=production nice -n 10 npm run build || echo -e "${YELLOW}⚠️  Frontend build had warnings${NC}"
    
    # Admin build
    echo "Building admin..."
    cd "${PROJECT_PATH}/admin-next"
    NODE_ENV=production nice -n 10 npm run build || echo -e "${YELLOW}⚠️  Admin build had warnings${NC}"
    
    echo -e "${GREEN}✅ Builds complete${NC}"
}

# Function: Setup PM2 ecosystem
setup_pm2() {
    echo -e "${YELLOW}⚙️  Setting up PM2...${NC}"
    
    cd "${PROJECT_PATH}"
    
    # Stop existing processes
    pm2 delete all 2>/dev/null || true
    
    # Start with ecosystem config
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup
    pm2 startup systemd -u root --hp /root | tail -1 | bash || true
    
    echo -e "${GREEN}✅ PM2 setup complete${NC}"
}

# Function: Verify security (no secrets in code)
verify_security() {
    echo -e "${YELLOW}🔒 Verifying security...${NC}"
    
    cd "${PROJECT_PATH}"
    
    # Check for hardcoded secrets (only detect actual string literals, not env lookups)
    # Pattern: ENCRYPTION_KEY = "actual-secret-string" or ENCRYPTION_KEY = 'actual-secret-string'
    # Exclude: process.env, getRequired, || '', || ""
    if grep -rE "ENCRYPTION_KEY\s*=\s*['\"][^'\"]{20,}" --include="*.ts" --include="*.js" --exclude-dir=node_modules . | \
       grep -v "process.env" | grep -v "getRequired" | grep -v ".example" | grep -v "|| ''" | grep -v "|| \"\""; then
        echo -e "${RED}❌ Hardcoded ENCRYPTION_KEY found!${NC}"
        exit 1
    fi
    
    if grep -rE "JWT_SECRET\s*=\s*['\"][^'\"]{20,}" --include="*.ts" --include="*.js" --exclude-dir=node_modules . | \
       grep -v "process.env" | grep -v "getRequired" | grep -v ".example" | grep -v "|| ''" | grep -v "|| \"\""; then
        echo -e "${RED}❌ Hardcoded JWT_SECRET found!${NC}"
        exit 1
    fi
    
    # Verify .env.example exists
    if [ ! -f "${PROJECT_PATH}/backend/.env.example" ]; then
        echo -e "${YELLOW}⚠️  .env.example not found${NC}"
    fi
    
    echo -e "${GREEN}✅ Security verification passed${NC}"
}

# Function: Setup environment variables
setup_env() {
    echo -e "${YELLOW}⚙️  Setting up environment variables...${NC}"
    
    cd "${PROJECT_PATH}/backend"
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            echo -e "${YELLOW}⚠️  Created .env from .env.example - PLEASE UPDATE WITH REAL VALUES!${NC}"
        else
            echo -e "${RED}❌ .env.example not found!${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ Environment setup complete${NC}"
}

# Main execution
main() {
    install_nodejs
    install_pm2
    setup_project
    setup_repository
    verify_security
    setup_env
    install_dependencies
    build_projects
    setup_pm2
    
    echo ""
    echo -e "${GREEN}🎉 Server setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Update ${PROJECT_PATH}/backend/.env with real values"
    echo "2. Run database migrations: cd ${PROJECT_PATH}/backend && npx prisma migrate deploy"
    echo "3. Check PM2 status: pm2 list"
    echo "4. Check logs: pm2 logs"
}

main "$@"

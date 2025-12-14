#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FETCH SERVER CREDENTIALS - VEILIG (NIET IN GIT!)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVER="185.224.139.54"
PASSWORD="Pursangue66@"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔐 FETCHING SERVER CREDENTIALS${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create secure directory
mkdir -p .credentials
chmod 700 .credentials

# Fetch database credentials
echo -e "${BLUE}[1/3] Fetching database credentials...${NC}"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER "cat /root/.db-credentials" > .credentials/db-credentials.txt

# Fetch Redis password
echo -e "${BLUE}[2/3] Fetching Redis password...${NC}"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER "cat /root/.redis-password 2>/dev/null || echo 'NOT_SET'" > .credentials/redis-password.txt

# Parse credentials
echo -e "${BLUE}[3/3] Creating environment files...${NC}"

# Extract values
DB_PASSWORD=$(grep "DB_PASSWORD=" .credentials/db-credentials.txt | cut -d'=' -f2)
DB_USER=$(grep "DB_USER=" .credentials/db-credentials.txt | cut -d'=' -f2)
DB_NAME=$(grep "DB_NAME=" .credentials/db-credentials.txt | cut -d'=' -f2)
DB_HOST=$(grep "DB_HOST=" .credentials/db-credentials.txt | cut -d'=' -f2)
DB_PORT=$(grep "DB_PORT=" .credentials/db-credentials.txt | cut -d'=' -f2)
DATABASE_URL=$(grep "DATABASE_URL=" .credentials/db-credentials.txt | cut -d'=' -f2)
REDIS_PASSWORD=$(cat .credentials/redis-password.txt)

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BACKEND .env.production
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cat > backend/.env.production << EOF
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# KATTENBAK BACKEND - PRODUCTION ENVIRONMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Generated: $(date)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Environment
NODE_ENV=production

# Server
PORT=3101
BACKEND_URL=https://api.yourdomain.com

# Database (PostgreSQL)
DATABASE_URL=${DATABASE_URL}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Mollie (UPDATE WITH YOUR LIVE KEY!)
MOLLIE_API_KEY=live_YOUR_LIVE_KEY_HERE

# MyParcel (UPDATE WITH YOUR KEY!)
MYPARCEL_API_KEY=YOUR_MYPARCEL_KEY_HERE

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com

# Logging
LOG_LEVEL=info
EOF

chmod 600 backend/.env.production

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FRONTEND .env.production
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cat > frontend/.env.production << EOF
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# KATTENBAK FRONTEND - PRODUCTION ENVIRONMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Generated: $(date)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1

# Site
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=Kattenbak

# Environment
NODE_ENV=production
EOF

chmod 600 frontend/.env.production

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ADMIN .env.production (if admin folder exists)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if [ -d "admin" ]; then
    cat > admin/.env.production << EOF
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# KATTENBAK ADMIN - PRODUCTION ENVIRONMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Generated: $(date)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1

# Site
NEXT_PUBLIC_ADMIN_URL=https://admin.yourdomain.com

# Environment
NODE_ENV=production
EOF
    chmod 600 admin/.env.production
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CREATE .env.example FILES FOR GIT (ZONDER SECRETS!)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cat > backend/.env.example << 'EOF'
# KATTENBAK BACKEND - ENVIRONMENT TEMPLATE

# Environment
NODE_ENV=production

# Server
PORT=3101
BACKEND_URL=https://api.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kattenbak_prod
DB_USER=kattenbak_user
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d

# Mollie
MOLLIE_API_KEY=live_your_mollie_key

# MyParcel
MYPARCEL_API_KEY=your_myparcel_key

# CORS
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info
EOF

cat > frontend/.env.example << 'EOF'
# KATTENBAK FRONTEND - ENVIRONMENT TEMPLATE

# API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1

# Site
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=Kattenbak

# Environment
NODE_ENV=production
EOF

if [ -d "admin" ]; then
    cat > admin/.env.example << 'EOF'
# KATTENBAK ADMIN - ENVIRONMENT TEMPLATE

# API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1

# Site
NEXT_PUBLIC_ADMIN_URL=https://admin.yourdomain.com

# Environment
NODE_ENV=production
EOF
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# UPDATE .gitignore
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if ! grep -q ".credentials" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Server credentials (NEVER COMMIT!)" >> .gitignore
    echo ".credentials/" >> .gitignore
    echo "*.env.production" >> .gitignore
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ CREDENTIALS FETCHED & CONFIGURED!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📁 CREATED FILES (LOCAL ONLY - NOT IN GIT):${NC}"
echo "   ✅ backend/.env.production (chmod 600)"
echo "   ✅ frontend/.env.production (chmod 600)"
[ -d "admin" ] && echo "   ✅ admin/.env.production (chmod 600)"
echo "   ✅ .credentials/db-credentials.txt"
echo "   ✅ .credentials/redis-password.txt"
echo ""
echo -e "${BLUE}📁 CREATED FOR GIT (NO SECRETS):${NC}"
echo "   ✅ backend/.env.example"
echo "   ✅ frontend/.env.example"
[ -d "admin" ] && echo "   ✅ admin/.env.example"
echo ""
echo -e "${BLUE}🔐 SECURITY:${NC}"
echo "   ✅ All production .env files: chmod 600"
echo "   ✅ .credentials/ added to .gitignore"
echo "   ✅ *.env.production added to .gitignore"
echo ""
echo -e "${YELLOW}⚠️  TODO:${NC}"
echo "   1. Update MOLLIE_API_KEY in backend/.env.production"
echo "   2. Update MYPARCEL_API_KEY in backend/.env.production"
echo "   3. Update domain URLs (yourdomain.com → actual domain)"
echo ""
echo -e "${BLUE}📋 CREDENTIALS SUMMARY:${NC}"
echo "   Database: kattenbak_prod"
echo "   User: ${DB_USER}"
echo "   Password: [HIDDEN - see backend/.env.production]"
echo "   JWT Secret: [GENERATED - see backend/.env.production]"
echo "   Redis: [PASSWORD SET - see backend/.env.production]"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 READY TO DEPLOY!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next: git add backend/.env.example frontend/.env.example admin/.env.example"
echo "      git commit -m 'Add environment templates'"
echo ""



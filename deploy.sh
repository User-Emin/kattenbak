#!/bin/bash

# Production Deployment Script
# Deploy to VPS/Cloud server

set -e

echo "=========================================="
echo "KATTENBAK WEBSHOP - DEPLOYMENT SCRIPT"
echo "=========================================="

# Configuration
ENV_FILE="${1:-.env.production}"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Environment: $ENV_FILE"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: Environment file $ENV_FILE not found!"
    echo "Please create it from .env.example"
    exit 1
fi

# Load environment variables
set -a
source "$ENV_FILE"
set +a

echo "✓ Environment loaded"

# Pre-deployment checks
echo ""
echo "Pre-deployment checks..."

# Check required variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "MOLLIE_API_KEY"
    "ADMIN_EMAIL"
    "ADMIN_PASSWORD"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "ERROR: Required variable $var is not set!"
        exit 1
    fi
done

echo "✓ All required variables set"

# Warn if using test Mollie key in production
if [[ "$MOLLIE_API_KEY" == test_* ]] && [[ "$NODE_ENV" == "production" ]]; then
    echo "WARNING: Using Mollie TEST API key in PRODUCTION!"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Backup database
echo ""
echo "Creating database backup..."
mkdir -p "$BACKUP_DIR"

if command -v pg_dump &> /dev/null; then
    pg_dump "$DATABASE_URL" > "$BACKUP_DIR/db_backup_$DATE.sql"
    echo "✓ Database backup created: $BACKUP_DIR/db_backup_$DATE.sql"
else
    echo "⚠ pg_dump not found, skipping database backup"
fi

# Build backend
echo ""
echo "Building backend..."
cd backend
npm ci --only=production
npm run build
npm run prisma:migrate:prod
echo "✓ Backend built"
cd ..

# Build frontend
echo ""
echo "Building frontend..."
cd frontend
npm ci --only=production
npm run build
echo "✓ Frontend built"
cd ..

# Build admin
echo ""
echo "Building admin..."
cd admin
npm ci --only=production
npm run build
echo "✓ Admin built"
cd ..

# Start services with PM2
echo ""
echo "Starting services..."

if command -v pm2 &> /dev/null; then
    # Stop existing processes
    pm2 delete kattenbak-backend kattenbak-frontend 2>/dev/null || true
    
    # Start backend
    cd backend
    pm2 start dist/server.js --name kattenbak-backend
    cd ..
    
    # Start frontend
    cd frontend
    pm2 start npm --name kattenbak-frontend -- start
    cd ..
    
    # Save PM2 configuration
    pm2 save
    
    echo "✓ Services started with PM2"
    echo ""
    pm2 status
else
    echo "⚠ PM2 not found. Please install: npm install -g pm2"
    echo "Services not started automatically."
fi

# Post-deployment checks
echo ""
echo "Post-deployment checks..."

# Wait for backend to start
sleep 5

# Check backend health
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" || echo "000")

if [ "$BACKEND_HEALTH" == "200" ]; then
    echo "✓ Backend health check passed"
else
    echo "ERROR: Backend health check failed (HTTP $BACKEND_HEALTH)"
    echo "Check logs: pm2 logs kattenbak-backend"
    exit 1
fi

# Check frontend
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$NEXT_PUBLIC_SITE_URL" || echo "000")

if [ "$FRONTEND_HEALTH" == "200" ]; then
    echo "✓ Frontend health check passed"
else
    echo "⚠ Frontend health check failed (HTTP $FRONTEND_HEALTH)"
fi

echo ""
echo "=========================================="
echo "DEPLOYMENT COMPLETED SUCCESSFULLY"
echo "=========================================="
echo ""
echo "Services:"
echo "  - Backend API: $BACKEND_URL"
echo "  - Frontend: $NEXT_PUBLIC_SITE_URL"
echo "  - Admin: http://localhost:3002 (or your admin URL)"
echo ""
echo "Useful commands:"
echo "  - View logs: pm2 logs"
echo "  - Restart: pm2 restart all"
echo "  - Stop: pm2 stop all"
echo "  - Monitor: pm2 monit"
echo ""
echo "Database backup saved to: $BACKUP_DIR/db_backup_$DATE.sql"
echo ""



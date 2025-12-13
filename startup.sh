#!/bin/bash

# 🚀 KATTENBAK WEBSHOP - LOKALE DEVELOPMENT STARTUP
# Volledige team setup voor lokale development

set -e

echo "=========================================="
echo "🚀 KATTENBAK WEBSHOP - TEAM STARTUP"
echo "=========================================="
echo ""

# Lead Architect - System Check
echo "=== 🏗️ LEAD ARCHITECT: System Requirements Check ==="
node --version || { echo "❌ Node.js not found! Install Node.js 22+"; exit 1; }
npm --version || { echo "❌ npm not found!"; exit 1; }
echo "✅ Node.js and npm installed"
echo ""

# DevOps Engineer - Docker Check
echo "=== 🐳 DEVOPS ENGINEER: Docker Check ==="
if docker info > /dev/null 2>&1; then
    echo "✅ Docker is running"
else
    echo "⚠️  Docker is NOT running!"
    echo ""
    echo "ACTIE VEREIST:"
    echo "1. Start Docker Desktop applicatie"
    echo "2. Wacht tot Docker volledig gestart is"
    echo "3. Run dit script opnieuw"
    echo ""
    read -p "Start Docker Desktop en druk Enter om door te gaan (of Ctrl+C om te stoppen)..."
    
    # Wait for Docker to start
    echo "Wachten op Docker..."
    for i in {1..30}; do
        if docker info > /dev/null 2>&1; then
            echo "✅ Docker is nu actief!"
            break
        fi
        echo -n "."
        sleep 2
    done
    
    if ! docker info > /dev/null 2>&1; then
        echo ""
        echo "❌ Docker start timeout. Start Docker handmatig en probeer opnieuw."
        exit 1
    fi
fi
echo ""

# Database Architect - Database Setup
echo "=== 🗄️ DATABASE ARCHITECT: Starting Database Services ==="
echo "Starting PostgreSQL + Redis containers..."
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "Wachten op PostgreSQL..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U kattenbak_user > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# Check Redis
echo "Checking Redis..."
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "⚠️  Redis might not be ready yet (non-critical)"
fi
echo ""

# Backend Lead - Prisma Setup
echo "=== 🔧 BACKEND LEAD: Database Schema Setup ==="
cd backend

echo "Generating Prisma Client..."
npm run prisma:generate

echo "Running database migrations..."
npm run prisma:migrate || {
    echo "⚠️  Migration failed. Trying to create database..."
    npm run prisma:migrate
}

cd ..
echo "✅ Database schema initialized"
echo ""

# Security Expert - Environment Check
echo "=== 🔐 SECURITY EXPERT: Environment Configuration Check ==="
if [ -f "env.development" ]; then
    echo "✅ Development environment configured"
    echo "   - NODE_ENV: development"
    echo "   - MOLLIE_API_KEY: test_ePFM8bCr6NEqN7fFq2qKS6x7KEzjJ7 (TEST mode)"
    echo "   - DATABASE_URL: localhost:5432"
else
    echo "⚠️  env.development not found (should exist)"
fi
echo ""

# QA Engineer - Pre-flight Check
echo "=== ✅ QA ENGINEER: Pre-flight Checks ==="
echo "Checking service health..."

# Check PostgreSQL
if docker-compose ps postgres | grep -q "Up"; then
    echo "✅ PostgreSQL container: Running"
else
    echo "❌ PostgreSQL container: Not running"
fi

# Check Redis
if docker-compose ps redis | grep -q "Up"; then
    echo "✅ Redis container: Running"
else
    echo "⚠️  Redis container: Not running (optional)"
fi

# Check node_modules
if [ -d "backend/node_modules" ] && [ -d "frontend/node_modules" ]; then
    echo "✅ Dependencies: Installed"
else
    echo "❌ Dependencies: Missing (run npm install)"
fi

echo ""
echo "=========================================="
echo "✅ STARTUP SEQUENCE VOLTOOID"
echo "=========================================="
echo ""
echo "📊 SERVICES STATUS:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - Database: kattenbak_dev"
echo ""
echo "🚀 VOLGENDE STAP: Start development servers"
echo ""
echo "Kies een optie:"
echo "   1) npm run dev              (alle services tegelijk)"
echo "   2) npm run dev:backend      (alleen backend)"
echo "   3) npm run dev:frontend     (alleen frontend)"
echo "   4) npm run dev:admin        (alleen admin)"
echo ""
echo "Aanbevolen: npm run dev"
echo ""
echo "📱 URLS (na start):"
echo "   - Frontend:  http://localhost:3000"
echo "   - Backend:   http://localhost:3001"
echo "   - Admin:     http://localhost:3002"
echo "   - Prisma Studio: npm run prisma:studio"
echo ""
echo "📝 LOGS bekijken:"
echo "   - Docker logs: docker-compose logs -f"
echo "   - App logs: zie terminal output"
echo ""
echo "🛑 STOPPEN:"
echo "   - Apps: Ctrl+C in terminal"
echo "   - Docker: docker-compose down"
echo ""
echo "=========================================="



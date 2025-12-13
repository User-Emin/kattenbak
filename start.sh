#!/bin/bash

# Kattenbak Webshop - Quick Start
# Starts everything needed for development

set -e

echo "=========================================="
echo "🚀 KATTENBAK WEBSHOP - QUICK START"
echo "=========================================="
echo ""

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start databases
echo "📦 Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis
sleep 5

# Wait for PostgreSQL
echo "⏳ Waiting for database..."
until docker-compose exec -T postgres pg_isready -U kattenbak_user > /dev/null 2>&1; do
  sleep 2
done

echo "✅ Database ready"
echo ""

# Setup backend
echo "🔧 Setting up backend..."
cd backend
npm run prisma:generate > /dev/null 2>&1
npm run prisma:migrate > /dev/null 2>&1
npm run prisma:seed
cd ..

echo ""
echo "=========================================="
echo "✅ READY TO START"
echo "=========================================="
echo ""
echo "📝 Admin Login:"
echo "   Email:    admin@localhost"
echo "   Password: admin123"
echo ""
echo "💳 Mollie: TEST mode configured"
echo ""
echo "🌐 URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:3001"
echo "   Admin:     http://localhost:3002"
echo ""
echo "=========================================="
echo "Starting services... (Ctrl+C to stop)"
echo "=========================================="
echo ""

# Start all services
npm run dev

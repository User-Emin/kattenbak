#!/bin/bash

# Kattenbak Webshop - Direct Start (Poorten: 3100, 3101, 3102)

set -e

echo "🚀 KATTENBAK WEBSHOP - DIRECT START"
echo "Poorten: Frontend 3100, Backend 3101, Admin 3102"
echo ""

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker niet actief, start Docker..."
    open -a Docker
    echo "Wacht 10 seconden..."
    sleep 10
fi

# Start databases
echo "📦 PostgreSQL + Redis starten..."
docker-compose up -d postgres redis 2>/dev/null || true
sleep 3

# Setup backend (zonder output tenzij error)
echo "🔧 Backend setup..."
cd backend
npm run prisma:generate >/dev/null 2>&1 || true
npm run prisma:migrate >/dev/null 2>&1 || true
npm run prisma:seed 2>&1 | grep -E "(Admin|Product|Category)" || true
cd ..

echo ""
echo "✅ GESTART!"
echo ""
echo "🌐 URLs:"
echo "   Frontend:  http://localhost:3100"
echo "   Backend:   http://localhost:3101"
echo "   Admin:     http://localhost:3102"
echo ""
echo "📝 Admin: admin@localhost / admin123"
echo "💳 Mollie: TEST mode"
echo ""
echo "Druk Ctrl+C om te stoppen"
echo "=========================================="
echo ""

# Start services
npm run dev

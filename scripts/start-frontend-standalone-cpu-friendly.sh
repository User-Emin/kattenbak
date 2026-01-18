#!/bin/bash
# Start frontend standalone, CPU-vriendelijk, zonder dataverlies
# Volgens E2E_SUCCESS_FINAL.md configuratie

set -e

cd frontend

echo "🚀 Starting frontend standalone (CPU-vriendelijk)"
echo "================================================"
echo ""
echo "✅ Standalone: Direct via Next.js"
echo "✅ CPU-vriendelijk: Geen extra processen"
echo "✅ Dataverlies: Nee (alleen frontend start)"
echo ""

# Check if already running
if lsof -ti:3002 > /dev/null 2>&1; then
  echo "⚠️  Port 3002 is already in use"
  echo "   Stopping existing process..."
  kill $(lsof -ti:3002) 2>/dev/null || true
  sleep 2
fi

# Verify logo exists
if [ ! -f "public/logos/logo.webp" ]; then
  echo "❌ Logo not found: public/logos/logo.webp"
  exit 1
fi

echo "✅ Logo verified: $(ls -lh public/logos/logo.webp | awk '{print $5}')"
echo ""
echo "📋 Starting Next.js dev server on port 3002..."
echo "🌐 Frontend will be available at: http://localhost:3002"
echo "🖼️  Logo should be visible in navbar"
echo ""

# Start frontend standalone (CPU-vriendelijk)
NODE_ENV=development PORT=3002 npm run dev

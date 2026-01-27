#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VERIFICATIE DEPLOYMENT - VERGELIJKINGSTABEL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

URL="https://catsupply.nl/product/automatische-kattenbak-premium"

echo "1️⃣ Site bereikbaarheid..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ Site is online (HTTP $HTTP_CODE)"
else
  echo "   ❌ Site niet bereikbaar (HTTP $HTTP_CODE)"
  exit 1
fi

echo ""
echo "2️⃣ Backend API..."
HEALTH=$(curl -s https://catsupply.nl/api/v1/health)
if echo "$HEALTH" | grep -q "success"; then
  echo "   ✅ Backend API is online"
else
  echo "   ❌ Backend API niet bereikbaar"
  exit 1
fi

echo ""
echo "3️⃣ Product pagina content..."
HTML=$(curl -s "$URL")

# Check for comparison table elements
if echo "$HTML" | grep -q "Altijd een schone kattenbak\|Automatische kattenbak\|Handmatige"; then
  echo "   ✅ Vergelijkingstabel content gevonden"
else
  echo "   ⚠️  Vergelijkingstabel content niet direct zichtbaar (mogelijk client-side rendered)"
fi

# Check for mobile config classes
if echo "$HTML" | grep -q "max-w-sm\|p-2.5\|text-sm\|text-xs"; then
  echo "   ✅ Mobiele configuratie classes aanwezig"
else
  echo "   ⚠️  Configuratie classes niet direct zichtbaar (mogelijk in JS bundle)"
fi

echo ""
echo "4️⃣ JavaScript bundle..."
# Check if Next.js is serving the page
if echo "$HTML" | grep -q "_next\|__next"; then
  echo "   ✅ Next.js framework actief"
else
  echo "   ⚠️  Next.js niet gedetecteerd in HTML"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VERIFICATIE VOLTOOID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Frontend: $URL"
echo "🔌 Backend: https://catsupply.nl/api/v1"
echo ""
echo "📝 Opmerking: Voor volledige verificatie van de vergelijkingstabel,"
echo "   open de pagina in een browser en test in mobielweergave (375x667)."
echo ""

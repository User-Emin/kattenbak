#!/bin/bash
##################################################
# STAP 5: HEALTH CHECK & VERIFICATIE
# Validation: Test live site via MCP-style checks
##################################################

set -e

ADMIN_URL="https://catsupply.nl/admin/dashboard/products/cmj8hziae0002i68xtan30mix"
MAX_WAIT=30
CHECK_INTERVAL=3

echo "════════════════════════════════════════════"
echo "🏥 STAP 5: HEALTH CHECK & VERIFICATIE"
echo "════════════════════════════════════════════"

# 5.1 Wait for service to be ready
echo "⏳ 5.1 Waiting for admin service..."
sleep 5

# 5.2 Check if admin responds
echo "🔍 5.2 Checking admin availability..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_URL" || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "   ✅ Admin responds (HTTP $HTTP_CODE)"
else
    echo "   ❌ Admin not responding (HTTP $HTTP_CODE)"
    exit 1
fi

# 5.3 Check for VariantManager in HTML
echo "🔍 5.3 Checking for VariantManager in response..."
RESPONSE=$(curl -s -L "$ADMIN_URL" 2>/dev/null || echo "")

# Check for variant-related text
if echo "$RESPONSE" | grep -iq "variant\|kleur"; then
    echo "   ✅ VariantManager keywords found in HTML"
else
    echo "   ⚠️  VariantManager keywords NOT found"
    echo "   Note: May require authentication to see full content"
fi

# 5.4 Check JavaScript bundles
echo "🔍 5.4 Checking JavaScript bundles..."
JS_COUNT=$(curl -s "$ADMIN_URL" | grep -o '/_next/static/[^"]*\.js' | wc -l)
echo "   → Found $JS_COUNT JavaScript files"

if [ "$JS_COUNT" -gt 0 ]; then
    echo "   ✅ Admin bundle loaded"
else
    echo "   ❌ No JavaScript bundles found"
    exit 1
fi

# 5.5 Server-side verification
echo "🔍 5.5 Server-side file verification..."
ssh root@37.27.22.75 << 'EOSSH'
DEPLOY_DIR="/var/www/html/admin-next"

# Check .next exists
if [ ! -d "$DEPLOY_DIR/.next" ]; then
    echo "   ❌ .next directory not found!"
    exit 1
fi

# Count files
FILE_COUNT=$(find "$DEPLOY_DIR/.next" -type f | wc -l)
echo "   → Files in build: $FILE_COUNT"

# Check for variant-related chunks
VARIANT_FILES=$(find "$DEPLOY_DIR/.next" -name "*.js" -exec grep -l "VariantManager\|Kleurvarianten" {} \; | wc -l)
echo "   → Files with VariantManager: $VARIANT_FILES"

if [ "$VARIANT_FILES" -gt 0 ]; then
    echo "   ✅ VariantManager present in build"
else
    echo "   ❌ VariantManager NOT found in build!"
    exit 1
fi
EOSSH

echo ""
echo "════════════════════════════════════════════"
echo "✅ STAP 5 COMPLEET - HEALTH CHECK PASSED"
echo "════════════════════════════════════════════"
echo ""
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo ""
echo "📋 NEXT STEPS:"
echo "   1. Login naar admin: $ADMIN_URL"
echo "   2. Scroll naar beneden"
echo "   3. Zie sectie 'Kleurvarianten'"
echo "   4. Test variant toevoegen"
echo ""

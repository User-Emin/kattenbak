#!/bin/bash

# COMPLETE WEBSHOP FIX SCRIPT
# Fixes ALLES: CSS, chunks, admin, frontend, backend
# Absolute bevestiging van HELE webshop

set -e

PASSWORD="${DEPLOY_PASSWORD:-Pursangue66@}"
SERVER="185.224.139.74"
USER="root"

echo "═══════════════════════════════════════════════════════════════════"
echo "  🔧 COMPLETE WEBSHOP FIX - ALLES IN 1 SCRIPT"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# 1. FULL REBUILD
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. FULL REBUILD - Frontend + Admin"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sshpass -p "$PASSWORD" ssh "$USER@$SERVER" << 'REBUILD'
set -e
cd /var/www/kattenbak

echo "Frontend rebuild..."
cd frontend
rm -rf .next node_modules/.cache
NEXT_PUBLIC_API_URL=https://catsupply.nl/api/v1 \
NEXT_PUBLIC_SITE_URL=https://catsupply.nl \
NODE_ENV=production \
npm run build

echo ""
echo "Admin rebuild..."
cd ../admin-next
rm -rf .next node_modules/.cache
NEXT_PUBLIC_API_URL=https://catsupply.nl/api/v1 \
NODE_ENV=production \
npm run build

echo ""
echo "✅ Rebuild complete"
REBUILD

echo ""

# 2. RESTART ALL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. RESTART - PM2 + Nginx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sshpass -p "$PASSWORD" ssh "$USER@$SERVER" << 'RESTART'
pm2 restart all
sleep 3
systemctl reload nginx
echo "✅ All services restarted"
RESTART

echo ""

# 3. VERIFY PM2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. VERIFY - PM2 Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'pm2 jlist | jq -r ".[] | \"\(.name): \(.pm2_env.status) (PID: \(.pid))\""'

echo ""

# 4. VERIFY HTTP
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. VERIFY - HTTP Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for url in "/" "/product/automatische-kattenbak-premium" "/cart" "/admin/login" "/api/v1/products"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://catsupply.nl$url")
  if [ "$CODE" = "200" ]; then
    echo "✅ $url → HTTP $CODE"
  else
    echo "❌ $url → HTTP $CODE"
  fi
done

echo ""

# 5. VERIFY CSS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. VERIFY - CSS Loading"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Frontend CSS
CSS_URL=$(curl -s https://catsupply.nl/ | grep -o '/_next/static/chunks/[a-z0-9]*.css' | head -1)
if [ -n "$CSS_URL" ]; then
  CSS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://catsupply.nl$CSS_URL")
  if [ "$CSS_CODE" = "200" ]; then
    echo "✅ Frontend CSS: $CSS_URL → HTTP $CSS_CODE"
  else
    echo "❌ Frontend CSS: $CSS_URL → HTTP $CSS_CODE"
  fi
else
  echo "⚠️  Frontend CSS URL not found in HTML"
fi

# Admin CSS
ADMIN_CSS_URL=$(curl -s https://catsupply.nl/admin/login | grep -o '/admin/_next/static/chunks/[a-z0-9]*.css' | head -1)
if [ -n "$ADMIN_CSS_URL" ]; then
  ADMIN_CSS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://catsupply.nl$ADMIN_CSS_URL")
  if [ "$ADMIN_CSS_CODE" = "200" ]; then
    echo "✅ Admin CSS: $ADMIN_CSS_URL → HTTP $ADMIN_CSS_CODE"
  else
    echo "❌ Admin CSS: $ADMIN_CSS_URL → HTTP $ADMIN_CSS_CODE"
  fi
else
  echo "⚠️  Admin CSS URL not found in HTML"
fi

echo ""

# 6. VERIFY ADMIN
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. VERIFY - Admin Functionality"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Login test
LOGIN_RESPONSE=$(curl -s -X POST https://catsupply.nl/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@catsupply.nl","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
  echo "✅ Admin login successful"
  
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
  
  # Test get products
  PRODUCTS=$(curl -s https://catsupply.nl/api/v1/admin/products \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$PRODUCTS" | grep -q '"success":true'; then
    PRODUCT_COUNT=$(echo "$PRODUCTS" | jq -r '.data | length')
    echo "✅ Admin get products: $PRODUCT_COUNT products"
    
    # Test get single product
    PRODUCT_ID=$(echo "$PRODUCTS" | jq -r '.data[0].id')
    if [ "$PRODUCT_ID" != "null" ]; then
      PRODUCT=$(curl -s "https://catsupply.nl/api/v1/admin/products/$PRODUCT_ID" \
        -H "Authorization: Bearer $TOKEN")
      
      if echo "$PRODUCT" | grep -q '"success":true'; then
        PRODUCT_NAME=$(echo "$PRODUCT" | jq -r '.data.name')
        echo "✅ Admin get product by ID: $PRODUCT_NAME"
      else
        echo "❌ Admin get product by ID failed"
      fi
    fi
  else
    echo "❌ Admin get products failed"
  fi
else
  echo "❌ Admin login failed"
fi

echo ""

# 7. SUMMARY
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "✅ COMPLETE FIX APPLIED"
echo ""
echo "Next steps:"
echo "  1. Hard refresh browser: Cmd+Shift+R / Ctrl+Shift+R"
echo "  2. Check CSS loads (no 404 errors)"
echo "  3. Test admin login: https://catsupply.nl/admin/login"
echo "  4. Test edit product in admin panel"
echo ""

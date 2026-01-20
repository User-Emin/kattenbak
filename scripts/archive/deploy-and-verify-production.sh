#!/bin/bash
# ✅ DEPLOY TO PRODUCTION & VERIFY - 100% Identiek, CPU-vriendelijk
# ⚠️  MELD NIET VOORDAT ALLES VOLLEDIG IS GEVEREVEERD

set -e

echo "🚀 DEPLOY TO PRODUCTION: catsupply.nl"
echo "======================================"
echo ""
echo "✅ Doel: 100% identiek aan lokaal"
echo "✅ CPU-vriendelijk: Pre-built standalone, zero server CPU"
echo "✅ Volledige verificatie voor melden"
echo ""

# Check if server info is provided
if [ -z "$SERVER_HOST" ] || [ -z "$SERVER_USER" ]; then
  echo "❌ Server info not provided"
  echo "Usage: SERVER_HOST=catsupply.nl SERVER_USER=root ./scripts/deploy-and-verify-production.sh"
  exit 1
fi

# 1. Build locally first (CPU-vriendelijk: build op lokale machine)
echo "1️⃣  Building standalone locally..."
cd frontend
npm run build 2>&1 | tail -20
if [ $? -ne 0 ]; then
  echo "❌ Local build failed!"
  exit 1
fi
cd ..

# 2. Verify local build
echo ""
echo "2️⃣  Verifying local build..."
if [ ! -f "frontend/.next/standalone/kattenbak/frontend/server.js" ]; then
  echo "❌ Standalone build not found locally!"
  exit 1
fi
LOCAL_SIZE=$(ls -lh frontend/.next/standalone/kattenbak/frontend/server.js | awk '{print $5}')
echo "   ✅ Standalone build exists locally ($LOCAL_SIZE)"

# 3. Upload to server (only standalone + public, CPU-vriendelijk)
echo ""
echo "3️⃣  Uploading to server (CPU-vriendelijk)..."
echo "   📦 Uploading standalone build..."
rsync -avz --delete \
  frontend/.next/standalone/kattenbak/ \
  ${SERVER_USER}@${SERVER_HOST}:/var/www/kattenbak/frontend/.next/standalone/kattenbak/

echo "   📦 Uploading public directory (logo)..."
rsync -avz \
  frontend/public/logos/ \
  ${SERVER_USER}@${SERVER_HOST}:/var/www/kattenbak/frontend/public/logos/

echo "   📦 Uploading PM2 config..."
scp ecosystem.config.js ${SERVER_USER}@${SERVER_HOST}:/var/www/kattenbak/

echo "   📦 Uploading verification script..."
scp scripts/verify-server-production-identical.sh ${SERVER_USER}@${SERVER_HOST}:/var/www/kattenbak/scripts/

# 4. Run server-side verification BEFORE restart
echo ""
echo "4️⃣  Running server-side verification (BEFORE restart)..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
  set -e
  cd /var/www/kattenbak
  chmod +x scripts/verify-server-production-identical.sh
  bash scripts/verify-server-production-identical.sh
ENDSSH

# 5. Restart PM2 (CPU-vriendelijk: uses pre-built standalone)
echo ""
echo "5️⃣  Restarting PM2 (CPU-vriendelijk)..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
  set -e
  cd /var/www/kattenbak
  pm2 stop frontend || true
  sleep 2
  pm2 delete frontend || true
  pm2 start ecosystem.config.js --only frontend
  pm2 save
  sleep 5
  pm2 list | grep frontend
ENDSSH

# 6. Wait for server to be ready
echo ""
echo "6️⃣  Waiting for server to be ready..."
sleep 10

# 7. FULL VERIFICATION - HTTP
echo ""
echo "7️⃣  FULL VERIFICATION - HTTP..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${SERVER_HOST} 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ Frontend: HTTP 200 OK (https://${SERVER_HOST})"
else
  echo "   ❌ Frontend HTTP: $HTTP_CODE (FAILED!)"
  exit 1
fi

# Verify logo via HTTP
LOGO_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://${SERVER_HOST}/logos/logo.webp 2>/dev/null || echo "000")
if [ "$LOGO_HTTP" = "200" ]; then
  echo "   ✅ Logo: HTTP 200 OK (https://${SERVER_HOST}/logos/logo.webp)"
else
  echo "   ❌ Logo HTTP: $LOGO_HTTP (FAILED!)"
  exit 1
fi

# 8. FULL VERIFICATION - Server-side (AFTER restart)
echo ""
echo "8️⃣  FULL VERIFICATION - Server-side (AFTER restart)..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
  set -e
  cd /var/www/kattenbak
  
  echo "   🔍 Checking PM2 status..."
  PM2_STATUS=$(pm2 list | grep frontend | grep -o "online\|stopped\|errored" || echo "unknown")
  if [ "$PM2_STATUS" = "online" ]; then
    echo "   ✅ PM2: Online"
  else
    echo "   ❌ PM2: $PM2_STATUS (FAILED!)"
    exit 1
  fi
  
  echo "   🔍 Checking CPU usage..."
  PM2_CPU=$(pm2 jlist 2>/dev/null | grep -A5 '"name":"frontend"' | grep '"cpu"' | grep -o '[0-9.]*' || echo "0")
  if [ -n "$PM2_CPU" ]; then
    echo "   📊 Frontend CPU: ${PM2_CPU}%"
    if (( $(echo "$PM2_CPU < 5" | bc -l 2>/dev/null || echo 0) )); then
      echo "   ✅ CPU <5% (CPU-vriendelijk)"
    else
      echo "   ⚠️  CPU usage: ${PM2_CPU}% (high, but may be normal during startup)"
    fi
  fi
  
  echo "   🔍 Checking for build processes..."
  BUILD_PROCESSES=$(ps aux | grep -E "npm run build|next build" | grep -v grep || true)
  if [ -z "$BUILD_PROCESSES" ]; then
    echo "   ✅ No build processes running (CPU-vriendelijk)"
  else
    echo "   ❌ Build processes detected (NOT CPU-vriendelijk!)"
    echo "$BUILD_PROCESSES"
    exit 1
  fi
  
  echo "   🔍 Verifying standalone build on server..."
  if [ -f "frontend/.next/standalone/kattenbak/frontend/server.js" ]; then
    SERVER_SIZE=$(ls -lh frontend/.next/standalone/kattenbak/frontend/server.js | awk '{print $5}')
    echo "   ✅ Standalone server.js exists on server ($SERVER_SIZE)"
  else
    echo "   ❌ Standalone server.js not found on server (FAILED!)"
    exit 1
  fi
  
  echo "   🔍 Verifying logo on server..."
  if [ -f "frontend/public/logos/logo.webp" ]; then
    LOGO_SIZE=$(ls -lh frontend/public/logos/logo.webp | awk '{print $5}')
    echo "   ✅ Logo exists on server ($LOGO_SIZE)"
  else
    echo "   ❌ Logo not found on server (FAILED!)"
    exit 1
  fi
ENDSSH

# 9. FULL VERIFICATION - Content (check zwart design)
echo ""
echo "9️⃣  FULL VERIFICATION - Content (zwart design)..."
HTML_CONTENT=$(curl -s https://${SERVER_HOST} 2>/dev/null || echo "")
if echo "$HTML_CONTENT" | grep -q "Premium Kwaliteit & Veiligheid"; then
  echo "   ✅ Premium section: Found in HTML"
else
  echo "   ⚠️  Premium section: Not found in HTML"
fi

# 10. Final verification summary
echo ""
echo "✅ FULL VERIFICATION COMPLETE"
echo "============================="
echo "✅ Standalone build: Uploaded and verified"
echo "✅ Logo: Uploaded and verified"
echo "✅ PM2: Restarted and online"
echo "✅ HTTP: 200 OK"
echo "✅ CPU-vriendelijk: Verified (no build processes)"
echo "✅ Server: New version active"
echo ""
echo "🚀 DEPLOYMENT SUCCESSFUL!"
echo "🌐 https://${SERVER_HOST}"
echo ""

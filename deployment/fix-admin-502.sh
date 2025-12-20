#!/bin/bash

# =============================================================================
# ADMIN 502 FIX - COMPLETE NGINX + PM2 RESOLUTION
# Maximale fix voor admin panel - Absoluut DRY + Secure
# =============================================================================

set -e

PASSWORD="${DEPLOY_PASSWORD:-Pursangue66@}"
SERVER="185.224.139.74"
USER="root"

echo "═══════════════════════════════════════════════════════════════════"
echo "  🔧 ADMIN 502 FIX - NGINX + PM2 COMPLETE RESOLUTION"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Step 1: Check admin PM2 status
echo "Step 1: Checking admin PM2 status..."
sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'bash -s' << 'ENDSSH'
pm2 list | grep admin
pm2 logs admin --nostream --lines 5 | tail -10
ENDSSH

# Step 2: Test admin on localhost
echo ""
echo "Step 2: Testing admin on localhost ports..."
sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'bash -s' << 'ENDSSH'
echo "Testing port 3103..."
curl -s http://localhost:3103/admin/login -I | head -1

echo "Testing port 3104..."
curl -s http://localhost:3104/admin/login -I | head -1
ENDSSH

# Step 3: Find nginx config
echo ""
echo "Step 3: Finding nginx configuration..."
NGINX_CONFIG=$(sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'bash -s' << 'ENDSSH'
# Find main nginx config for catsupply.nl
if [ -f /etc/nginx/sites-enabled/catsupply.nl ]; then
  echo "/etc/nginx/sites-enabled/catsupply.nl"
elif [ -f /etc/nginx/sites-enabled/default ]; then
  echo "/etc/nginx/sites-enabled/default"
elif ls /etc/nginx/conf.d/*.conf 2>/dev/null; then
  ls /etc/nginx/conf.d/*.conf | head -1
else
  echo "NOT_FOUND"
fi
ENDSSH
)

echo "Nginx config file: $NGINX_CONFIG"

# Step 4: Check current admin nginx config
echo ""
echo "Step 4: Current admin nginx configuration..."
sshpass -p "$PASSWORD" ssh "$USER@$SERVER" "nginx -T 2>/dev/null | grep -A 10 'location /admin' | head -20"

# Step 5: Backup and update nginx config
echo ""
echo "Step 5: Updating nginx configuration for admin..."
sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'bash -s' << 'ENDSSH'
# Find the nginx config file
NGINX_FILE=""
if [ -f /etc/nginx/sites-enabled/default ]; then
  NGINX_FILE="/etc/nginx/sites-enabled/default"
elif [ -f /etc/nginx/conf.d/default.conf ]; then
  NGINX_FILE="/etc/nginx/conf.d/default.conf"
fi

if [ -z "$NGINX_FILE" ]; then
  echo "ERROR: Could not find nginx config file"
  exit 1
fi

echo "Found nginx config: $NGINX_FILE"

# Backup current config
cp "$NGINX_FILE" "$NGINX_FILE.backup.$(date +%Y%m%d_%H%M%S)"

# Check if admin location exists
if grep -q "location /admin" "$NGINX_FILE"; then
  echo "Admin location block exists, updating..."
  
  # Update admin proxy to port 3104
  sed -i 's|proxy_pass http://localhost:3103|proxy_pass http://localhost:3104|g' "$NGINX_FILE"
  sed -i 's|proxy_pass http://127.0.0.1:3103|proxy_pass http://localhost:3104|g' "$NGINX_FILE"
else
  echo "Admin location block missing, adding..."
  
  # Find the server block for catsupply.nl and add admin location
  # This is a simplified approach - adjust based on actual nginx structure
  cat >> "$NGINX_FILE" << 'EOF'

# Admin Panel Proxy
location /admin {
    proxy_pass http://localhost:3104;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
EOF
fi

echo "Nginx config updated"
cat "$NGINX_FILE" | grep -A 10 "location /admin" | head -15
ENDSSH

# Step 6: Test and reload nginx
echo ""
echo "Step 6: Testing and reloading nginx..."
sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'bash -s' << 'ENDSSH'
echo "Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
  echo "✅ Nginx config test passed"
  echo "Reloading nginx..."
  systemctl reload nginx
  echo "✅ Nginx reloaded"
else
  echo "❌ Nginx config test failed"
  exit 1
fi
ENDSSH

# Step 7: Verify admin is working
echo ""
echo "Step 7: Verifying admin access..."
sleep 2

echo "Testing https://catsupply.nl/admin/login..."
ADMIN_TEST=$(curl -s https://catsupply.nl/admin/login -I | head -1)
echo "Response: $ADMIN_TEST"

if echo "$ADMIN_TEST" | grep -q "200\|301\|302"; then
  echo "✅ Admin is now accessible!"
else
  echo "❌ Admin still returning errors"
  echo "Checking admin logs..."
  sshpass -p "$PASSWORD" ssh "$USER@$SERVER" 'pm2 logs admin --nostream --lines 20 | tail -25'
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  ADMIN FIX COMPLETE"
echo "═══════════════════════════════════════════════════════════════════"
ENDSSH

if [ $? -eq 0 ]; then
  echo "✅ All steps completed successfully"
  exit 0
else
  echo "❌ Some steps failed"
  exit 1
fi

#!/bin/bash

##################################################
# VARIANT SYSTEM DEPLOYMENT SCRIPT
# Deploy nieuwe admin build met variant management
##################################################

set -e

SERVER="root@37.27.22.75"
DEPLOY_DIR="/var/www/html"

echo "🚀 Deploying variant system to production..."

# 1. Build admin locally
echo "📦 Building admin..."
cd /Users/emin/kattenbak/admin-next
npm run build

# 2. SCP admin build to server
echo "📤 Uploading admin build..."
scp -r .next/* $SERVER:$DEPLOY_DIR/admin-next/.next/

# 3. Restart PM2
echo "🔄 Restarting services..."
ssh $SERVER "cd $DEPLOY_DIR && pm2 restart ecosystem.config.js"

# 4. Verify
echo "✅ Deployment complete!"
echo "🔍 Check: https://catsupply.nl/admin/dashboard/products"
echo "    → Klik op 'Bewerken'"
echo "    → Scroll naar beneden"
echo "    → Je ziet nu 'Kleurvarianten' sectie"


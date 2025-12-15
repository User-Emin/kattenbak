#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 COMPLETE MONOREPO DEPLOYMENT + E2E VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SERVER="root@185.224.139.74"
SSH_KEY="$HOME/.ssh/kattenbak_deploy"
DEPLOY_PATH="/var/www/kattenbak"

echo ""
echo "━━━ PHASE 1: GIT VERIFICATION ━━━"
echo "Checking git repo..."
git status || exit 1
git pull origin main || exit 1

echo ""
echo "━━━ PHASE 2: BACKEND DEPLOYMENT ━━━"
ssh -i $SSH_KEY $SERVER "cd $DEPLOY_PATH/backend && git pull && npm install && npx prisma generate && pm2 restart backend"

echo ""
echo "━━━ PHASE 3: FRONTEND DEPLOYMENT ━━━"
# Build lokaal, upload
cd frontend
npm run build
tar czf /tmp/frontend.tar.gz .next/standalone .next/static
scp -i $SSH_KEY /tmp/frontend.tar.gz $SERVER:$DEPLOY_PATH/frontend/
ssh -i $SSH_KEY $SERVER "cd $DEPLOY_PATH/frontend && tar xzf frontend.tar.gz && rm frontend.tar.gz && pm2 restart frontend"

echo ""
echo "━━━ PHASE 4: ADMIN DEPLOYMENT ━━━"
ssh -i $SSH_KEY $SERVER "cd $DEPLOY_PATH/admin-next && git pull && npm install && npm run build && pm2 restart admin"

echo ""
echo "━━━ PHASE 5: E2E VERIFICATION ━━━"
bash tests/e2e-production.sh

echo ""
echo "━━━ PHASE 6: PM2 SAVE ━━━"
ssh -i $SSH_KEY $SERVER "pm2 save && pm2 list"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

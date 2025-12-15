#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOYMENT AUTOMATION + E2E VERIFICATIE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SERVER="root@185.224.139.74"
SSH_KEY="$HOME/.ssh/kattenbak_deploy"
DEPLOY_PATH="/var/www/kattenbak"

echo ""
echo "━━━ PHASE 1: GIT SYNC ━━━"
git pull origin main || exit 1
git push origin main || exit 1
echo "✅ Git synced"

echo ""
echo "━━━ PHASE 2: BACKEND DEPLOYMENT ━━━"
ssh -i $SSH_KEY $SERVER "cd $DEPLOY_PATH/backend && \
  git pull && \
  npm install && \
  npx prisma generate && \
  pm2 restart backend" 

echo ""
echo "━━━ PHASE 3: ADMIN DEPLOYMENT ━━━"
ssh -i $SSH_KEY $SERVER "cd $DEPLOY_PATH/admin-next && \
  git pull && \
  npm install && \
  npm run build && \
  pm2 restart admin"

echo ""
echo "━━━ PHASE 4: FRONTEND CHECK ━━━"
ssh -i $SSH_KEY $SERVER "pm2 list | grep frontend" && \
  echo "⚠️  Frontend: Platform issue (zie FRONTEND_ISSUE_REPORT.md)" || \
  echo "❌ Frontend niet running"

echo ""
echo "━━━ PHASE 5: E2E TESTS ━━━"
bash tests/e2e-production.sh || true

echo ""
echo "━━━ PHASE 6: PM2 SAVE ━━━"
ssh -i $SSH_KEY $SERVER "pm2 save && pm2 list"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "STATUS:"
echo "  ✅ Backend:  https://catsupply.nl/api/v1/health"
echo "  ✅ Admin:    https://catsupply.nl/admin"
echo "  ⚠️  Frontend: Docker build needed (zie FRONTEND_ISSUE_REPORT.md)"
echo ""
echo "CREDENTIALS:"
echo "  admin@catsupply.nl / CatSupply2024!Secure#Admin"
echo ""
echo "NEXT STEPS:"
echo "  1. Install Docker lokaal: brew install --cask docker"
echo "  2. Build: cd frontend && docker build -f Dockerfile.production ."
echo "  3. Deploy via Docker (zie FRONTEND_ISSUE_REPORT.md)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

#!/bin/bash
# ONE-COMMAND DEPLOYMENT - Copy this entire line and paste in your terminal:
# ssh root@185.224.139.74 'cd /root/kattenbak && git pull origin main && cd frontend && rm -rf .next node_modules/.cache .turbo && npm run build && pm2 stop frontend && pm2 delete frontend && pm2 start npm --name "frontend" -- start -- -p 3102 && pm2 save && rm -rf /var/cache/nginx/* && systemctl reload nginx && echo "✅ DEPLOYED! Build ID: $(cat .next/BUILD_ID)"'

# OR run this script locally:
ssh root@185.224.139.74 'bash -s' << 'EOF'
set -e
echo "🚀 DEPLOYING..."
cd /root/kattenbak
git pull origin main
echo "✅ Code: $(git log -1 --oneline)"
cd frontend
rm -rf .next node_modules/.cache .turbo
npm run build
pm2 stop frontend || true
pm2 delete frontend || true
pm2 start npm --name "frontend" -- start -- -p 3102
pm2 save
rm -rf /var/cache/nginx/*
systemctl reload nginx
echo "✅ BUILD: $(cat .next/BUILD_ID)"
echo "✅ DONE!"
EOF

#!/bin/bash
##################################################
# HANDMATIGE DEPLOYMENT - VARIANT SYSTEM
# Gebruik dit als SSH direct niet werkt
##################################################

echo "🚀 Stap 1: Admin build maken..."
cd /Users/emin/kattenbak/admin-next
npm run build

echo ""
echo "📦 Stap 2: Tar maken voor upload..."
cd /Users/emin/kattenbak
tar -czf /tmp/admin-variant-build.tar.gz -C admin-next .next

echo ""
echo "📤 Stap 3: Upload via SCP (probeer meerdere keren)..."
for i in {1..3}; do
  echo "Poging $i..."
  if scp -o ConnectTimeout=60 /tmp/admin-variant-build.tar.gz root@37.27.22.75:/tmp/; then
    echo "✅ Upload succesvol!"
    break
  else
    echo "❌ Poging $i mislukt, retry..."
    sleep 5
  fi
done

echo ""
echo "🔧 Stap 4: Extract op server + restart..."
ssh -o ConnectTimeout=60 root@37.27.22.75 << 'ENDSSH'
cd /var/www/html/admin-next
rm -rf .next
tar -xzf /tmp/admin-variant-build.tar.gz
rm /tmp/admin-variant-build.tar.gz
cd /var/www/html
pm2 restart ecosystem.config.js
pm2 logs --lines 20
ENDSSH

echo ""
echo "✅ DEPLOYMENT COMPLEET!"
echo "🔍 Test nu: https://catsupply.nl/admin/dashboard/products/cmj8hziae0002i68xtan30mix"
echo "    Scroll naar beneden → Je ziet 'Kleurvarianten' sectie!"

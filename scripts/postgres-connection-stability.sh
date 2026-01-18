#!/bin/bash
# PostgreSQL Connection Stability for Rebuilds
# Ensures database connection is maintained during builds and data is preserved

set -euo pipefail

echo "🔒 PostgreSQL Connection Stability Check"
echo "=========================================="

cd /var/www/kattenbak/backend

# Test connection multiple times
for i in {1..5}; do
  echo "Test $i:"
  node -e "const { prisma } = require(\"./dist/config/database.config.js\"); prisma.\$connect().then(() => prisma.\$queryRaw\`SELECT 1\`).then(() => { console.log(\"✅ Connected\"); return prisma.\$disconnect(); }).catch(e => { console.error(\"❌ Error:\", e.message); process.exit(1); });" || exit 1
  sleep 0.5
done

echo "✅ All connection tests passed - Database stable for rebuilds"
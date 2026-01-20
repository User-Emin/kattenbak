#!/bin/bash

# 🧹 Cleanup Old Deployment Files
# ============================================================================
# Verwijdert oude deployment scripts met hardcoded credentials
# ============================================================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 Cleaning up old deployment files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FILES_TO_REMOVE=(
    "scripts/deploy-secure.sh"
    "deployment/deploy-frontend-robust.sh"
    "backend/scripts/deploy-claude-production.sh"
    "fix-admin-api-url.sh"
    "backend/src/server-production.ts"
    "backend/src/server-stable.ts"
)

for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -f "$file" ]; then
        echo "🗑️  Removing: $file"
        # Create backup before deletion
        if [ ! -d "backups/deprecated" ]; then
            mkdir -p backups/deprecated
        fi
        cp "$file" "backups/deprecated/$(basename $file).bak"
        rm "$file"
        echo "   ✅ Removed (backup in backups/deprecated/)"
    else
        echo "   ⏭️  Skipped: $file (not found)"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Cleanup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: These files had hardcoded credentials"
echo "   They are backed up in: backups/deprecated/"
echo ""
echo "🚀 Use the new CI/CD pipeline instead:"
echo "   .github/workflows/production-deploy.yml"
echo ""


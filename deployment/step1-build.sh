#!/bin/bash
##################################################
# STAP 1: LOKALE BUILD & VERIFICATIE
# Geïsoleerd: Geen impact op productie
##################################################

set -e  # Stop bij eerste fout

WORKSPACE="/Users/emin/kattenbak"
BUILD_DIR="$WORKSPACE/admin-next"
ARTIFACT_DIR="/tmp/variant-deployment-$(date +%s)"

echo "════════════════════════════════════════════"
echo "🔒 STAP 1: LOKALE BUILD (GEÏSOLEERD)"
echo "════════════════════════════════════════════"

# 1.1 Clean build directory
echo "🧹 1.1 Cleaning previous builds..."
cd "$BUILD_DIR"
rm -rf .next
rm -rf node_modules/.cache

# 1.2 Verify VariantManager exists
echo "✅ 1.2 Verifying VariantManager component..."
if [ ! -f "components/VariantManager.tsx" ]; then
    echo "❌ ERROR: VariantManager.tsx not found!"
    exit 1
fi
echo "   → VariantManager.tsx: $(wc -l < components/VariantManager.tsx) lines"

# 1.3 Build admin
echo "🏗️  1.3 Building admin (Next.js)..."
npm run build 2>&1 | tee /tmp/admin-build.log

# Verify build success
if [ ! -d ".next" ]; then
    echo "❌ ERROR: Build failed - .next directory not created"
    exit 1
fi

# 1.4 Check for VariantManager in build
echo "🔍 1.4 Verifying VariantManager in build..."
VARIANT_COUNT=$(find .next -name "*.js" -exec grep -l "VariantManager\|Kleurvarianten" {} \; | wc -l)
if [ "$VARIANT_COUNT" -eq 0 ]; then
    echo "❌ ERROR: VariantManager not found in build output!"
    exit 1
fi
echo "   → VariantManager found in $VARIANT_COUNT files ✅"

# 1.5 Create artifact directory
echo "📦 1.5 Creating deployment artifact..."
mkdir -p "$ARTIFACT_DIR"
cp -r .next "$ARTIFACT_DIR/"

# Create manifest
cat > "$ARTIFACT_DIR/MANIFEST.txt" << EOF
Deployment Artifact - Variant System
=====================================
Build Date: $(date)
Build Size: $(du -sh "$ARTIFACT_DIR/.next" | cut -f1)
Git Commit: $(cd "$WORKSPACE" && git rev-parse --short HEAD)
VariantManager: INCLUDED
Security: DRY principles enforced
EOF

echo ""
echo "✅ STAP 1 COMPLEET - Build artifact ready at:"
echo "   $ARTIFACT_DIR"
echo ""

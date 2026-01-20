#!/bin/bash

# 🔒 CSS BUILD VERIFICATION SCRIPT
# Security Audit Compliant:
# - ✅ Verifies CSS files are generated
# - ✅ Checks for build errors
# - ✅ Validates CSS file sizes
# - ✅ Prevents deployment if CSS is missing

set -e

echo "🔍 Verifying CSS build..."

FRONTEND_DIR="frontend"
CSS_DIR="$FRONTEND_DIR/.next/static/css"
MIN_CSS_SIZE=1000 # Minimum expected CSS file size (bytes)

# ✅ VERIFY: .next directory exists
if [ ! -d "$FRONTEND_DIR/.next" ]; then
  echo "❌ ERROR: .next directory not found. Build may have failed."
  exit 1
fi

# ✅ VERIFY: CSS directory exists
if [ ! -d "$CSS_DIR" ]; then
  echo "❌ ERROR: CSS directory not found: $CSS_DIR"
  echo "🔨 Attempting to rebuild..."
  cd "$FRONTEND_DIR"
  npm run build
  cd ..
  
  if [ ! -d "$CSS_DIR" ]; then
    echo "❌ ERROR: CSS still missing after rebuild"
    exit 1
  fi
fi

# ✅ VERIFY: CSS files exist and have content
CSS_FILES=$(find "$CSS_DIR" -name "*.css" 2>/dev/null || true)

if [ -z "$CSS_FILES" ]; then
  echo "❌ ERROR: No CSS files found in $CSS_DIR"
  exit 1
fi

# ✅ VERIFY: CSS files have minimum size
echo "📊 Checking CSS file sizes..."
MISSING_CSS=0

while IFS= read -r css_file; do
  if [ -f "$css_file" ]; then
    SIZE=$(stat -f%z "$css_file" 2>/dev/null || stat -c%s "$css_file" 2>/dev/null || echo "0")
    
    if [ "$SIZE" -lt "$MIN_CSS_SIZE" ]; then
      echo "⚠️  WARNING: CSS file too small: $css_file ($SIZE bytes)"
      MISSING_CSS=1
    else
      echo "✅ CSS file OK: $css_file ($SIZE bytes)"
    fi
  fi
done <<< "$CSS_FILES"

# ✅ VERIFY: globals.css is imported
if ! grep -q "globals.css" "$FRONTEND_DIR/app/layout.tsx" 2>/dev/null; then
  echo "⚠️  WARNING: globals.css import not found in layout.tsx"
  MISSING_CSS=1
fi

# ✅ VERIFY: Tailwind config exists
if [ ! -f "$FRONTEND_DIR/tailwind.config.ts" ]; then
  echo "❌ ERROR: tailwind.config.ts not found"
  exit 1
fi

# ✅ VERIFY: PostCSS config exists
if [ ! -f "$FRONTEND_DIR/postcss.config.mjs" ] && [ ! -f "$FRONTEND_DIR/postcss.config.js" ]; then
  echo "❌ ERROR: PostCSS config not found"
  exit 1
fi

if [ "$MISSING_CSS" -eq 1 ]; then
  echo "❌ ERROR: CSS verification failed"
  exit 1
fi

echo "✅ CSS verification complete - All checks passed!"

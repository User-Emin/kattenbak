#!/bin/bash
# Check logo display issue

echo "🔍 LOGO DISPLAY CHECK"
echo "===================="

# 1. Check if logo file exists
echo ""
echo "📁 1. LOGO FILE CHECK"
if [ -f "frontend/public/logos/logo.webp" ]; then
  SIZE=$(ls -lh frontend/public/logos/logo.webp | awk '{print $5}')
  echo "  ✅ Logo.webp exists: $SIZE"
else
  echo "  ❌ Logo.webp NOT found"
fi

# 2. Check header.tsx
echo ""
echo "📝 2. HEADER.TSX CHECK"
if grep -q "/logos/logo.webp" frontend/components/layout/header.tsx; then
  echo "  ✅ Logo path correct in header.tsx"
  LINE=$(grep -n "/logos/logo.webp" frontend/components/layout/header.tsx | cut -d: -f1)
  echo "  📍 Found at line: $LINE"
else
  echo "  ❌ Logo path NOT found in header.tsx"
fi

# 3. Check if img tag is correct
if grep -q "<img" frontend/components/layout/header.tsx && grep -q "logo.webp" frontend/components/layout/header.tsx; then
  echo "  ✅ img tag present"
else
  echo "  ❌ img tag NOT found"
fi

# 4. Check Next.js public directory
echo ""
echo "📂 3. NEXT.JS PUBLIC DIRECTORY"
if [ -d "frontend/public/logos" ]; then
  echo "  ✅ frontend/public/logos directory exists"
  ls -lh frontend/public/logos/ | head -10
else
  echo "  ❌ frontend/public/logos directory NOT found"
fi

# 5. Check if using Next.js Image component vs regular img
echo ""
echo "🖼️  4. IMAGE COMPONENT CHECK"
if grep -q "from 'next/image'" frontend/components/layout/header.tsx; then
  echo "  ⚠️  Using Next.js Image component - might need optimization"
elif grep -q "<img" frontend/components/layout/header.tsx; then
  echo "  ✅ Using regular img tag (should work directly)"
else
  echo "  ❌ No image tag found"
fi

echo ""
echo "✅ CHECK COMPLETE"

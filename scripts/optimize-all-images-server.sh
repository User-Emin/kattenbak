#!/bin/bash
# 🚀 COMPLETE IMAGE OPTIMIZATION - All Hero & Static Images
# Optimizes all images >300KB to <500KB for maximum web speed

set -e

cd /var/www/kattenbak/frontend/public/images

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 OPTIMIZING ALL FRONTEND IMAGES - MAX SPEED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -d "." ]; then
    echo "⚠️  Images directory not found"
    exit 1
fi

optimized=0
total_saved_kb=0

for img in *.jpg *.jpeg *.png *.JPG *.JPEG *.PNG 2>/dev/null; do
    [ -f "$img" ] || continue
    
    size_bytes=$(stat -c%s "$img")
    size_kb=$((size_bytes / 1024))
    
    if [ "$size_kb" -gt 300 ]; then
        echo "📦 Optimizing: $img (${size_kb}KB)..."
        
        # Backup
        cp "$img" "${img}.backup"
        
        # Optimize based on type
        if [[ "$img" =~ \.(jpg|jpeg|JPG|JPEG)$ ]]; then
            jpegoptim --max=85 --strip-all --force "$img" > /dev/null 2>&1 || true
            # Resize if still large
            if [ -f "$img" ]; then
                convert "$img" -resize 1920x1920\> -quality 85 "${img}.tmp" && mv "${img}.tmp" "$img" || true
            fi
        elif [[ "$img" =~ \.(png|PNG)$ ]]; then
            optipng -o2 -strip all "$img" > /dev/null 2>&1 || true
            # Resize if still large
            convert "$img" -resize 1920x1920\> -quality 85 "${img}.tmp" && mv "${img}.tmp" "$img" || true
        fi
        
        new_size_bytes=$(stat -c%s "$img")
        new_size_kb=$((new_size_bytes / 1024))
        saved_kb=$((size_kb - new_size_kb))
        
        echo "   ✅ ${size_kb}KB → ${new_size_kb}KB (saved ${saved_kb}KB)"
        optimized=$((optimized + 1))
        total_saved_kb=$((total_saved_kb + saved_kb))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ OPTIMIZED: $optimized images"
echo "   💾 Total saved: ~$((total_saved_kb / 1024))MB"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

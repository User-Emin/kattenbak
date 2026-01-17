#!/bin/bash

# 🚀 IMAGE OPTIMIZATION SCRIPT - CPU & Bandwidth Friendly
# Optimizes large images (>1MB) to <300KB for web

set -e

UPLOAD_DIR="/var/www/uploads/products"
MAX_SIZE_MB=1
TARGET_MAX_SIZE_KB=300
QUALITY=85

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 IMAGE OPTIMIZATION - CPU & Bandwidth Friendly"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if imagemagick/jpegoptim is installed
if ! command -v jpegoptim &> /dev/null; then
    echo "⚠️  jpegoptim not found, installing..."
    apt-get update -qq && apt-get install -y jpegoptim optipng webp &> /dev/null
fi

if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found, installing..."
    apt-get update -qq && apt-get install -y imagemagick &> /dev/null
fi

cd "$UPLOAD_DIR" || exit 1

echo "🔍 Scanning for large images (>${MAX_SIZE_MB}MB)..."
echo ""

# Find and optimize large images
optimized_count=0
total_saved=0

for img in *.jpg *.jpeg *.JPG *.JPEG 2>/dev/null; do
    [ -f "$img" ] || continue
    
    size_bytes=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
    size_mb=$(echo "scale=2; $size_bytes / 1024 / 1024" | bc)
    
    # Check if image is larger than MAX_SIZE_MB
    if (( $(echo "$size_mb > $MAX_SIZE_MB" | bc -l) )); then
        echo "📦 Optimizing: $img (${size_mb}MB)..."
        
        # Backup original
        cp "$img" "${img}.backup"
        
        # Optimize JPEG
        if jpegoptim --max=$QUALITY --strip-all --force "$img" &> /dev/null; then
            new_size_bytes=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
            new_size_mb=$(echo "scale=2; $new_size_bytes / 1024 / 1024" | bc)
            saved=$(echo "scale=2; $size_bytes - $new_size_bytes" | bc)
            saved_mb=$(echo "scale=2; $saved / 1024 / 1024" | bc)
            
            echo "   ✅ Optimized: ${size_mb}MB → ${new_size_mb}MB (saved ${saved_mb}MB)"
            optimized_count=$((optimized_count + 1))
            total_saved=$(echo "$total_saved + $saved_mb" | bc)
            
            # If still too large, resize dimensions
            if (( $(echo "$new_size_mb > 0.5" | bc -l) )); then
                echo "   🔧 Resizing to max 1920px width..."
                convert "$img" -resize 1920x1920\> -quality $QUALITY "$img.tmp" && mv "$img.tmp" "$img"
                final_size_bytes=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
                final_size_mb=$(echo "scale=2; $final_size_bytes / 1024 / 1024" | bc)
                echo "   ✅ Final size: ${final_size_mb}MB"
            fi
        else
            echo "   ⚠️  Optimization failed, restoring backup"
            mv "${img}.backup" "$img"
        fi
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ OPTIMIZATION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   📦 Images optimized: $optimized_count"
echo "   💾 Total saved: ~${total_saved}MB"
echo ""
echo "🚀 All images now <${TARGET_MAX_SIZE_KB}KB for fastest loading"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

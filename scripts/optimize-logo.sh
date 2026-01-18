#!/bin/bash
# Optimize logo for maximum speed - WebP format with optimal quality

INPUT="$1"
OUTPUT_DIR="$2"

if [ -z "$INPUT" ] || [ -z "$OUTPUT_DIR" ]; then
  echo "Usage: $0 <input_image> <output_directory>"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

# Base filename without extension
BASENAME=$(basename "$INPUT" .jpg)
BASENAME=$(basename "$BASENAME" .jpeg)
BASENAME=$(basename "$BASENAME" .png)

# Output paths
OUTPUT_WEBP="${OUTPUT_DIR}/${BASENAME}.webp"
OUTPUT_PNG="${OUTPUT_DIR}/${BASENAME}-optimized.png"
OUTPUT_JPG="${OUTPUT_DIR}/${BASENAME}-optimized.jpg"

echo "🖼️  Optimizing logo: $INPUT"
echo "📁 Output directory: $OUTPUT_DIR"

# Try ImageMagick first
if command -v convert &> /dev/null; then
  echo "✅ Using ImageMagick..."
  
  # Get original dimensions
  DIMENSIONS=$(identify -format "%wx%h" "$INPUT" 2>/dev/null || echo "")
  
  # For navbar: max width 200px, maintain aspect ratio
  MAX_WIDTH=200
  
  # Create WebP (best quality/size ratio for logos)
  convert "$INPUT" \
    -resize "${MAX_WIDTH}x>" \
    -quality 90 \
    -strip \
    -define webp:lossless=false \
    -define webp:method=6 \
    "$OUTPUT_WEBP" 2>/dev/null && echo "✅ WebP created: $OUTPUT_WEBP"
  
  # Create optimized PNG (fallback, transparent if needed)
  convert "$INPUT" \
    -resize "${MAX_WIDTH}x>" \
    -strip \
    -quality 95 \
    "$OUTPUT_PNG" 2>/dev/null && echo "✅ PNG created: $OUTPUT_PNG"
  
  # Create optimized JPG (fallback)
  convert "$INPUT" \
    -resize "${MAX_WIDTH}x>" \
    -strip \
    -quality 85 \
    "$OUTPUT_JPG" 2>/dev/null && echo "✅ JPG created: $OUTPUT_JPG"

# Try sips (macOS built-in)
elif command -v sips &> /dev/null; then
  echo "✅ Using sips (macOS)..."
  
  MAX_WIDTH=200
  
  # Create optimized JPG
  sips -Z $MAX_WIDTH -s format jpeg -s formatOptions 85 "$INPUT" --out "$OUTPUT_JPG" 2>/dev/null && \
    echo "✅ JPG created: $OUTPUT_JPG"
  
  # Create optimized PNG
  sips -Z $MAX_WIDTH -s format png "$INPUT" --out "$OUTPUT_PNG" 2>/dev/null && \
    echo "✅ PNG created: $OUTPUT_PNG"
  
  # Note: sips doesn't support WebP, but we can use the JPG/PNG

else
  echo "⚠️  No image optimization tools found"
  echo "📋 Copying original file..."
  cp "$INPUT" "${OUTPUT_DIR}/"
  exit 0
fi

# Show file sizes
echo ""
echo "📊 File sizes:"
ls -lh "$OUTPUT_DIR"/${BASENAME}* 2>/dev/null | awk '{print $5, $9}'

echo ""
echo "✅ Logo optimization complete!"

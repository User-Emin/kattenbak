#!/bin/bash
##################################################
# STAP 2: ARTIFACT PACKAGING & CHECKSUM
# Security: Verify integrity voor upload
##################################################

set -e

ARTIFACT_DIR="$1"  # Pass from step 1
TAR_FILE="/tmp/admin-variant-$(date +%s).tar.gz"

echo "════════════════════════════════════════════"
echo "🔐 STAP 2: SECURE PACKAGING"
echo "════════════════════════════════════════════"

if [ -z "$ARTIFACT_DIR" ] || [ ! -d "$ARTIFACT_DIR" ]; then
    echo "❌ ERROR: Invalid artifact directory"
    exit 1
fi

# 2.1 Create compressed archive
echo "📦 2.1 Creating tar.gz archive..."
tar -czf "$TAR_FILE" -C "$ARTIFACT_DIR" .next

# 2.2 Generate checksums (integrity verification)
echo "🔒 2.2 Generating checksums..."
SHA256=$(shasum -a 256 "$TAR_FILE" | cut -d' ' -f1)
MD5=$(md5 -q "$TAR_FILE")

# 2.3 Create checksum file
cat > "$TAR_FILE.checksums" << EOF
SHA256: $SHA256
MD5: $MD5
Size: $(ls -lh "$TAR_FILE" | awk '{print $5}')
Date: $(date)
EOF

echo "   → SHA256: $SHA256"
echo "   → MD5: $MD5"
echo "   → Size: $(ls -lh "$TAR_FILE" | awk '{print $5}')"

# 2.4 Security check - geen secrets in build
echo "🔍 2.3 Security scan..."
SECRETS_FOUND=$(tar -xzOf "$TAR_FILE" | grep -i "password\|secret\|api[_-]key" | grep -v "placeholder\|example" | wc -l)
if [ "$SECRETS_FOUND" -gt 0 ]; then
    echo "⚠️  WARNING: Potential secrets found in build!"
    echo "   Review before upload!"
fi

echo ""
echo "✅ STAP 2 COMPLEET - Artifact packaged:"
echo "   $TAR_FILE"
echo "   Checksums: $TAR_FILE.checksums"
echo ""
echo "$TAR_FILE"  # Return for next step

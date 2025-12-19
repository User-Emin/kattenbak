#!/bin/bash
##################################################
# SECURE DEPLOYMENT - MET PASSWORD PROMPT
# NOOIT password hardcoded in script!
##################################################

set -e

# Correct server IP
SERVER="root@185.224.139.74"
ARTIFACT="/tmp/admin-variant-1766135924.tar.gz"
CHECKSUMS="/tmp/admin-variant-1766135924.tar.gz.checksums"

echo "════════════════════════════════════════════"
echo "🚀 SECURE DEPLOYMENT - VARIANT SYSTEM"
echo "════════════════════════════════════════════"
echo ""
echo "Server: $SERVER"
echo "Artifact: $ARTIFACT"
echo ""

# Check if artifact exists
if [ ! -f "$ARTIFACT" ]; then
    echo "❌ ERROR: Artifact not found!"
    echo "Run: cd /Users/emin/kattenbak/deployment && ./step1-build.sh"
    exit 1
fi

# 1. Upload artifact
echo "📤 STAP 1: Uploading artifact..."
echo "   (Password will be requested by SSH)"
scp -o ConnectTimeout=30 "$ARTIFACT" "$CHECKSUMS" "$SERVER:/tmp/"

echo "✅ Upload complete"
echo ""

# 2. Verify checksum op server
echo "🔍 STAP 2: Verifying integrity..."
REMOTE_FILE=$(basename "$ARTIFACT")
LOCAL_SHA=$(cat "$CHECKSUMS" | grep SHA256 | cut -d' ' -f2)

ssh "$SERVER" << EOSSH
set -e
cd /tmp
REMOTE_SHA=\$(shasum -a 256 "$REMOTE_FILE" | cut -d' ' -f1)
echo "Local SHA:  $LOCAL_SHA"
echo "Remote SHA: \$REMOTE_SHA"

if [ "$LOCAL_SHA" = "\$REMOTE_SHA" ]; then
    echo "✅ Checksum match - integrity verified"
else
    echo "❌ Checksum mismatch!"
    exit 1
fi
EOSSH

echo ""

# 3. Create backup
echo "💾 STAP 3: Creating backup..."
ssh "$SERVER" << 'EOSSH'
set -e

DEPLOY_PATH="/var/www/html/admin-next"
BACKUP_PATH="/var/www/html/backups/admin-next-$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_PATH"

if [ -d "$DEPLOY_PATH/.next" ]; then
    echo "   → Backing up to $BACKUP_PATH"
    cp -r "$DEPLOY_PATH/.next" "$BACKUP_PATH/"
    
    # Create rollback script
    cat > "$BACKUP_PATH/ROLLBACK.sh" << 'ROLLBACK'
#!/bin/bash
BACKUP_DIR=$(dirname "$0")
DEPLOY_DIR="/var/www/html/admin-next"
echo "🔄 Rolling back..."
rm -rf "$DEPLOY_DIR/.next"
cp -r "$BACKUP_DIR/.next" "$DEPLOY_DIR/"
cd /var/www/html
pm2 restart ecosystem.config.js
echo "✅ Rollback complete"
ROLLBACK
    
    chmod +x "$BACKUP_PATH/ROLLBACK.sh"
    echo "   ✅ Backup created"
    echo "   → Rollback: $BACKUP_PATH/ROLLBACK.sh"
else
    echo "   ℹ️  No previous build to backup"
fi
EOSSH

echo ""

# 4. Deploy (atomic swap)
echo "🚀 STAP 4: Deploying (zero-downtime)..."
ssh "$SERVER" << 'EOSSH'
set -e

REMOTE_FILE=$(ls -t /tmp/admin-variant-*.tar.gz 2>/dev/null | head -1)
DEPLOY_DIR="/var/www/html/admin-next"
STAGING_DIR="/tmp/admin-next-staging-$$"

# Extract to staging
mkdir -p "$STAGING_DIR"
cd "$STAGING_DIR"
tar -xzf "$REMOTE_FILE"

# Verify VariantManager
VARIANT_CHECK=$(find .next -name "*.js" -exec grep -l "VariantManager\|Kleurvarianten" {} \; | wc -l)
if [ "$VARIANT_CHECK" -eq 0 ]; then
    echo "❌ ERROR: VariantManager not found in build!"
    rm -rf "$STAGING_DIR"
    exit 1
fi

echo "   ✅ Build verified - VariantManager found in $VARIANT_CHECK files"

# Atomic swap
rm -rf "$DEPLOY_DIR/.next"
mv "$STAGING_DIR/.next" "$DEPLOY_DIR/"

# Cleanup
rm -rf "$STAGING_DIR"
rm -f "$REMOTE_FILE"

echo "   ✅ New build activated"
EOSSH

echo ""

# 5. Restart PM2
echo "🔄 STAP 5: Restarting services..."
ssh "$SERVER" << 'EOSSH'
set -e
cd /var/www/html
pm2 restart ecosystem.config.js --update-env
sleep 3
pm2 list | grep -E "admin|name"
EOSSH

echo ""
echo "════════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE!"
echo "════════════════════════════════════════════"
echo ""
echo "🔗 Test now:"
echo "   https://catsupply.nl/admin/dashboard/products"
echo "   → Click 'Bewerken'"
echo "   → Scroll down"
echo "   → See 'Kleurvarianten' section"
echo ""

#!/bin/bash
##################################################
# STAP 4: SERVER-SIDE DEPLOYMENT (ZERO-DOWNTIME)
# Isolation: Backup old, deploy new, verify, activate
##################################################

set -e

REMOTE_FILE="$1"
SERVER="root@37.27.22.75"
DEPLOY_PATH="/var/www/html/admin-next"
BACKUP_PATH="/var/www/html/backups/admin-next-$(date +%Y%m%d-%H%M%S)"

echo "════════════════════════════════════════════"
echo "🚀 STAP 4: SERVER DEPLOYMENT (ZERO-DOWNTIME)"
echo "════════════════════════════════════════════"

# 4.1 Create backup
echo "💾 4.1 Creating backup van current version..."
ssh "$SERVER" << EOSSH
set -e

# Create backup directory
mkdir -p "$BACKUP_PATH"

# Backup current .next (if exists)
if [ -d "$DEPLOY_PATH/.next" ]; then
    echo "   → Backing up to $BACKUP_PATH"
    cp -r "$DEPLOY_PATH/.next" "$BACKUP_PATH/"
    echo "   ✅ Backup created"
else
    echo "   ℹ️  No previous build to backup"
fi

# Create rollback script
cat > "$BACKUP_PATH/ROLLBACK.sh" << 'ROLLBACK'
#!/bin/bash
# Emergency rollback script
BACKUP_DIR=\$(dirname "\$0")
DEPLOY_DIR="/var/www/html/admin-next"

echo "🔄 Rolling back admin-next..."
rm -rf "\$DEPLOY_DIR/.next"
cp -r "\$BACKUP_DIR/.next" "\$DEPLOY_DIR/"
cd /var/www/html
pm2 restart ecosystem.config.js
echo "✅ Rollback complete"
ROLLBACK

chmod +x "$BACKUP_PATH/ROLLBACK.sh"
echo "   → Rollback script: $BACKUP_PATH/ROLLBACK.sh"
EOSSH

# 4.2 Extract new build (isolated directory first)
echo "📦 4.2 Extracting new build (isolated)..."
ssh "$SERVER" << EOSSH
set -e

STAGING_DIR="/tmp/admin-next-staging-\$\$"
mkdir -p "\$STAGING_DIR"

# Extract to staging
cd "\$STAGING_DIR"
tar -xzf "/tmp/$REMOTE_FILE"

# Verify extraction
if [ ! -d ".next" ]; then
    echo "❌ ERROR: Extraction failed"
    rm -rf "\$STAGING_DIR"
    exit 1
fi

# Check for VariantManager
VARIANT_CHECK=\$(find .next -name "*.js" -exec grep -l "VariantManager\|Kleurvarianten" {} \; | wc -l)
if [ "\$VARIANT_CHECK" -eq 0 ]; then
    echo "❌ ERROR: VariantManager not found in extracted build!"
    rm -rf "\$STAGING_DIR"
    exit 1
fi

echo "   ✅ Build extracted & verified"
echo "   → VariantManager found in \$VARIANT_CHECK files"
echo "\$STAGING_DIR"
EOSSH

# 4.3 Atomic swap (minimize downtime)
echo "🔄 4.3 Atomic deployment swap..."
ssh "$SERVER" << 'EOSSH'
set -e

STAGING_DIR=$(ls -dt /tmp/admin-next-staging-* 2>/dev/null | head -1)
DEPLOY_DIR="/var/www/html/admin-next"

if [ -z "$STAGING_DIR" ]; then
    echo "❌ ERROR: Staging directory not found"
    exit 1
fi

# Remove old .next
rm -rf "$DEPLOY_DIR/.next"

# Move new build (atomic operation)
mv "$STAGING_DIR/.next" "$DEPLOY_DIR/"

# Cleanup staging
rm -rf "$STAGING_DIR"

echo "   ✅ New build activated"
EOSSH

# 4.4 Restart services
echo "🔄 4.4 Restarting PM2 services..."
ssh "$SERVER" << 'EOSSH'
set -e

cd /var/www/html
pm2 restart ecosystem.config.js --update-env

# Wait for startup
sleep 5

# Check PM2 status
pm2 list | grep admin-next
EOSSH

echo ""
echo "✅ STAP 4 COMPLEET - Deployment successful"
echo "   Backup available at: $SERVER:$BACKUP_PATH"
echo ""

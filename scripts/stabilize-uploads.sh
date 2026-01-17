#!/bin/bash

# ✅ STABILIZE UPLOADS - CPU-FRIENDLY, MAXIMAL PROTECTION
# Prevents image loss during rebuilds/deployments
# Ensures uploads are always preserved and restored

UPLOADS_DIR="/var/www/uploads/products"
BACKUP_DIR="/var/www/uploads-backup"
BACKUP_RETENTION=5  # Keep last 5 backups

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️  UPLOADS STABILIZATION - CPU-FRIENDLY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Ensure directories exist
mkdir -p "$UPLOADS_DIR"
mkdir -p "$BACKUP_DIR"

# 1. Create backup (CPU-friendly: only if files exist)
if [ -d "$UPLOADS_DIR" ] && [ "$(ls -A $UPLOADS_DIR 2>/dev/null)" ]; then
  FILE_COUNT=$(find "$UPLOADS_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \) 2>/dev/null | wc -l)
  
  if [ "$FILE_COUNT" -gt 0 ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/uploads_$TIMESTAMP"
    
    echo "💾 Creating backup ($FILE_COUNT files)..."
    cp -r "$UPLOADS_DIR" "$BACKUP_PATH" 2>/dev/null && echo "   ✅ Backup: $BACKUP_PATH" || echo "   ⚠️  Backup failed"
    
    # Cleanup old backups (keep last N)
    cd "$BACKUP_DIR" 2>/dev/null && ls -td uploads_* 2>/dev/null | tail -n +$((BACKUP_RETENTION + 1)) | xargs rm -rf 2>/dev/null || true
  fi
fi

# 2. Restore from latest backup if directory is empty (CPU-friendly check)
if [ -d "$UPLOADS_DIR" ] && [ ! "$(ls -A $UPLOADS_DIR 2>/dev/null)" ]; then
  LATEST_BACKUP=$(ls -td "$BACKUP_DIR"/uploads_* 2>/dev/null | head -1)
  
  if [ -n "$LATEST_BACKUP" ] && [ -d "$LATEST_BACKUP" ]; then
    echo "🔄 Restoring from backup: $LATEST_BACKUP"
    cp -r "$LATEST_BACKUP"/* "$UPLOADS_DIR"/ 2>/dev/null && echo "   ✅ Restore complete" || echo "   ⚠️  Restore failed"
  fi
fi

# 3. Verify uploads integrity
if [ -d "$UPLOADS_DIR" ]; then
  FILE_COUNT=$(find "$UPLOADS_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \) 2>/dev/null | wc -l)
  echo "✅ Uploads status: $FILE_COUNT files preserved"
else
  echo "⚠️  Uploads directory not found"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

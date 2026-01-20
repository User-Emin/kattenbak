#!/bin/bash
#
# PostgreSQL Database Backup Script
# 
# This script creates daily backups of the kattenbak_prod database
# and keeps the last 7 days of backups
#
# Installation:
#   1. Copy to /etc/cron.daily/postgres-backup.sh
#   2. chmod +x /etc/cron.daily/postgres-backup.sh
#   3. Test: /etc/cron.daily/postgres-backup.sh
#

# Configuration
BACKUP_DIR="/var/backups/postgres"
DB_NAME="kattenbak_prod"
DB_USER="kattenbak_user"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${DATE}.sql.gz"
RETENTION_DAYS=7
LOG_FILE="/var/log/postgres-backup.log"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Log start
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting backup of $DB_NAME..." | tee -a "$LOG_FILE"

# Create backup with compression
if pg_dump -h localhost -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"; then
    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup successful: $BACKUP_FILE ($BACKUP_SIZE)" | tee -a "$LOG_FILE"
    
    # Delete backups older than retention period
    find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Old backups cleaned (retention: ${RETENTION_DAYS} days)" | tee -a "$LOG_FILE"
    
    # List current backups
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql.gz" | wc -l)
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Current backup count: $BACKUP_COUNT" | tee -a "$LOG_FILE"
    
    exit 0
else
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: Backup failed!" | tee -a "$LOG_FILE"
    exit 1
fi


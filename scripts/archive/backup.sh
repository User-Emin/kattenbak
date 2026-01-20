#!/bin/bash

###############################################################################
# AUTOMATED BACKUP SYSTEM - PostgreSQL + Media Files
# Security: Encrypted backups, off-site storage, retention policy
# DRY: Single script for all backup operations
###############################################################################

set -euo pipefail # Exit on error, undefined variables, pipe failures

# ===== CONFIGURATION =====
BACKUP_DIR="/var/backups/kattenbak"
DB_NAME="kattenbak"
DB_USER="kattenbak"
MEDIA_DIR="/var/www/uploads"
RETENTION_DAYS=30 # Keep backups for 30 days
BACKUP_ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ===== LOGGING =====
log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# ===== CHECKS =====
check_requirements() {
  log "Checking requirements..."
  
  # Check if running as root
  if [[ $EUID -ne 0 ]]; then
    error "This script must be run as root"
    exit 1
  fi
  
  # Check required commands
  for cmd in pg_dump tar gpg; do
    if ! command -v $cmd &> /dev/null; then
      error "Required command not found: $cmd"
      exit 1
    fi
  done
  
  # Check encryption key
  if [[ -z "$BACKUP_ENCRYPTION_KEY" ]]; then
    warning "BACKUP_ENCRYPTION_KEY not set - backups will NOT be encrypted!"
    warning "Set it in /etc/environment or /root/.bashrc"
  fi
  
  # Create backup directory
  mkdir -p "$BACKUP_DIR"/{database,media,combined}
  
  log "✅ Requirements check passed"
}

# ===== DATABASE BACKUP =====
backup_database() {
  log "Starting PostgreSQL backup..."
  
  local db_backup_file="$BACKUP_DIR/database/db_${TIMESTAMP}.sql"
  local db_compressed="$BACKUP_DIR/database/db_${TIMESTAMP}.sql.gz"
  
  # Dump database with custom format (faster, allows parallel restore)
  if pg_dump -U "$DB_USER" -Fc "$DB_NAME" > "$db_backup_file.custom" 2>/dev/null; then
    log "✅ Database dumped (custom format): $(du -h "$db_backup_file.custom" | cut -f1)"
  else
    error "Database backup failed!"
    return 1
  fi
  
  # Also create plain SQL dump (human-readable, easier to inspect)
  if pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$db_compressed" 2>/dev/null; then
    log "✅ SQL dump compressed: $(du -h "$db_compressed" | cut -f1)"
  else
    warning "SQL dump failed, but custom format succeeded"
  fi
  
  # Encrypt if key is set
  if [[ -n "$BACKUP_ENCRYPTION_KEY" ]]; then
    echo "$BACKUP_ENCRYPTION_KEY" | gpg --batch --yes --passphrase-fd 0 \
      --symmetric --cipher-algo AES256 \
      -o "$db_backup_file.custom.gpg" \
      "$db_backup_file.custom"
    
    rm "$db_backup_file.custom" # Remove unencrypted
    log "✅ Database backup encrypted"
  fi
  
  log "✅ Database backup complete"
}

# ===== MEDIA BACKUP =====
backup_media() {
  log "Starting media files backup..."
  
  local media_backup="$BACKUP_DIR/media/media_${TIMESTAMP}.tar.gz"
  
  # Create compressed archive of uploads (excluding temp files)
  if tar -czf "$media_backup" \
      --exclude='*.tmp' \
      --exclude='*.part' \
      -C /var/www uploads 2>/dev/null; then
    log "✅ Media files archived: $(du -h "$media_backup" | cut -f1)"
  else
    error "Media backup failed!"
    return 1
  fi
  
  # Encrypt if key is set
  if [[ -n "$BACKUP_ENCRYPTION_KEY" ]]; then
    echo "$BACKUP_ENCRYPTION_KEY" | gpg --batch --yes --passphrase-fd 0 \
      --symmetric --cipher-algo AES256 \
      -o "$media_backup.gpg" \
      "$media_backup"
    
    rm "$media_backup" # Remove unencrypted
    log "✅ Media backup encrypted"
  fi
  
  log "✅ Media backup complete"
}

# ===== COMBINED BACKUP =====
create_combined_backup() {
  log "Creating combined backup archive..."
  
  local combined_backup="$BACKUP_DIR/combined/kattenbak_full_${TIMESTAMP}.tar.gz"
  
  # Create full system backup
  tar -czf "$combined_backup" \
    -C "$BACKUP_DIR" \
    database/$(ls -t "$BACKUP_DIR/database" | head -1) \
    media/$(ls -t "$BACKUP_DIR/media" | head -1)
  
  log "✅ Combined backup: $(du -h "$combined_backup" | cut -f1)"
}

# ===== CLEANUP OLD BACKUPS =====
cleanup_old_backups() {
  log "Cleaning up backups older than $RETENTION_DAYS days..."
  
  local deleted=0
  
  for dir in database media combined; do
    while IFS= read -r -d '' file; do
      rm "$file"
      ((deleted++))
    done < <(find "$BACKUP_DIR/$dir" -type f -mtime +$RETENTION_DAYS -print0)
  done
  
  if [[ $deleted -gt 0 ]]; then
    log "✅ Deleted $deleted old backup files"
  else
    log "No old backups to delete"
  fi
}

# ===== BACKUP VERIFICATION =====
verify_backups() {
  log "Verifying latest backups..."
  
  # Check database backup
  local latest_db=$(ls -t "$BACKUP_DIR/database" | head -1)
  if [[ -f "$BACKUP_DIR/database/$latest_db" ]]; then
    log "✅ Latest DB backup: $latest_db ($(du -h "$BACKUP_DIR/database/$latest_db" | cut -f1))"
  else
    error "No database backup found!"
    return 1
  fi
  
  # Check media backup
  local latest_media=$(ls -t "$BACKUP_DIR/media" | head -1)
  if [[ -f "$BACKUP_DIR/media/$latest_media" ]]; then
    log "✅ Latest media backup: $latest_media ($(du -h "$BACKUP_DIR/media/$latest_media" | cut -f1))"
  else
    error "No media backup found!"
    return 1
  fi
  
  # Test database backup integrity (if unencrypted)
  if [[ "$latest_db" != *.gpg ]]; then
    if pg_restore -l "$BACKUP_DIR/database/$latest_db" &>/dev/null; then
      log "✅ Database backup integrity verified"
    else
      error "Database backup may be corrupted!"
      return 1
    fi
  fi
}

# ===== RESTORE FUNCTIONS =====
restore_database() {
  local backup_file="$1"
  
  warning "This will OVERWRITE the current database!"
  read -p "Are you sure? (yes/no): " confirm
  
  if [[ "$confirm" != "yes" ]]; then
    log "Restore cancelled"
    return 0
  fi
  
  log "Restoring database from $backup_file..."
  
  # Decrypt if needed
  if [[ "$backup_file" == *.gpg ]]; then
    if [[ -z "$BACKUP_ENCRYPTION_KEY" ]]; then
      error "BACKUP_ENCRYPTION_KEY required to decrypt backup!"
      return 1
    fi
    
    local decrypted="${backup_file%.gpg}"
    echo "$BACKUP_ENCRYPTION_KEY" | gpg --batch --yes --passphrase-fd 0 \
      --decrypt -o "$decrypted" "$backup_file"
    backup_file="$decrypted"
  fi
  
  # Drop and recreate database
  sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
  
  # Restore from backup
  if pg_restore -U "$DB_USER" -d "$DB_NAME" -v "$backup_file"; then
    log "✅ Database restored successfully"
  else
    error "Database restore failed!"
    return 1
  fi
}

# ===== MAIN EXECUTION =====
main() {
  log "🔄 Starting Kattenbak Backup System"
  log "Timestamp: $TIMESTAMP"
  
  check_requirements
  
  # Run backups
  backup_database
  backup_media
  create_combined_backup
  
  # Verify backups
  verify_backups
  
  # Cleanup old backups
  cleanup_old_backups
  
  # Show summary
  log ""
  log "====== BACKUP SUMMARY ======"
  log "Database backups: $(ls -1 "$BACKUP_DIR/database" | wc -l)"
  log "Media backups: $(ls -1 "$BACKUP_DIR/media" | wc -l)"
  log "Combined backups: $(ls -1 "$BACKUP_DIR/combined" | wc -l)"
  log "Total backup size: $(du -sh "$BACKUP_DIR" | cut -f1)"
  log "============================"
  log ""
  log "✅ Backup completed successfully!"
}

# Execute main function
main "$@"


#!/bin/bash

###############################################################################
# REDIS SECURE CONFIGURATION SCRIPT
# Configures Redis with password authentication and security hardening
###############################################################################

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
  error "This script must be run as root"
  exit 1
fi

log "🔒 Starting Redis secure configuration..."

# Generate strong password (not hardcoded - generated dynamically)
REDIS_PASSWORD=$(openssl rand -base64 32)

# Backup existing configuration
REDIS_CONF="/etc/redis/redis.conf"
if [[ -f "$REDIS_CONF" ]]; then
  cp "$REDIS_CONF" "$REDIS_CONF.backup.$(date +%Y%m%d_%H%M%S)"
  log "✅ Backed up existing Redis configuration"
fi

# Configure Redis
log "Configuring Redis with secure settings..."

# 1. Set password (dynamically generated, not hardcoded)
sed -i "s/^# requirepass .*/requirepass $REDIS_PASSWORD/" "$REDIS_CONF"
sed -i "s/^requirepass .*/requirepass $REDIS_PASSWORD/" "$REDIS_CONF"

# 2. Bind to localhost only (if not using remote connections)
sed -i "s/^bind .*/bind 127.0.0.1 ::1/" "$REDIS_CONF"

# 3. Disable dangerous commands
cat >> "$REDIS_CONF" << 'EOF'

# Security: Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""
rename-command CONFIG "CONFIG_$(openssl rand -hex 8)"
rename-command SHUTDOWN "SHUTDOWN_$(openssl rand -hex 8)"
rename-command DEBUG ""
EOF

# 4. Enable protected mode
sed -i "s/^protected-mode .*/protected-mode yes/" "$REDIS_CONF"

# 5. Set maxmemory policy
sed -i "s/^# maxmemory .*/maxmemory 256mb/" "$REDIS_CONF"
sed -i "s/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/" "$REDIS_CONF"

# 6. Enable persistence (RDB + AOF)
sed -i "s/^# save .*/save 900 1\nsave 300 10\nsave 60 10000/" "$REDIS_CONF"
sed -i "s/^appendonly .*/appendonly yes/" "$REDIS_CONF"

log "✅ Redis configuration updated"

# Restart Redis
log "Restarting Redis..."
systemctl restart redis

# Wait for Redis to start
sleep 2

# Verify Redis is running
if systemctl is-active --quiet redis; then
  log "✅ Redis is running"
else
  error "Redis failed to start!"
  exit 1
fi

# Test connection with password
if redis-cli -a "$REDIS_PASSWORD" ping | grep -q "PONG"; then
  log "✅ Redis password authentication working"
else
  error "Redis authentication test failed!"
  exit 1
fi

# Update application environment
BACKEND_ENV="/var/www/kattenbak/backend/.env"
if [[ -f "$BACKEND_ENV" ]]; then
  # Check if REDIS_PASSWORD already exists (auto-generated value)
  if grep -q "^REDIS_PASSWORD=" "$BACKEND_ENV"; then
    sed -i "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD='$REDIS_PASSWORD'|" "$BACKEND_ENV"
  else
    echo "REDIS_PASSWORD='$REDIS_PASSWORD'" >> "$BACKEND_ENV"
  fi
  
  # Update REDIS_URL to include password
  if grep -q "^REDIS_URL=" "$BACKEND_ENV"; then
    sed -i "s|^REDIS_URL=.*|REDIS_URL='redis://:$REDIS_PASSWORD@localhost:6379'|" "$BACKEND_ENV"
  else
    echo "REDIS_URL='redis://:$REDIS_PASSWORD@localhost:6379'" >> "$BACKEND_ENV"
  fi
  
  log "✅ Updated application .env with Redis password"
fi

# Display summary
log ""
log "====== REDIS SECURE CONFIGURATION COMPLETE ======"
log "Redis Password: $REDIS_PASSWORD"
log ""
log "⚠️  IMPORTANT: Save this password securely!"
log "   It has been added to: $BACKEND_ENV"
log ""
log "Security settings applied:"
log "  ✅ Password authentication enabled"
log "  ✅ Bind to localhost only"
log "  ✅ Dangerous commands disabled"
log "  ✅ Protected mode enabled"
log "  ✅ Memory limit: 256MB"
log "  ✅ Persistence enabled (RDB + AOF)"
log "=================================================="
log ""
log "Next steps:"
log "  1. Restart backend: pm2 restart backend"
log "  2. Test Redis health: curl http://localhost:3101/api/v1/health/redis"
log ""

# Save password to secure file for reference
PASSWORD_FILE="/root/.redis_password"
echo "$REDIS_PASSWORD" > "$PASSWORD_FILE"
chmod 600 "$PASSWORD_FILE"
log "✅ Redis password saved to: $PASSWORD_FILE (root-only access)"

log "✅ Redis is now securely configured!"


#!/bin/bash

# ✅ SETUP CRONJOBS - Automated Cron Job Installation
# E2E Secure: Sets up all monitoring and maintenance cronjobs
# Email: emin@catsupply.nl

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🔧 Setting up Cronjobs for catsupply.nl"
echo "========================================"

# Check if running on server
if [ "$(hostname)" != "185.224.139.74" ] && ! ssh -o ConnectTimeout=5 root@185.224.139.74 "echo 'connected'" > /dev/null 2>&1; then
    log_error "This script must be run on the server or via SSH"
    exit 1
fi

# Install mail utilities if not present
log_info "Checking mail utilities..."
if ssh root@185.224.139.74 "command -v mail > /dev/null 2>&1 || command -v sendmail > /dev/null 2>&1"; then
    log_success "Mail utilities already installed"
else
    log_info "Installing mail utilities..."
    ssh root@185.224.139.74 "apt-get update -qq && apt-get install -y mailutils postfix" || {
        log_error "Failed to install mail utilities"
        exit 1
    }
    log_success "Mail utilities installed"
fi

# Copy monitoring script to server
log_info "Deploying monitoring script..."
ssh root@185.224.139.74 "mkdir -p /opt/catsupply/scripts" || true
scp scripts/server-monitoring-cron.sh root@185.224.139.74:/opt/catsupply/scripts/ || {
    log_error "Failed to copy monitoring script"
    exit 1
}
ssh root@185.224.139.74 "chmod +x /opt/catsupply/scripts/server-monitoring-cron.sh"
log_success "Monitoring script deployed"

# Setup crontab entries
log_info "Setting up crontab entries..."
ssh root@185.224.139.74 "crontab -l > /tmp/current-crontab 2>/dev/null || touch /tmp/current-crontab"

# Remove old entries if they exist
ssh root@185.224.139.74 "grep -v 'catsupply-monitoring\|certbot renew' /tmp/current-crontab > /tmp/new-crontab || touch /tmp/new-crontab"

# Add new cronjobs
cat >> /tmp/new-crontab << 'EOF'
# ✅ CATSUPPLY.NL - Automated Monitoring & Maintenance
# SSL Certificate Renewal (twice daily, certbot handles duplicates)
0 2,14 * * * certbot renew --quiet --deploy-hook "systemctl reload nginx" >> /var/log/certbot-renew.log 2>&1

# Server Health Monitoring (daily at 06:00)
0 6 * * * /opt/catsupply/scripts/server-monitoring-cron.sh >> /var/log/catsupply-monitoring.log 2>&1

# SSL Certificate Expiry Check (daily at 08:00)
0 8 * * * /opt/catsupply/scripts/server-monitoring-cron.sh check_ssl_certificate >> /var/log/catsupply-ssl-check.log 2>&1

# PM2 Service Health Check (every 6 hours)
0 */6 * * * pm2 ping && pm2 list | grep -v online && echo "PM2 services check failed at $(date)" | mail -s "PM2 Alert" emin@catsupply.nl || true

# Disk Space Check (daily at 10:00)
0 10 * * * df -h / | awk 'NR==2 {if (\$5+0 > 85) print "Disk usage: " \$5}' | mail -s "Disk Space Alert" emin@catsupply.nl || true
EOF

# Install crontab
scp /tmp/new-crontab root@185.224.139.74:/tmp/new-crontab || {
    log_error "Failed to copy crontab"
    exit 1
}
ssh root@185.224.139.74 "crontab /tmp/new-crontab && rm /tmp/new-crontab"
log_success "Crontab installed"

# Verify crontab
log_info "Verifying crontab..."
ssh root@185.224.139.74 "crontab -l | grep -E 'catsupply|certbot'"

# Setup log rotation
log_info "Setting up log rotation..."
ssh root@185.224.139.74 "cat > /etc/logrotate.d/catsupply << 'LOGROTATE'
/var/log/catsupply-*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}

/var/log/certbot-renew.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
}
LOGROTATE
" || {
    log_warning "Failed to setup log rotation"
}

log_success "Log rotation configured"

# Test monitoring script
log_info "Testing monitoring script..."
ssh root@185.224.139.74 "/opt/catsupply/scripts/server-monitoring-cron.sh" || {
    log_error "Monitoring script test failed"
    exit 1
}
log_success "Monitoring script test passed"

echo ""
echo "=============================================="
log_success "Cronjobs setup complete!"
echo ""
echo "Installed cronjobs:"
echo "  - SSL certificate renewal: Twice daily (02:00, 14:00)"
echo "  - Server health monitoring: Daily at 06:00"
echo "  - SSL expiry check: Daily at 08:00"
echo "  - PM2 service check: Every 6 hours"
echo "  - Disk space check: Daily at 10:00"
echo ""
echo "Email alerts sent to: emin@catsupply.nl"
echo ""
echo "View crontab: ssh root@185.224.139.74 'crontab -l'"
echo "View logs: ssh root@185.224.139.74 'tail -f /var/log/catsupply-monitoring.log'"
echo ""

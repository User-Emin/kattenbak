#!/bin/bash

# ✅ SERVER MONITORING CRON - Automated Server Health Checks
# Runs daily via cron, sends email alerts for critical issues
# E2E Secure: Monitors SSL certificates, services, disk space, etc.

set -e

EMAIL="emin@catsupply.nl"
LOG_FILE="/var/log/catsupply-monitoring.log"
ALERT_FILE="/tmp/catsupply-alert-$(date +%Y%m%d).txt"

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_ssl_certificate() {
    log "Checking SSL certificate..."
    
    CERT_FILE="/etc/letsencrypt/live/catsupply.nl/fullchain.pem"
    
    if [ ! -f "$CERT_FILE" ]; then
        echo "❌ SSL certificate file not found: $CERT_FILE" >> "$ALERT_FILE"
        return 1
    fi
    
    EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y" "$EXPIRY_DATE" +%s 2>/dev/null)
    CURRENT_EPOCH=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
    
    if [ "$DAYS_UNTIL_EXPIRY" -lt 30 ]; then
        echo "⚠️ SSL certificate expires in $DAYS_UNTIL_EXPIRY days (on $EXPIRY_DATE)" >> "$ALERT_FILE"
        return 1
    elif [ "$DAYS_UNTIL_EXPIRY" -lt 7 ]; then
        echo "🔴 CRITICAL: SSL certificate expires in $DAYS_UNTIL_EXPIRY days!" >> "$ALERT_FILE"
        return 2
    else
        log "${GREEN}✅ SSL certificate valid for $DAYS_UNTIL_EXPIRY more days${NC}"
    fi
}

check_pm2_services() {
    log "Checking PM2 services..."
    
    FAILED_SERVICES=$(pm2 jlist | jq -r '.[] | select(.pm2_env.status != "online") | .name' 2>/dev/null || echo "")
    
    if [ -n "$FAILED_SERVICES" ]; then
        echo "❌ PM2 services not running: $FAILED_SERVICES" >> "$ALERT_FILE"
        return 1
    else
        log "${GREEN}✅ All PM2 services running${NC}"
    fi
}

check_disk_space() {
    log "Checking disk space..."
    
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$DISK_USAGE" -gt 90 ]; then
        echo "🔴 CRITICAL: Disk usage at ${DISK_USAGE}%" >> "$ALERT_FILE"
        return 2
    elif [ "$DISK_USAGE" -gt 80 ]; then
        echo "⚠️ Disk usage high: ${DISK_USAGE}%" >> "$ALERT_FILE"
        return 1
    else
        log "${GREEN}✅ Disk usage: ${DISK_USAGE}%${NC}"
    fi
}

check_nginx_status() {
    log "Checking Nginx status..."
    
    if ! systemctl is-active --quiet nginx; then
        echo "🔴 CRITICAL: Nginx is not running!" >> "$ALERT_FILE"
        return 2
    else
        log "${GREEN}✅ Nginx is running${NC}"
    fi
}

check_ssl_renewal() {
    log "Checking SSL certificate renewal..."
    
    # Run certbot renew (dry-run)
    if certbot renew --dry-run > /dev/null 2>&1; then
        log "${GREEN}✅ SSL certificate renewal check passed${NC}"
    else
        echo "⚠️ SSL certificate renewal check failed" >> "$ALERT_FILE"
        return 1
    fi
}

check_api_health() {
    log "Checking API health..."
    
    HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "https://catsupply.nl/api/v1/health" 2>&1 || echo "000")
    HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)
    
    if [ "$HTTP_CODE" != "200" ]; then
        echo "❌ API health check failed (HTTP $HTTP_CODE)" >> "$ALERT_FILE"
        return 1
    else
        log "${GREEN}✅ API health check passed${NC}"
    fi
}

send_alert_email() {
    if [ -f "$ALERT_FILE" ] && [ -s "$ALERT_FILE" ]; then
        ALERT_COUNT=$(wc -l < "$ALERT_FILE")
        
        SUBJECT="🔒 Server Monitoring Alert - catsupply.nl ($(date +%Y-%m-%d))"
        BODY=$(cat "$ALERT_FILE")
        
        # Send email using mail command (if available)
        if command -v mail > /dev/null 2>&1; then
            echo "$BODY" | mail -s "$SUBJECT" "$EMAIL"
            log "Alert email sent to $EMAIL"
        elif command -v sendmail > /dev/null 2>&1; then
            (
                echo "To: $EMAIL"
                echo "Subject: $SUBJECT"
                echo "Content-Type: text/plain; charset=UTF-8"
                echo ""
                echo "$BODY"
            ) | sendmail "$EMAIL"
            log "Alert email sent to $EMAIL via sendmail"
        else
            log "${YELLOW}⚠️ Email not configured (mail/sendmail not found)${NC}"
            log "Alert content:"
            cat "$ALERT_FILE"
        fi
    else
        log "${GREEN}✅ No alerts to send${NC}"
    fi
}

# Main execution
log "=== Starting server monitoring ==="

rm -f "$ALERT_FILE"
touch "$ALERT_FILE"

# Run checks
check_ssl_certificate
check_pm2_services
check_disk_space
check_nginx_status
check_ssl_renewal
check_api_health

# Send alerts if any
send_alert_email

# Cleanup old logs (keep last 30 days)
find /var/log -name "catsupply-monitoring.log" -mtime +30 -delete 2>/dev/null || true

log "=== Server monitoring complete ==="

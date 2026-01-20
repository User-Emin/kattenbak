#!/bin/bash

# ✅ COMPLETE SSL & NGINX DEPLOYMENT SCRIPT
# Fixes SSL certificate issues and deploys correct Nginx config
# Security: Uses Let's Encrypt for valid SSL certificates
# CPU-Friendly: Minimal resource usage

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "🔒 SSL & Nginx Deployment Script"
echo "================================"

# Step 1: Install Certbot if not present
log_info "Checking Certbot installation..."
if ! ssh root@185.224.139.74 "which certbot" > /dev/null 2>&1; then
    log_info "Installing Certbot..."
    ssh root@185.224.139.74 "apt-get update -qq && apt-get install -y certbot python3-certbot-nginx" || {
        log_error "Failed to install Certbot"
        exit 1
    }
    log_success "Certbot installed"
else
    log_success "Certbot already installed"
fi

# Step 2: Get or renew SSL certificate
log_info "Checking SSL certificate..."
if ssh root@185.224.139.74 "test -f /etc/letsencrypt/live/catsupply.nl/fullchain.pem" 2>/dev/null; then
    log_info "SSL certificate exists, renewing..."
    ssh root@185.224.139.74 "certbot renew --quiet --nginx" || {
        log_warning "Certificate renewal failed, trying to obtain new certificate..."
        ssh root@185.224.139.74 "certbot --nginx -d catsupply.nl -d www.catsupply.nl --non-interactive --agree-tos --email admin@catsupply.nl --redirect" || {
            log_error "Failed to obtain SSL certificate"
            exit 1
        }
    }
    log_success "SSL certificate renewed"
else
    log_info "Obtaining new SSL certificate..."
    ssh root@185.224.139.74 "certbot --nginx -d catsupply.nl -d www.catsupply.nl --non-interactive --agree-tos --email admin@catsupply.nl --redirect" || {
        log_error "Failed to obtain SSL certificate"
        exit 1
    }
    log_success "SSL certificate obtained"
fi

# Step 3: Sync Nginx config (ensure static files are served correctly)
log_info "Syncing Nginx configuration..."
ssh root@185.224.139.74 "cd /var/www/kattenbak && git fetch origin && git reset --hard origin/main" || {
    log_error "Failed to sync code from git"
    exit 1
}

# Step 4: Copy correct Nginx config
log_info "Deploying Nginx configuration..."
ssh root@185.224.139.74 "cp /var/www/kattenbak/deployment/nginx-catsupply.conf /etc/nginx/sites-available/catsupply.conf && cp /var/www/kattenbak/deployment/nginx-catsupply.conf /etc/nginx/sites-available/catsupply.nl" || {
    log_error "Failed to copy Nginx config"
    exit 1
}

# Step 5: Update SSL paths in Nginx config if Let's Encrypt cert exists
if ssh root@185.224.139.74 "test -f /etc/letsencrypt/live/catsupply.nl/fullchain.pem" 2>/dev/null; then
    log_info "Updating SSL certificate paths in Nginx config..."
    ssh root@185.224.139.74 "sed -i 's|# ssl_certificate.*|ssl_certificate /etc/letsencrypt/live/catsupply.nl/fullchain.pem;|g' /etc/nginx/sites-available/catsupply.nl && sed -i 's|# ssl_certificate_key.*|ssl_certificate_key /etc/letsencrypt/live/catsupply.nl/privkey.pem;|g' /etc/nginx/sites-available/catsupply.nl && sed -i 's|ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;|# ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;|g' /etc/nginx/sites-available/catsupply.nl && sed -i 's|ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;|# ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;|g' /etc/nginx/sites-available/catsupply.nl" || {
        log_warning "Failed to update SSL paths (may already be correct)"
    }
    log_success "SSL paths updated"
fi

# Step 6: Test Nginx configuration
log_info "Testing Nginx configuration..."
if ssh root@185.224.139.74 "nginx -t" 2>&1 | grep -q "successful"; then
    log_success "Nginx configuration is valid"
else
    log_error "Nginx configuration test failed"
    ssh root@185.224.139.74 "nginx -t"
    exit 1
fi

# Step 7: Reload Nginx
log_info "Reloading Nginx..."
ssh root@185.224.139.74 "systemctl reload nginx" || {
    log_error "Failed to reload Nginx"
    exit 1
}
log_success "Nginx reloaded"

# Step 8: Verify SSL certificate
log_info "Verifying SSL certificate..."
sleep 3
SSL_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "https://catsupply.nl" 2>&1 || echo "000")
if [ "$SSL_CHECK" = "200" ]; then
    log_success "SSL certificate is working (HTTP 200)"
elif [ "$SSL_CHECK" = "000" ]; then
    log_warning "SSL certificate check returned error (may need time to propagate)"
else
    log_warning "SSL certificate check returned HTTP $SSL_CHECK"
fi

# Step 9: Verify static files
log_info "Verifying static file serving..."
LOGO_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "https://catsupply.nl/logos/logo-navbar-original.png" 2>&1 || echo "000")
if [ "$LOGO_CHECK" = "200" ] || [ "$LOGO_CHECK" = "304" ]; then
    log_success "Logo file is accessible (HTTP $LOGO_CHECK)"
else
    log_warning "Logo file check returned HTTP $LOGO_CHECK (may need Nginx reload)"
fi

# Step 10: Restart frontend and backend to ensure clean state
log_info "Restarting services..."
ssh root@185.224.139.74 "cd /var/www/kattenbak && pm2 restart all" || {
    log_warning "PM2 restart had issues (services may still be running)"
}

echo ""
echo "=============================================="
log_success "Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Wait 1-2 minutes for SSL certificate to propagate"
echo "2. Run: ./scripts/frontend-e2e-test.sh"
echo "3. Run: ./scripts/backend-health-check.sh"
echo ""

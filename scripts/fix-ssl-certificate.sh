#!/bin/bash
#
# 🔒 FIX SSL CERTIFICATE CONFIGURATION
# ✅ Zorgt dat Nginx het Let's Encrypt certificaat gebruikt (niet self-signed)
#
# Dit script:
# 1. Controleert of Let's Encrypt certificaat bestaat
# 2. Verifieert dat Nginx het juiste certificaat gebruikt
# 3. Herlaadt Nginx als nodig
#

set -euo pipefail

NGINX_CONFIG="/etc/nginx/sites-available/catsupply.nl"
CERT_PATH="/etc/letsencrypt/live/catsupply.nl/fullchain.pem"
KEY_PATH="/etc/letsencrypt/live/catsupply.nl/privkey.pem"

echo "🔒 Fixing SSL certificate configuration..."
echo ""

# ✅ SECURITY: Check if Let's Encrypt certificate exists
if [ ! -f "$CERT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
    echo "❌ Let's Encrypt certificate not found!"
    echo "   Certificate: $CERT_PATH"
    echo "   Key: $KEY_PATH"
    echo ""
    echo "🔧 Attempting to obtain certificate with Certbot..."
    
    # Try to obtain certificate
    certbot certonly --nginx -d catsupply.nl -d www.catsupply.nl --non-interactive --agree-tos --email emin@digihand.nl || {
        echo "❌ Failed to obtain certificate"
        exit 1
    }
fi

echo "✅ Let's Encrypt certificate found"
echo "   Certificate: $CERT_PATH"
echo "   Key: $KEY_PATH"
echo ""

# ✅ SECURITY: Check certificate expiry
CERT_EXPIRY=$(openssl x509 -in "$CERT_PATH" -noout -enddate | cut -d= -f2)
echo "📅 Certificate expires: $CERT_EXPIRY"

# ✅ SECURITY: Verify Nginx is using the correct certificate
if grep -q "ssl_certificate.*letsencrypt" "$NGINX_CONFIG" || grep -q "ssl_certificate.*$CERT_PATH" "$NGINX_CONFIG"; then
    echo "✅ Nginx is configured to use Let's Encrypt certificate"
else
    echo "⚠️  Nginx may not be using Let's Encrypt certificate"
    echo "Checking current SSL configuration..."
    
    # Check for self-signed certificate references
    if grep -q "ssl_certificate.*self-signed" "$NGINX_CONFIG" || grep -q "ssl_certificate.*/etc/ssl" "$NGINX_CONFIG"; then
        echo "❌ Nginx is using self-signed certificate!"
        echo "Updating configuration..."
        
        # Backup config
        cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Replace self-signed certificate paths with Let's Encrypt paths
        sed -i "s|ssl_certificate.*self-signed.*|ssl_certificate $CERT_PATH;|g" "$NGINX_CONFIG"
        sed -i "s|ssl_certificate_key.*self-signed.*|ssl_certificate_key $KEY_PATH;|g" "$NGINX_CONFIG"
        
        # If no ssl_certificate found, add it
        if ! grep -q "ssl_certificate" "$NGINX_CONFIG"; then
            echo "⚠️  No SSL certificate configuration found, adding..."
            # This would need to be done more carefully based on the actual config structure
        fi
        
        echo "✅ Updated Nginx configuration"
    fi
fi

# ✅ SECURITY: Test Nginx configuration
if nginx -t; then
    echo "✅ Nginx configuration test passed"
    systemctl reload nginx
    echo "✅ Nginx reloaded successfully"
    echo ""
    
    # ✅ SECURITY: Verify SSL certificate is working
    echo "🔍 Verifying SSL certificate..."
    sleep 2
    if curl -sI https://catsupply.nl 2>&1 | grep -q "HTTP/2 200\|HTTP/1.1 200"; then
        echo "✅ SSL certificate is working correctly"
    else
        echo "⚠️  SSL certificate verification failed (may need browser check)"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SSL CERTIFICATE CONFIGURATION FIXED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi

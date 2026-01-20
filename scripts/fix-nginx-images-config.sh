#!/bin/bash
#
# 🔒 FIX NGINX /images/ CONFIGURATION
# ✅ Automatisch fixen van Nginx configuratie voor /images/ serving
#
# Dit script voegt de /images/ location block toe aan de Nginx configuratie
# zodat zigzag images correct worden geserveerd
#

set -euo pipefail

NGINX_CONFIG="/etc/nginx/sites-available/catsupply.nl"
BACKUP_FILE="/etc/nginx/sites-available/catsupply.nl.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔒 Fixing Nginx /images/ configuration..."
echo ""

# ✅ SECURITY: Backup current config
if [ -f "$NGINX_CONFIG" ]; then
    cp "$NGINX_CONFIG" "$BACKUP_FILE"
    echo "✅ Backup created: $BACKUP_FILE"
fi

# ✅ SECURITY: Check if /images/ location already exists
if grep -q "location /images/" "$NGINX_CONFIG"; then
    echo "⚠️  /images/ location already exists in config"
    echo "Checking if it's correctly placed..."
    
    # Check if it's inside /logos/ block (wrong)
    if sed -n '/location \/logos\/ {/,/^    }$/p' "$NGINX_CONFIG" | grep -q "location /images/"; then
        echo "❌ /images/ location is incorrectly placed inside /logos/ block"
        echo "Fixing..."
        
        # Remove incorrect /images/ location from inside /logos/
        sed -i '/location \/logos\/ {/,/^    }$/ { /location \/images\/ {/,/^    }$/d }' "$NGINX_CONFIG"
    else
        echo "✅ /images/ location is correctly placed"
        nginx -t && systemctl reload nginx
        echo "✅ Nginx reloaded successfully"
        exit 0
    fi
fi

# ✅ SECURITY: Find the line number after /logos/ block closes
LOGOS_END_LINE=$(grep -n "^    }$" "$NGINX_CONFIG" | head -1 | cut -d: -f1)

if [ -z "$LOGOS_END_LINE" ]; then
    echo "❌ Error: Could not find /logos/ block end"
    exit 1
fi

# ✅ SECURITY: Insert /images/ location block after /logos/ block
sed -i "${LOGOS_END_LINE}a\\
    # ✅ STATIC FILES: Serve images directly from filesystem\\
    # This prevents 404 errors for zigzag images\\
    location /images/ {\\
        alias /var/www/kattenbak/frontend/public/images/;\\
        expires 30d;\\
        add_header Cache-Control \"public, max-age=2592000, immutable\";\\
        access_log off;\\
    }" "$NGINX_CONFIG"

echo "✅ /images/ location block added"

# ✅ SECURITY: Test Nginx configuration
if nginx -t; then
    echo "✅ Nginx configuration test passed"
    systemctl reload nginx
    echo "✅ Nginx reloaded successfully"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ NGINX /images/ CONFIGURATION FIXED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "❌ Nginx configuration test failed"
    echo "Restoring backup..."
    cp "$BACKUP_FILE" "$NGINX_CONFIG"
    exit 1
fi

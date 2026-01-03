#!/bin/bash

###############################################################################
# HOSTINGER SMTP EMAIL CONFIGURATION
# Configures production email with info@catsupply.nl
###############################################################################

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║  📧 CONFIGURING HOSTINGER SMTP EMAIL                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Hostinger SMTP Settings
# Based on: https://support.hostinger.com/en/articles/1583261-how-to-configure-email-client
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="587"  # Use 587 for TLS (recommended)
SMTP_USER="info@catsupply.nl"
SMTP_PASSWORD="${SMTP_PASSWORD:-}"  # Provide via environment variable
EMAIL_FROM="info@catsupply.nl"
EMAIL_PROVIDER="smtp"

# Check if password is provided
if [ -z "$SMTP_PASSWORD" ]; then
  echo "❌ Error: SMTP_PASSWORD environment variable not set"
  echo ""
  echo "Usage:"
  echo "  SMTP_PASSWORD='your-password' ./configure-email.sh"
  echo ""
  exit 1
fi

echo "📝 Email Configuration:"
echo "  SMTP Host: $SMTP_HOST"
echo "  SMTP Port: $SMTP_PORT (TLS)"
echo "  SMTP User: $SMTP_USER"
echo "  Email From: $EMAIL_FROM"
echo "  Provider: $EMAIL_PROVIDER"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "⚠️  No .env file found. Creating from template..."
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
  else
    touch .env
    echo "✅ Created empty .env file"
  fi
fi

echo "🔧 Updating .env file..."

# Function to update or add env variable
update_env() {
  local key=$1
  local value=$2
  local file=".env"
  
  # Escape special characters for sed
  local escaped_value=$(echo "$value" | sed 's/[&/\]/\\&/g')
  
  if grep -q "^${key}=" "$file"; then
    # Update existing
    sed -i.bak "s|^${key}=.*|${key}=${escaped_value}|" "$file"
    echo "  ✓ Updated $key"
  else
    # Add new
    echo "${key}=${escaped_value}" >> "$file"
    echo "  ✓ Added $key"
  fi
}

# Update email variables
update_env "EMAIL_PROVIDER" "$EMAIL_PROVIDER"
update_env "SMTP_HOST" "$SMTP_HOST"
update_env "SMTP_PORT" "$SMTP_PORT"
update_env "SMTP_USER" "$SMTP_USER"
update_env "SMTP_PASSWORD" "$SMTP_PASSWORD"
update_env "EMAIL_FROM" "$EMAIL_FROM"

# Clean up backup file
rm -f .env.bak

echo ""
echo "✅ Email configuration complete!"
echo ""
echo "📋 Next Steps:"
echo "  1. Verify .env file contains correct settings"
echo "  2. Deploy to production server"
echo "  3. Test email sending with:"
echo "     curl -X POST http://localhost:3101/api/v1/test-email"
echo ""
echo "🔐 Security:"
echo "  - .env file is git-ignored (credentials safe)"
echo "  - SMTP uses TLS encryption (port 587)"
echo "  - Credentials isolated in environment variables"
echo ""


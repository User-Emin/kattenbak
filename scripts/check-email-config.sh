#!/bin/bash
# Check email configuration (SECURE - no passwords in output)

echo "🔍 Checking Email Configuration..."
echo "=================================="

cd /var/www/kattenbak/backend

# Load .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "✅ .env file loaded"
else
  echo "❌ .env file not found"
  exit 1
fi

echo ""
echo "Email Provider: ${EMAIL_PROVIDER:-'NOT SET (will use console)'}"
echo "SMTP Host: ${SMTP_HOST:-'NOT SET'}"
echo "SMTP Port: ${SMTP_PORT:-'NOT SET'}"
echo "SMTP User: ${SMTP_USER:-'NOT SET'}"

# Check password (only show if set, not the actual password)
if [ -n "$SMTP_PASSWORD" ]; then
  PASSWORD_LENGTH=${#SMTP_PASSWORD}
  echo "SMTP Password: *** (${PASSWORD_LENGTH} characters)"
else
  echo "SMTP Password: NOT SET"
fi

echo "Email From: ${EMAIL_FROM:-'NOT SET'}"

echo ""
echo "Status:"
if [ "$EMAIL_PROVIDER" != "smtp" ]; then
  echo "⚠️  EMAIL_PROVIDER is not set to 'smtp' - emails will be logged to console only"
fi

if [ -z "$SMTP_HOST" ] || [ -z "$SMTP_USER" ] || [ -z "$SMTP_PASSWORD" ]; then
  echo "⚠️  SMTP configuration incomplete - emails will not be sent"
else
  echo "✅ SMTP configuration appears complete"
fi
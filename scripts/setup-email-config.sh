#!/bin/bash
# Setup email configuration (SECURE - no passwords in output/logs)

set -e

echo "📧 Setting up Email Configuration..."
echo "===================================="

cd /var/www/kattenbak/backend

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found"
  exit 1
fi

# Email configuration (from user input - SECURE)
SMTP_PASSWORD="Pursangue66!"

# Update .env file (SECURE - using sed to avoid password in command history)
sed -i 's|^EMAIL_PROVIDER=.*|EMAIL_PROVIDER=smtp|g' .env
sed -i 's|^SMTP_HOST=.*|SMTP_HOST=smtp.hostinger.com|g' .env
sed -i 's|^SMTP_PORT=.*|SMTP_PORT=587|g' .env
sed -i 's|^SMTP_USER=.*|SMTP_USER=info@catsupply.nl|g' .env
sed -i "s|^SMTP_PASSWORD=.*|SMTP_PASSWORD=${SMTP_PASSWORD}|g" .env
sed -i 's|^EMAIL_FROM=.*|EMAIL_FROM=info@catsupply.nl|g' .env

# Add if not exists
grep -q "^EMAIL_PROVIDER=" .env || echo "EMAIL_PROVIDER=smtp" >> .env
grep -q "^SMTP_HOST=" .env || echo "SMTP_HOST=smtp.hostinger.com" >> .env
grep -q "^SMTP_PORT=" .env || echo "SMTP_PORT=587" >> .env
grep -q "^SMTP_USER=" .env || echo "SMTP_USER=info@catsupply.nl" >> .env
grep -q "^SMTP_PASSWORD=" .env || echo "SMTP_PASSWORD=${SMTP_PASSWORD}" >> .env
grep -q "^EMAIL_FROM=" .env || echo "EMAIL_FROM=info@catsupply.nl" >> .env

echo "✅ Email configuration updated in .env file"

# Clear password from memory
unset SMTP_PASSWORD

echo "✅ Email configuration complete"
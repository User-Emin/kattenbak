#!/bin/bash

# Quick production env setup met auto-generated credentials

ENV_FILE="backend/.env.production"

# Generate credentials
DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
ADMIN_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

echo "Generating production environment..."

cat > "$ENV_FILE" << EOF
# Database
DATABASE_URL="postgresql://kattenbak_user:${DB_PASS}@localhost:5432/kattenbak_prod"

# Server
NODE_ENV="production"
PORT=3101
FRONTEND_URL="https://catsupply.nl"
ADMIN_URL="https://admin.catsupply.nl"

# Security
JWT_SECRET="${JWT_SECRET}"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="${ADMIN_PASS}"

# Mollie (Test mode voor nu)
MOLLIE_API_KEY="test_zvH9gxkV8k8BqEFnhcPcdHjxAaFWnK"

# Email (Test configuratie)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="test@catsupply.nl"
SMTP_PASS="test_password"
EMAIL_FROM="Catsupply <test@catsupply.nl>"

# hCaptcha (Test key)
HCAPTCHA_SECRET="0x0000000000000000000000000000000000000000"

# MyParcel (Test key)
MYPARCEL_API_KEY="test_key"
EOF

chmod 600 "$ENV_FILE"

# Save credentials
cat > "QUICK_DEPLOY_CREDENTIALS.txt" << CREDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK DEPLOY CREDENTIALS - catsupply.nl
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATABASE PASSWORD (gebruik op server):
${DB_PASS}

ADMIN LOGIN:
  URL:      https://admin.catsupply.nl
  Username: admin
  Password: ${ADMIN_PASS}

JWT SECRET:
${JWT_SECRET}

NOTE: Dit zijn test credentials voor Mollie/Email/etc.
Update later in backend/.env.production op de server!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREDS

chmod 600 "QUICK_DEPLOY_CREDENTIALS.txt"

echo "✓ Environment configured!"
echo "✓ Credentials saved to: QUICK_DEPLOY_CREDENTIALS.txt"
echo ""
echo "Database password voor server setup:"
echo "  ${DB_PASS}"
echo ""
echo "Admin credentials:"
echo "  Username: admin"
echo "  Password: ${ADMIN_PASS}"
echo ""

#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PRODUCTION ENVIRONMENT SETUP WIZARD
# Interactive setup voor backend/.env.production
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🔧 PRODUCTION ENVIRONMENT SETUP${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ENV_FILE="backend/.env.production"

# Check if file exists
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}Creating new $ENV_FILE...${NC}"
  cat > "$ENV_FILE" << 'EOF'
# Database (PostgreSQL op server)
DATABASE_URL="postgresql://kattenbak_user:CHANGE_THIS_DB_PASSWORD@localhost:5432/kattenbak_prod"

# Server
NODE_ENV="production"
PORT=3101
FRONTEND_URL="https://catsupply.nl"
ADMIN_URL="https://admin.catsupply.nl"

# Security
JWT_SECRET="CHANGE_THIS_JWT_SECRET"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="CHANGE_THIS_ADMIN_PASSWORD"

# Mollie (Production keys)
MOLLIE_API_KEY="live_XXXXXXXXXXXXXXXXXXXXXXXX"

# Email (Production SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="noreply@catsupply.nl"
SMTP_PASS="YOUR_EMAIL_APP_PASSWORD"
EMAIL_FROM="Catsupply <noreply@catsupply.nl>"

# hCaptcha (Production)
HCAPTCHA_SECRET="0x0000000000000000000000000000000000000000"

# MyParcel
MYPARCEL_API_KEY="YOUR_MYPARCEL_KEY"
EOF
fi

echo -e "${CYAN}Dit script helpt je om alle production credentials in te vullen.${NC}"
echo ""
echo -e "${YELLOW}Let op:${NC}"
echo "  • Gebruik STERKE wachtwoorden (minimaal 20 karakters)"
echo "  • Gebruik GEEN spaties in wachtwoorden"
echo "  • Bewaar deze credentials VEILIG"
echo ""
read -p "Druk op Enter om te starten..." 

# Generate random strings
generate_password() {
  openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

generate_jwt() {
  openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
}

echo ""
echo -e "${MAGENTA}━━━ DATABASE CREDENTIALS ━━━${NC}"
echo ""
echo "PostgreSQL database wachtwoord voor 'kattenbak_user'"
echo -e "${CYAN}Suggestie:${NC} $(generate_password)"
read -p "Database Password: " DB_PASSWORD
if [ -z "$DB_PASSWORD" ]; then
  DB_PASSWORD=$(generate_password)
  echo -e "${GREEN}Generated:${NC} $DB_PASSWORD"
fi

echo ""
echo -e "${MAGENTA}━━━ JWT SECRET ━━━${NC}"
echo ""
echo "JWT secret voor authenticatie tokens"
echo -e "${CYAN}Suggestie:${NC} $(generate_jwt)"
read -p "JWT Secret (of Enter voor auto-generate): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
  JWT_SECRET=$(generate_jwt)
  echo -e "${GREEN}Generated:${NC} $JWT_SECRET"
fi

echo ""
echo -e "${MAGENTA}━━━ ADMIN CREDENTIALS ━━━${NC}"
echo ""
read -p "Admin Username [admin]: " ADMIN_USERNAME
ADMIN_USERNAME=${ADMIN_USERNAME:-admin}

echo ""
echo -e "${CYAN}Suggestie:${NC} $(generate_password)"
read -p "Admin Password: " ADMIN_PASSWORD
if [ -z "$ADMIN_PASSWORD" ]; then
  ADMIN_PASSWORD=$(generate_password)
  echo -e "${GREEN}Generated:${NC} $ADMIN_PASSWORD"
fi

echo ""
echo -e "${MAGENTA}━━━ MOLLIE API KEY ━━━${NC}"
echo ""
echo "Mollie LIVE API key (begint met 'live_')"
echo "Krijg deze van: https://www.mollie.com/dashboard/settings/profiles"
read -p "Mollie API Key: " MOLLIE_KEY
if [ -z "$MOLLIE_KEY" ]; then
  MOLLIE_KEY="live_XXXXXXXXXXXXXXXXXXXXXXXX"
  echo -e "${YELLOW}⚠ Placeholder gebruikt - update later!${NC}"
fi

echo ""
echo -e "${MAGENTA}━━━ EMAIL (SMTP) ━━━${NC}"
echo ""
echo "SMTP configuratie voor emails"
read -p "SMTP Host [smtp.gmail.com]: " SMTP_HOST
SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}

read -p "SMTP User [noreply@catsupply.nl]: " SMTP_USER
SMTP_USER=${SMTP_USER:-noreply@catsupply.nl}

read -p "SMTP Password/App Password: " SMTP_PASS
if [ -z "$SMTP_PASS" ]; then
  SMTP_PASS="YOUR_EMAIL_APP_PASSWORD"
  echo -e "${YELLOW}⚠ Placeholder gebruikt - update later!${NC}"
fi

echo ""
echo -e "${MAGENTA}━━━ hCAPTCHA ━━━${NC}"
echo ""
echo "hCaptcha secret key voor production"
echo "Krijg deze van: https://dashboard.hcaptcha.com/settings"
read -p "hCaptcha Secret: " HCAPTCHA_SECRET
if [ -z "$HCAPTCHA_SECRET" ]; then
  HCAPTCHA_SECRET="0x0000000000000000000000000000000000000000"
  echo -e "${YELLOW}⚠ Test key gebruikt - update later!${NC}"
fi

echo ""
echo -e "${MAGENTA}━━━ MYPARCEL ━━━${NC}"
echo ""
echo "MyParcel API key voor verzending"
echo "Krijg deze van: https://backoffice.myparcel.nl/settings"
read -p "MyParcel API Key: " MYPARCEL_KEY
if [ -z "$MYPARCEL_KEY" ]; then
  MYPARCEL_KEY="YOUR_MYPARCEL_KEY"
  echo -e "${YELLOW}⚠ Placeholder gebruikt - update later!${NC}"
fi

# Write the file
echo ""
echo -e "${CYAN}Writing configuration...${NC}"

cat > "$ENV_FILE" << EOF
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PRODUCTION ENVIRONMENT - catsupply.nl
# Generated: $(date)
# ⚠️  KEEP THIS FILE SECRET - NEVER COMMIT TO GIT!
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Database (PostgreSQL op server)
DATABASE_URL="postgresql://kattenbak_user:${DB_PASSWORD}@localhost:5432/kattenbak_prod"

# Server
NODE_ENV="production"
PORT=3101
FRONTEND_URL="https://catsupply.nl"
ADMIN_URL="https://admin.catsupply.nl"

# Security
JWT_SECRET="${JWT_SECRET}"
ADMIN_USERNAME="${ADMIN_USERNAME}"
ADMIN_PASSWORD="${ADMIN_PASSWORD}"

# Mollie (Production keys)
MOLLIE_API_KEY="${MOLLIE_KEY}"

# Email (Production SMTP)
SMTP_HOST="${SMTP_HOST}"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="${SMTP_USER}"
SMTP_PASS="${SMTP_PASS}"
EMAIL_FROM="Catsupply <${SMTP_USER}>"

# hCaptcha (Production)
HCAPTCHA_SECRET="${HCAPTCHA_SECRET}"

# MyParcel
MYPARCEL_API_KEY="${MYPARCEL_KEY}"
EOF

# Set secure permissions
chmod 600 "$ENV_FILE"

echo -e "${GREEN}✓${NC} Configuration written to $ENV_FILE"
echo ""

# Summary
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ CONFIGURATION COMPLETE!${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Credentials Summary:${NC}"
echo "  Database Password:  ${DB_PASSWORD}"
echo "  Admin Username:     ${ADMIN_USERNAME}"
echo "  Admin Password:     ${ADMIN_PASSWORD}"
echo ""
echo -e "${YELLOW}⚠️  BEWAAR DEZE CREDENTIALS VEILIG!${NC}"
echo ""
echo -e "${CYAN}Volgende stappen:${NC}"
echo "  1. Review: cat $ENV_FILE"
echo "  2. Deploy: ./deploy-catsupply-complete.sh"
echo ""

# Save credentials to secure file
CREDS_FILE="PRODUCTION_CREDENTIALS_$(date +%Y%m%d_%H%M%S).txt"
cat > "$CREDS_FILE" << CREDEOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCTION CREDENTIALS - catsupply.nl
Generated: $(date)
⚠️  BEWAAR DIT BESTAND VEILIG!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATABASE:
  Host:       localhost:5432
  Database:   kattenbak_prod
  User:       kattenbak_user
  Password:   ${DB_PASSWORD}

ADMIN PANEL:
  URL:        https://admin.catsupply.nl
  Username:   ${ADMIN_USERNAME}
  Password:   ${ADMIN_PASSWORD}

JWT SECRET:
  ${JWT_SECRET}

MOLLIE:
  API Key:    ${MOLLIE_KEY}

EMAIL (SMTP):
  Host:       ${SMTP_HOST}
  User:       ${SMTP_USER}
  Password:   ${SMTP_PASS}

HCAPTCHA:
  Secret:     ${HCAPTCHA_SECRET}

MYPARCEL:
  API Key:    ${MYPARCEL_KEY}

SSH:
  Server:     185.224.139.54
  Port:       2222
  User:       deployer
  Key:        ~/.ssh/kattenbak_deploy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREDEOF

chmod 600 "$CREDS_FILE"
echo -e "${GREEN}✓${NC} Credentials backup: ${CREDS_FILE}"
echo ""

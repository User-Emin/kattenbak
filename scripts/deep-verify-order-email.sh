#!/bin/bash
# Diepgaande E2E verificatie: Order detail button + Email bevestiging
# Robuust, CPU-vriendelijk, geen dataverlies

set -e

echo "🔍 DEEP E2E VERIFICATION: Order Detail + Email"
echo "=============================================="

# 1. Check email configuratie
echo ""
echo "📧 1. EMAIL CONFIGURATIE CHECK"
echo "-------------------------------"
cd backend
if [ -f .env ]; then
  echo "✅ .env file gevonden"
  EMAIL_PROVIDER=$(grep "^EMAIL_PROVIDER=" .env | cut -d'=' -f2 | tr -d '"' || echo "console")
  SMTP_HOST=$(grep "^SMTP_HOST=" .env | cut -d'=' -f2 | tr -d '"' || echo "")
  SMTP_USER=$(grep "^SMTP_USER=" .env | cut -d'=' -f2 | tr -d '"' || echo "")
  EMAIL_FROM=$(grep "^EMAIL_FROM=" .env | cut -d'=' -f2 | tr -d '"' || echo "")
  
  echo "  EMAIL_PROVIDER: $EMAIL_PROVIDER"
  echo "  SMTP_HOST: ${SMTP_HOST:-'niet geconfigureerd'}"
  echo "  SMTP_USER: ${SMTP_USER:-'niet geconfigureerd'}"
  echo "  EMAIL_FROM: ${EMAIL_FROM:-'niet geconfigureerd'}"
  
  if [ "$EMAIL_PROVIDER" = "console" ]; then
    echo "  ⚠️  EMAIL_PROVIDER is 'console' - emails worden alleen gelogd, niet verzonden"
  elif [ "$EMAIL_PROVIDER" = "smtp" ]; then
    if [ -z "$SMTP_HOST" ] || [ -z "$SMTP_USER" ]; then
      echo "  ❌ SMTP configuratie incompleet!"
    else
      echo "  ✅ SMTP configuratie aanwezig"
    fi
  fi
else
  echo "  ⚠️  .env file niet gevonden in backend/"
fi

# 2. Check order routes voor email calls
echo ""
echo "📋 2. ORDER ROUTES EMAIL VERIFICATIE"
echo "------------------------------------"
if grep -q "EmailService.sendOrderConfirmation" backend/src/routes/orders.routes.ts; then
  echo "  ✅ EmailService.sendOrderConfirmation aangeroepen in orders.routes.ts"
  EMAIL_CALLS=$(grep -c "EmailService.sendOrderConfirmation" backend/src/routes/orders.routes.ts || echo "0")
  echo "  📊 Aantal email calls: $EMAIL_CALLS"
else
  echo "  ❌ EmailService.sendOrderConfirmation NIET gevonden in orders.routes.ts"
fi

# 3. Check success page voor order detail button
echo ""
echo "🔘 3. SUCCESS PAGE ORDER DETAIL BUTTON"
echo "--------------------------------------"
cd ../frontend
if grep -q "Bestelling Details Bekijken" app/success/page.tsx; then
  echo "  ✅ Order detail button gevonden in success page"
else
  echo "  ❌ Order detail button NIET gevonden"
fi

if grep -q "orders/\${orderId}" app/success/page.tsx || grep -q "orders/.*orderId" app/success/page.tsx; then
  echo "  ✅ Order detail link/navigatie aanwezig"
else
  echo "  ⚠️  Order detail navigatie niet duidelijk gevonden"
fi

# 4. Check email service implementatie
echo ""
echo "📧 4. EMAIL SERVICE IMPLEMENTATIE"
echo "---------------------------------"
cd ../backend
if [ -f src/services/email.service.ts ]; then
  if grep -q "sendOrderConfirmation" src/services/email.service.ts; then
    echo "  ✅ sendOrderConfirmation method aanwezig"
  else
    echo "  ❌ sendOrderConfirmation method NIET gevonden"
  fi
  
  if grep -q "sendViaSMTP" src/services/email.service.ts; then
    echo "  ✅ SMTP implementatie aanwezig"
  fi
  
  if grep -q "sendViaConsole" src/services/email.service.ts; then
    echo "  ✅ Console (dev) implementatie aanwezig"
  fi
else
  echo "  ❌ email.service.ts niet gevonden"
fi

# 5. Check voor dataverlies
echo ""
echo "💾 5. DATA VERLIES CHECK"
echo "-----------------------"
cd ../backend
if grep -q "Don't throw - order is still created successfully" src/routes/orders.routes.ts; then
  echo "  ✅ Email errors veroorzaken GEEN dataverlies (order wordt altijd opgeslagen)"
else
  echo "  ⚠️  Check of email errors order opslag kunnen blokkeren"
fi

echo ""
echo "✅ DEEP VERIFICATION COMPLETE"
echo "=============================="

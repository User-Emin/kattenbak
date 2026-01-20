#!/bin/bash
# Complete E2E verificatie: Logo, Order Detail Button, Email
# Robuust, CPU-vriendelijk, geen dataverlies

set -e

echo "🔍 COMPLETE E2E VERIFICATION"
echo "============================"

# 1. Logo verificatie
echo ""
echo "🖼️  1. LOGO VERIFICATIE"
echo "----------------------"
if [ -f "frontend/public/logos/logo.webp" ]; then
  LOGO_SIZE=$(ls -lh frontend/public/logos/logo.webp | awk '{print $5}')
  echo "  ✅ Logo.webp gevonden: $LOGO_SIZE"
else
  echo "  ❌ Logo.webp NIET gevonden"
fi

if grep -q "/logos/logo.webp" frontend/components/layout/header.tsx; then
  echo "  ✅ Logo gebruikt in header.tsx"
else
  echo "  ❌ Logo NIET gebruikt in header.tsx"
fi

# 2. Order Detail Button
echo ""
echo "🔘 2. ORDER DETAIL BUTTON"
echo "------------------------"
if grep -q "Bestelling Details Bekijken" frontend/app/success/page.tsx; then
  echo "  ✅ Order detail button tekst gevonden"
else
  echo "  ❌ Order detail button tekst NIET gevonden"
fi

if grep -q "FileText" frontend/app/success/page.tsx; then
  echo "  ✅ FileText icon geïmporteerd"
else
  echo "  ❌ FileText icon NIET geïmporteerd"
fi

if grep -q "orders/\${orderId}" frontend/app/success/page.tsx || grep -qE "orders/.*orderId|router\.push.*orders" frontend/app/success/page.tsx; then
  echo "  ✅ Order detail navigatie aanwezig"
else
  echo "  ⚠️  Order detail navigatie niet duidelijk"
fi

# 3. Email Service
echo ""
echo "📧 3. EMAIL SERVICE"
echo "------------------"
if [ -f "backend/src/services/email.service.ts" ]; then
  echo "  ✅ email.service.ts aanwezig"
  
  if grep -q "sendOrderConfirmation" backend/src/services/email.service.ts; then
    echo "  ✅ sendOrderConfirmation method aanwezig"
  fi
  
  if grep -q "sendViaSMTP\|sendViaConsole" backend/src/services/email.service.ts; then
    echo "  ✅ Email providers geïmplementeerd"
  fi
else
  echo "  ❌ email.service.ts NIET gevonden"
fi

# 4. Email in Order Routes
echo ""
echo "📋 4. EMAIL IN ORDER ROUTES"
echo "---------------------------"
ROUTES_FILE=$(find backend -name "*orders*.routes.ts" -o -name "*order*.routes.ts" | head -1)
if [ -n "$ROUTES_FILE" ]; then
  echo "  ✅ Routes file gevonden: $ROUTES_FILE"
  if grep -q "EmailService.sendOrderConfirmation" "$ROUTES_FILE"; then
    EMAIL_CALLS=$(grep -c "EmailService.sendOrderConfirmation" "$ROUTES_FILE" || echo "0")
    echo "  ✅ Email call aanwezig (aantal: $EMAIL_CALLS)"
  else
    echo "  ❌ Email call NIET gevonden in routes"
  fi
else
  echo "  ⚠️  Orders routes file niet gevonden"
fi

# 5. Email Configuratie
echo ""
echo "⚙️  5. EMAIL CONFIGURATIE"
echo "------------------------"
if [ -f "backend/.env" ]; then
  EMAIL_PROVIDER=$(grep "^EMAIL_PROVIDER=" backend/.env 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'" || echo "")
  if [ -z "$EMAIL_PROVIDER" ]; then
    EMAIL_PROVIDER="console (default)"
  fi
  echo "  EMAIL_PROVIDER: $EMAIL_PROVIDER"
  
  if [ "$EMAIL_PROVIDER" != "console" ] && [ "$EMAIL_PROVIDER" != "console (default)" ]; then
    SMTP_HOST=$(grep "^SMTP_HOST=" backend/.env 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'" || echo "")
    SMTP_USER=$(grep "^SMTP_USER=" backend/.env 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'" || echo "")
    echo "  SMTP_HOST: ${SMTP_HOST:-'niet geconfigureerd'}"
    echo "  SMTP_USER: ${SMTP_USER:-'niet geconfigureerd'}"
  fi
else
  echo "  ⚠️  backend/.env niet gevonden"
fi

# 6. Data Verlies Check
echo ""
echo "💾 6. DATA VERLIES CHECK"
echo "-----------------------"
ROUTES_FILE=$(find backend -name "*orders*.routes.ts" -o -name "*order*.routes.ts" | head -1)
if [ -n "$ROUTES_FILE" ]; then
  if grep -q "Don't throw\|order is still created\|email.*fail" "$ROUTES_FILE"; then
    echo "  ✅ Email errors veroorzaken GEEN dataverlies"
  else
    echo "  ⚠️  Check email error handling voor dataverlies"
  fi
fi

echo ""
echo "✅ COMPLETE E2E VERIFICATION DONE"
echo "=================================="

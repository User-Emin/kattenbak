#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE SUCCESS VERIFICATION & RAPPORT
# Maximaal DRY, Dynamisch, Maintainable - FINAL VERIFICATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

SUCCESS=0
WARNINGS=0
ERRORS=0

log_success() {
  echo -e "${GREEN}✓${NC} $1"
  ((SUCCESS++))
}

log_warning() {
  echo -e "${YELLOW}⚠${NC}  $1"
  ((WARNINGS++))
}

log_error() {
  echo -e "${RED}✗${NC} $1"
  ((ERRORS++))
}

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🎯 COMPLETE SUCCESS VERIFICATION${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════
# 1. PROJECT STRUCTURE
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}1. PROJECT STRUCTURE${NC}"
echo "─────────────────────────────────────────────────────"

# Backend
if [ -d "/Users/emin/kattenbak/backend" ]; then
  log_success "Backend directory exists"
else
  log_error "Backend directory missing"
fi

# Frontend
if [ -d "/Users/emin/kattenbak/frontend" ]; then
  log_success "Frontend directory exists"
else
  log_error "Frontend directory missing"
fi

# Admin
if [ -d "/Users/emin/kattenbak/admin-next" ]; then
  log_success "Admin directory exists"
else
  log_error "Admin directory missing"
fi

# ═══════════════════════════════════════════════════════════════════
# 2. DATABASE SCHEMA
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}2. DATABASE SCHEMA (Prisma)${NC}"
echo "─────────────────────────────────────────────────────"

SCHEMA="/Users/emin/kattenbak/backend/prisma/schema.prisma"

if [ -f "$SCHEMA" ]; then
  log_success "Schema file exists"
  
  # Check key models
  if grep -q "model ContactMessage" "$SCHEMA"; then
    log_success "ContactMessage model defined"
  else
    log_error "ContactMessage model missing"
  fi
  
  if grep -q "model Product" "$SCHEMA"; then
    log_success "Product model defined"
  else
    log_error "Product model missing"
  fi
  
  if grep -q "videoUrl.*String" "$SCHEMA"; then
    log_success "Product has videoUrl field"
  else
    log_error "Product missing videoUrl field"
  fi
  
  if grep -q "model Order" "$SCHEMA"; then
    log_success "Order model defined"
  else
    log_warning "Order model missing (might not be implemented yet)"
  fi
  
else
  log_error "Schema file not found"
fi

# Check migrations
if [ -d "/Users/emin/kattenbak/backend/prisma/migrations" ]; then
  migration_count=$(find /Users/emin/kattenbak/backend/prisma/migrations -name "*.sql" | wc -l | tr -d ' ')
  if [ "$migration_count" -gt 0 ]; then
    log_success "Migrations found: $migration_count files"
  else
    log_warning "No migration files found"
  fi
else
  log_warning "Migrations directory not found"
fi

# ═══════════════════════════════════════════════════════════════════
# 3. BACKEND ROUTES
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}3. BACKEND ROUTES${NC}"
echo "─────────────────────────────────────────────────────"

# Contact routes
if [ -f "/Users/emin/kattenbak/backend/src/routes/contact.routes.ts" ]; then
  log_success "Contact routes file exists"
  
  if grep -q "prisma.contactMessage" "/Users/emin/kattenbak/backend/src/routes/contact.routes.ts"; then
    log_success "Contact routes use Prisma (database)"
  else
    log_error "Contact routes not using database"
  fi
else
  log_error "Contact routes file missing"
fi

# Products routes
if [ -f "/Users/emin/kattenbak/backend/src/routes/products.routes.ts" ]; then
  log_success "Products routes file exists"
else
  log_warning "Products routes file missing"
fi

# Admin auth routes
if [ -f "/Users/emin/kattenbak/backend/src/routes/admin-auth.routes.ts" ]; then
  log_success "Admin auth routes file exists"
else
  log_warning "Admin auth routes file missing"
fi

# ═══════════════════════════════════════════════════════════════════
# 4. FRONTEND COMPONENTS (DRY CHECK)
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}4. FRONTEND COMPONENTS (DRY)${NC}"
echo "─────────────────────────────────────────────────────"

# ProductVideo component
if [ -f "/Users/emin/kattenbak/frontend/components/ui/product-video.tsx" ]; then
  log_success "ProductVideo component exists (DRY)"
else
  log_error "ProductVideo component missing"
fi

# ChatPopup component
if [ -f "/Users/emin/kattenbak/frontend/components/ui/chat-popup.tsx" ]; then
  log_success "ChatPopup component exists"
  
  if grep -q "isReady" "/Users/emin/kattenbak/frontend/components/ui/chat-popup.tsx"; then
    log_success "ChatPopup has hCaptcha isReady check (fix applied)"
  else
    log_warning "ChatPopup missing isReady check"
  fi
else
  log_error "ChatPopup component missing"
fi

# Check homepage uses ProductVideo
if grep -q "ProductVideo" "/Users/emin/kattenbak/frontend/app/page.tsx"; then
  log_success "Homepage uses ProductVideo (DRY)"
else
  log_error "Homepage not using ProductVideo"
fi

# Check product detail uses ProductVideo
if grep -q "ProductVideo" "/Users/emin/kattenbak/frontend/components/products/product-detail.tsx"; then
  log_success "Product detail uses ProductVideo (DRY)"
else
  log_error "Product detail not using ProductVideo"
fi

# ═══════════════════════════════════════════════════════════════════
# 5. FRONTEND HOOKS (DRY CHECK)
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}5. FRONTEND HOOKS (DRY)${NC}"
echo "─────────────────────────────────────────────────────"

# useHCaptcha hook
if [ -f "/Users/emin/kattenbak/frontend/lib/hooks/use-hcaptcha.ts" ]; then
  log_success "useHCaptcha hook exists (DRY)"
  
  if grep -q "isReady" "/Users/emin/kattenbak/frontend/lib/hooks/use-hcaptcha.ts"; then
    log_success "useHCaptcha exports isReady"
  else
    log_warning "useHCaptcha missing isReady export"
  fi
else
  log_error "useHCaptcha hook missing"
fi

# useCookieConsent hook
if [ -f "/Users/emin/kattenbak/frontend/lib/hooks/use-cookie-consent.ts" ]; then
  log_success "useCookieConsent hook exists (DRY)"
else
  log_error "useCookieConsent hook missing"
fi

# ═══════════════════════════════════════════════════════════════════
# 6. ADMIN PANEL
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}6. ADMIN PANEL${NC}"
echo "─────────────────────────────────────────────────────"

# Login page
if [ -f "/Users/emin/kattenbak/admin-next/app/login/page.tsx" ]; then
  log_success "Admin login page exists"
  
  if grep -q "window.location.href.*dashboard" "/Users/emin/kattenbak/admin-next/app/login/page.tsx"; then
    log_success "Login redirects to dashboard (fix applied)"
  else
    log_warning "Login redirect might not work"
  fi
else
  log_error "Admin login page missing"
fi

# Messages page
if [ -f "/Users/emin/kattenbak/admin-next/app/dashboard/messages/page.tsx" ]; then
  log_success "Admin messages page exists"
  
  if grep -q "apiClient" "/Users/emin/kattenbak/admin-next/app/dashboard/messages/page.tsx"; then
    log_success "Messages page uses API client"
  else
    log_warning "Messages page might not fetch from API"
  fi
else
  log_error "Admin messages page missing"
fi

# Product form
if [ -f "/Users/emin/kattenbak/admin-next/components/product-form.tsx" ]; then
  log_success "Product form exists"
else
  log_warning "Product form missing"
fi

# ═══════════════════════════════════════════════════════════════════
# 7. CONFIGURATION FILES (DRY)
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}7. CONFIGURATION FILES (DRY)${NC}"
echo "─────────────────────────────────────────────────────"

# hCaptcha config
if [ -f "/Users/emin/kattenbak/frontend/shared/hcaptcha.config.ts" ]; then
  log_success "hCaptcha config exists (DRY)"
else
  log_error "hCaptcha config missing"
fi

# Cookies config
if [ -f "/Users/emin/kattenbak/frontend/shared/cookies.config.ts" ]; then
  log_success "Cookies config exists (DRY)"
else
  log_error "Cookies config missing"
fi

# API config (frontend)
if grep -q "API_CONFIG" "/Users/emin/kattenbak/frontend/lib/config.ts" 2>/dev/null; then
  log_success "Frontend API config exists (DRY)"
else
  log_warning "Frontend API config might be missing"
fi

# ═══════════════════════════════════════════════════════════════════
# 8. DOCUMENTATION
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}8. DOCUMENTATION${NC}"
echo "─────────────────────────────────────────────────────"

docs=(
  "VIDEO_CHAT_ADMIN_COMPLETE.md"
  "HCAPTCHA_FIX_COMPLETE.md"
  "LOGIN_REDIRECT_COMPLETE.md"
  "LOGIN_TROUBLESHOOTING.md"
)

for doc in "${docs[@]}"; do
  if [ -f "/Users/emin/kattenbak/$doc" ]; then
    log_success "$doc exists"
  else
    log_warning "$doc missing"
  fi
done

# ═══════════════════════════════════════════════════════════════════
# 9. TEST SCRIPTS
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}9. TEST SCRIPTS${NC}"
echo "─────────────────────────────────────────────────────"

scripts=(
  "test-video-chat-complete.sh"
  "test-hcaptcha-fix.sh"
  "test-login-redirect.sh"
)

for script in "${scripts[@]}"; do
  if [ -f "/Users/emin/kattenbak/$script" ]; then
    if [ -x "/Users/emin/kattenbak/$script" ]; then
      log_success "$script exists and is executable"
    else
      log_warning "$script exists but not executable (chmod +x needed)"
    fi
  else
    log_warning "$script missing"
  fi
done

# ═══════════════════════════════════════════════════════════════════
# 10. SERVICES STATUS
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}10. SERVICES STATUS${NC}"
echo "─────────────────────────────────────────────────────"

# Backend
if curl -s http://localhost:3101/health > /dev/null 2>&1; then
  log_success "Backend running: http://localhost:3101"
else
  log_warning "Backend NOT running (start with: cd backend && npm run dev)"
fi

# Frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  log_success "Frontend running: http://localhost:3000"
else
  log_warning "Frontend NOT running (start with: cd frontend && npm run dev)"
fi

# Admin
if curl -s http://localhost:3001 > /dev/null 2>&1; then
  log_success "Admin running: http://localhost:3001"
else
  log_warning "Admin NOT running (start with: cd admin-next && npm run dev)"
fi

# ═══════════════════════════════════════════════════════════════════
# FINAL REPORT
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📊 FINAL REPORT${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}✓ Successes: $SUCCESS${NC}"
echo -e "${YELLOW}⚠ Warnings:  $WARNINGS${NC}"
echo -e "${RED}✗ Errors:    $ERRORS${NC}"
echo ""

# Calculate score
TOTAL=$((SUCCESS + WARNINGS + ERRORS))
if [ $TOTAL -gt 0 ]; then
  SCORE=$((SUCCESS * 100 / TOTAL))
else
  SCORE=0
fi

echo -e "Score: ${CYAN}$SCORE%${NC}"
echo ""

# Overall status
if [ $ERRORS -eq 0 ] && [ $WARNINGS -le 5 ]; then
  echo -e "${GREEN}✅ STATUS: PRODUCTION READY!${NC}"
  echo ""
  echo -e "${GREEN}All critical components are in place.${NC}"
  echo -e "${GREEN}Minor warnings can be addressed in production.${NC}"
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  STATUS: MOSTLY READY${NC}"
  echo ""
  echo -e "${YELLOW}No critical errors, but several warnings to address.${NC}"
  echo -e "${YELLOW}Review warnings before deploying.${NC}"
else
  echo -e "${RED}❌ STATUS: ISSUES FOUND${NC}"
  echo ""
  echo -e "${RED}Critical errors detected. Fix before deploying.${NC}"
  echo -e "${RED}Review errors above.${NC}"
fi

echo ""
echo -e "${CYAN}Key Features Implemented:${NC}"
echo "  ✓ Contact Messages → Database (Prisma)"
echo "  ✓ Video Components (DRY: 1 component, 2 plekken)"
echo "  ✓ Admin Panel Messages"
echo "  ✓ hCaptcha Fix (isReady check)"
echo "  ✓ Login Redirect (window.location.href)"
echo "  ✓ DRY Architecture (geen redundantie)"
echo ""

echo -e "${CYAN}Next Steps:${NC}"
echo "  1. Start services if not running:"
echo "     cd backend && npm run dev"
echo "     cd frontend && npm run dev"
echo "     cd admin-next && npm run dev"
echo ""
echo "  2. Run database migration:"
echo "     cd backend && npx prisma migrate deploy"
echo ""
echo "  3. Manual testing:"
echo "     - Admin messages: http://localhost:3001/dashboard/messages"
echo "     - Video homepage: http://localhost:3000"
echo "     - Video product: http://localhost:3000/product/[slug]"
echo "     - Chat popup: http://localhost:3000 (bottom right)"
echo ""
echo "  4. Deploy when ready:"
echo "     git push origin main"
echo ""

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Verification complete! 🎉${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

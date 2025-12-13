#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# hCAPTCHA FIX TEST - Complete verificatie
# Test dat hCaptcha werkt na cookie acceptatie
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 hCAPTCHA FIX VERIFICATION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Check code implementation
echo -e "${YELLOW}1. Code Implementation Check${NC}"
echo "─────────────────────────────────────────────────────"

# Check chat-popup.tsx for isReady check
if grep -q "isReady" /Users/emin/kattenbak/frontend/components/ui/chat-popup.tsx; then
  echo -e "${GREEN}✓${NC} ChatPopup uses isReady check"
else
  echo -e "${RED}✗${NC} ChatPopup missing isReady check"
fi

# Check use-hcaptcha.ts exports isReady
if grep -q "return.*isReady" /Users/emin/kattenbak/frontend/lib/hooks/use-hcaptcha.ts; then
  echo -e "${GREEN}✓${NC} useHCaptcha hook exports isReady"
else
  echo -e "${RED}✗${NC} useHCaptcha missing isReady export"
fi

# Check console.log statements
if grep -q "hCaptcha not ready yet" /Users/emin/kattenbak/frontend/components/ui/chat-popup.tsx; then
  echo -e "${GREEN}✓${NC} Debug logging added"
else
  echo -e "${YELLOW}⚠${NC}  Debug logging might be missing"
fi

# 2. Check hCaptcha config
echo ""
echo -e "${YELLOW}2. hCaptcha Configuration${NC}"
echo "─────────────────────────────────────────────────────"

if grep -q "consentCategory: 'functional'" /Users/emin/kattenbak/frontend/shared/hcaptcha.config.ts; then
  echo -e "${GREEN}✓${NC} hCaptcha requires functional cookies"
else
  echo -e "${RED}✗${NC} Cookie consent category mismatch"
fi

# 3. Check services
echo ""
echo -e "${YELLOW}3. Services Status${NC}"
echo "─────────────────────────────────────────────────────"

if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Frontend: http://localhost:3000"
else
  echo -e "${RED}✗${NC} Frontend NOT running"
fi

if curl -s http://localhost:3101/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Backend: http://localhost:3101"
else
  echo -e "${YELLOW}⚠${NC}  Backend might not be running"
fi

# 4. File checks
echo ""
echo -e "${YELLOW}4. File Structure${NC}"
echo "─────────────────────────────────────────────────────"

files=(
  "/Users/emin/kattenbak/frontend/components/ui/chat-popup.tsx"
  "/Users/emin/kattenbak/frontend/lib/hooks/use-hcaptcha.ts"
  "/Users/emin/kattenbak/frontend/lib/hooks/use-cookie-consent.ts"
  "/Users/emin/kattenbak/frontend/shared/hcaptcha.config.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $(basename $file)"
  else
    echo -e "${RED}✗${NC} $(basename $file) MISSING"
  fi
done

# 5. Manual test instructions
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ READY FOR BROWSER TEST${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}CRITICAL TEST FLOW:${NC}"
echo ""
echo -e "${CYAN}1. Open Browser:${NC}"
echo "   → http://localhost:3000"
echo "   → Open DevTools (F12) → Console tab"
echo ""
echo -e "${CYAN}2. Accept Cookies:${NC}"
echo "   → Click 'Accepteer alle cookies'"
echo "   → Console should show:"
echo "     ✅ Cookie consent saved"
echo "     ✅ hCaptcha script loaded"
echo "     ✅ hCaptcha widget initialized"
echo ""
echo -e "${CYAN}3. Open Chat Popup:${NC}"
echo "   → Click chat icon (bottom right)"
echo "   → Click 'Start Chat'"
echo ""
echo -e "${CYAN}4. Fill Form:${NC}"
echo "   Email: test@example.com"
echo "   Message: Test bericht"
echo ""
echo -e "${CYAN}5. Submit & Verify Console:${NC}"
echo "   → Click 'Versturen'"
echo "   → Console should show:"
echo "     🔐 Getting hCaptcha token..."
echo "     🔄 Executing hCaptcha..."
echo "     ✅ hCaptcha token received"
echo "     ✅ Message sent!"
echo ""
echo -e "${CYAN}6. Expected Behavior:${NC}"
echo "   ✓ NO '⚠️ hCaptcha not ready' error"
echo "   ✓ Token received successfully"
echo "   ✓ Message sent to backend"
echo "   ✓ Success toast visible"
echo ""
echo -e "${YELLOW}If you still see '⚠️ hCaptcha not ready':${NC}"
echo "  1. Hard refresh: Cmd+Shift+R"
echo "  2. Clear localStorage in Console:"
echo "     localStorage.clear()"
echo "  3. Reload page"
echo "  4. Accept cookies again"
echo "  5. Wait 2-3 seconds for hCaptcha to load"
echo "  6. Try chat again"
echo ""
echo -e "${CYAN}Common Issues:${NC}"
echo "  • ${YELLOW}Not ready yet${NC}: Wait 2-3 sec after cookie acceptance"
echo "  • ${YELLOW}Empty console${NC}: Check if frontend is running"
echo "  • ${YELLOW}Network error${NC}: Backend might be down"
echo ""
echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}Backend:  http://localhost:3101${NC}"
echo ""
echo -e "${CYAN}Test now! 🚀${NC}"

#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# OPEN CREDENTIALS VEILIG (NIET IN CHAT!)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔐 OPENING CREDENTIALS IN EDITOR${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if editor is available
if command -v code &> /dev/null; then
    EDITOR="code"
elif command -v nano &> /dev/null; then
    EDITOR="nano"
else
    EDITOR="open"
fi

echo -e "${BLUE}Opening in $EDITOR...${NC}"
echo ""

# Open files
$EDITOR backend/.env.production
$EDITOR frontend/.env.production
$EDITOR .credentials/db-credentials.txt

echo ""
echo -e "${GREEN}✅ Files opened in editor!${NC}"
echo ""
echo -e "${BLUE}📋 WHAT TO UPDATE:${NC}"
echo "   1. backend/.env.production:"
echo "      • MOLLIE_API_KEY=live_YOUR_KEY"
echo "      • MYPARCEL_API_KEY=YOUR_KEY"
echo "      • Update URLs (yourdomain.com → actual)"
echo ""
echo "   2. frontend/.env.production:"
echo "      • NEXT_PUBLIC_API_URL → actual domain"
echo "      • NEXT_PUBLIC_SITE_URL → actual domain"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

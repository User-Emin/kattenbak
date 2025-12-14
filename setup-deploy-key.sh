#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DEPLOY KEY SETUP - AUTOMATED
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVER="185.224.139.54"
PASSWORD="Pursangue66@"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔑 DEPLOY KEY SETUP${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Copy public key to clipboard
echo -e "${BLUE}[1/5] Copying public key to clipboard...${NC}"
cat .credentials/github_deploy_key.pub | pbcopy
echo -e "${GREEN}   ✅ Public key in clipboard!${NC}"
echo ""

# 2. Show GitHub instructions
echo -e "${YELLOW}[2/5] ADD TO GITHUB (IN BROWSER):${NC}"
echo ""
echo "   1. Open: https://github.com/User-Emin/kattenbak/settings/keys"
echo "   2. Click: 'Add deploy key'"
echo "   3. Title: 'Production Server 185.224.139.54'"
echo "   4. Key: CMD+V (already in clipboard!)"
echo "   5. Allow write access: UNCHECKED (read-only)"
echo "   6. Click: 'Add key'"
echo ""
echo -e "${YELLOW}Press ENTER when done...${NC}"
read

# 3. Copy to server
echo ""
echo -e "${BLUE}[3/5] Copying deploy key to server...${NC}"
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no .credentials/github_deploy_key root@$SERVER:/root/.ssh/
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no .credentials/github_deploy_key.pub root@$SERVER:/root/.ssh/
echo -e "${GREEN}   ✅ Keys copied to server!${NC}"

# 4. Configure on server
echo ""
echo -e "${BLUE}[4/5] Configuring on server...${NC}"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << 'EOF'
chmod 600 /root/.ssh/github_deploy_key
ssh-keyscan github.com >> /root/.ssh/known_hosts 2>/dev/null
echo "   ✅ Permissions set & GitHub added to known_hosts"
EOF

# 5. Test connection
echo ""
echo -e "${BLUE}[5/5] Testing GitHub connection...${NC}"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << 'EOF'
ssh -T -i /root/.ssh/github_deploy_key git@github.com 2>&1 | grep -q "successfully authenticated" && echo "   ✅ GitHub authentication successful!" || echo "   ℹ️  Connection test done (check manually if needed)"
EOF

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOY KEY CONFIGURED!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 NEXT: Clone repository on server${NC}"
echo ""
echo "ssh root@$SERVER"
echo "cd /var/www/kattenbak"
echo "GIT_SSH_COMMAND='ssh -i /root/.ssh/github_deploy_key' git clone git@github.com:User-Emin/kattenbak.git ."
echo ""



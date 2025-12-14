#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SSH KEY UPLOAD HELPER
# Voor het uploaden van je SSH key naar de server
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🔑 SSH KEY UPLOAD HELPER${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

SERVER="185.224.139.54"
KEY_FILE="$HOME/.ssh/kattenbak_deploy.pub"

if [ ! -f "$KEY_FILE" ]; then
  echo -e "${YELLOW}SSH key not found. Generating...${NC}"
  ssh-keygen -t ed25519 -f "$HOME/.ssh/kattenbak_deploy" -N ""
  echo -e "${GREEN}✓${NC} Key generated"
fi

echo -e "${CYAN}Your public key:${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$KEY_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Copy to clipboard if possible
if command -v pbcopy &> /dev/null; then
  cat "$KEY_FILE" | pbcopy
  echo -e "${GREEN}✓${NC} Public key copied to clipboard!"
elif command -v xclip &> /dev/null; then
  cat "$KEY_FILE" | xclip -selection clipboard
  echo -e "${GREEN}✓${NC} Public key copied to clipboard!"
fi

echo ""
echo -e "${CYAN}MANUAL UPLOAD INSTRUCTIES:${NC}"
echo ""
echo "1. Log in op je server via je hosting control panel of via:"
echo "   ssh root@$SERVER"
echo ""
echo "2. Run deze commands op de server:"
echo ""
echo -e "${YELLOW}   # Als deployer user${NC}"
echo "   mkdir -p ~/.ssh"
echo "   chmod 700 ~/.ssh"
echo "   nano ~/.ssh/authorized_keys"
echo "   # Plak de public key hierboven"
echo "   # Druk Ctrl+X, Y, Enter om op te slaan"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo ""
echo -e "${YELLOW}   # Of als root (en deployer user aanmaken):${NC}"
echo "   useradd -m -s /bin/bash deployer"
echo "   mkdir -p /home/deployer/.ssh"
echo "   echo 'PASTE_KEY_HERE' > /home/deployer/.ssh/authorized_keys"
echo "   chown -R deployer:deployer /home/deployer/.ssh"
echo "   chmod 700 /home/deployer/.ssh"
echo "   chmod 600 /home/deployer/.ssh/authorized_keys"
echo ""
echo "3. Test de connectie:"
echo "   ssh -i ~/.ssh/kattenbak_deploy deployer@$SERVER"
echo ""

echo ""
echo -e "${CYAN}AUTOMATED UPLOAD (als je wachtwoord hebt):${NC}"
echo ""
read -p "Wil je automatisch uploaden via wachtwoord? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "Probeer verschillende users..."
  
  # Try deployer
  echo -e "${CYAN}Trying deployer@$SERVER...${NC}"
  if ssh-copy-id -i "$HOME/.ssh/kattenbak_deploy.pub" deployer@$SERVER 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Key uploaded voor deployer!"
    exit 0
  fi
  
  # Try root
  echo -e "${CYAN}Trying root@$SERVER...${NC}"
  if ssh-copy-id -i "$HOME/.ssh/kattenbak_deploy.pub" root@$SERVER 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Key uploaded voor root!"
    echo ""
    echo -e "${YELLOW}Create deployer user:${NC}"
    ssh root@$SERVER "useradd -m -s /bin/bash deployer && mkdir -p /home/deployer/.ssh && cp ~/.ssh/authorized_keys /home/deployer/.ssh/ && chown -R deployer:deployer /home/deployer/.ssh"
    exit 0
  fi
  
  echo -e "${YELLOW}Automatic upload failed. Use manual instructions above.${NC}"
fi

echo ""
echo -e "${CYAN}After SSH is working, run:${NC}"
echo "  ./deploy-catsupply-complete.sh"
echo ""

#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CRITICAL DNS ISSUE FOUND + SERVER DEPLOYMENT SCRIPT
# catsupply.nl → WRONG IP! + Deploy to correct server
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

CORRECT_IP="185.224.139.54"
CURRENT_IP=$(dig catsupply.nl +short)

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🚨 DNS ISSUE + DEPLOYMENT CHECK${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════
# 1. DNS PROBLEM DETECTED
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}1. DNS CONFIGURATION CHECK${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}Current DNS:${NC}"
echo "  catsupply.nl → ${RED}${CURRENT_IP}${NC}"
echo ""
echo -e "${YELLOW}Expected DNS:${NC}"
echo "  catsupply.nl → ${GREEN}${CORRECT_IP}${NC}"
echo ""

if [ "$CURRENT_IP" != "$CORRECT_IP" ]; then
  echo -e "${RED}❌ CRITICAL: DNS POINTS TO WRONG IP!${NC}"
  echo ""
  echo -e "${YELLOW}ACTION REQUIRED:${NC}"
  echo "  1. Log in to your DNS provider (TransIP, Cloudflare, etc.)"
  echo "  2. Find A-record for 'catsupply.nl'"
  echo "  3. Change IP from ${RED}${CURRENT_IP}${NC} to ${GREEN}${CORRECT_IP}${NC}"
  echo ""
  echo -e "${CYAN}DNS Records to configure:${NC}"
  echo "  ┌────────────────────────────────────────────────┐"
  echo "  │ Record Type │ Host        │ Points To        │"
  echo "  ├────────────────────────────────────────────────┤"
  echo "  │ A           │ @           │ ${CORRECT_IP}  │"
  echo "  │ A           │ www         │ ${CORRECT_IP}  │"
  echo "  │ A           │ api         │ ${CORRECT_IP}  │"
  echo "  │ A           │ admin       │ ${CORRECT_IP}  │"
  echo "  └────────────────────────────────────────────────┘"
  echo ""
  echo -e "${YELLOW}After updating DNS, wait 5-30 minutes for propagation.${NC}"
  echo ""
else
  echo -e "${GREEN}✓${NC} DNS correctly configured!"
fi

# ═══════════════════════════════════════════════════════════════════
# 2. SERVER REACHABILITY CHECK
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}2. SERVER REACHABILITY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Ping test
if ping -c 3 ${CORRECT_IP} > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Server ${CORRECT_IP} is reachable"
else
  echo -e "${RED}✗${NC} Server ${CORRECT_IP} NOT reachable"
  exit 1
fi

# Port check
echo -e "${YELLOW}Checking ports...${NC}"
if nc -zv ${CORRECT_IP} 22 2>&1 | grep -q succeeded; then
  echo -e "${GREEN}✓${NC} Port 22 (SSH) open"
else
  echo -e "${RED}✗${NC} Port 22 (SSH) closed"
fi

if nc -zv ${CORRECT_IP} 80 2>&1 | grep -q succeeded; then
  echo -e "${GREEN}✓${NC} Port 80 (HTTP) open"
else
  echo -e "${YELLOW}⚠${NC}  Port 80 (HTTP) closed (will open after deployment)"
fi

if nc -zv ${CORRECT_IP} 443 2>&1 | grep -q succeeded; then
  echo -e "${GREEN}✓${NC} Port 443 (HTTPS) open"
else
  echo -e "${YELLOW}⚠${NC}  Port 443 (HTTPS) closed (will open after deployment)"
fi

# ═══════════════════════════════════════════════════════════════════
# 3. SSH KEY SETUP
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}3. SSH KEY AUTHENTICATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SSH_KEY="$HOME/.ssh/catsupply_deploy"

if [ ! -f "$SSH_KEY" ]; then
  echo -e "${YELLOW}⚠${NC}  SSH key not found, generating..."
  
  ssh-keygen -t ed25519 -C "deploy@catsupply.nl" -f "$SSH_KEY" -N ""
  
  echo -e "${GREEN}✓${NC} SSH key generated: $SSH_KEY"
  echo ""
  echo -e "${YELLOW}NEXT STEP: Copy public key to server${NC}"
  echo ""
  echo "Option 1 (with password):"
  echo "  ssh-copy-id -i ${SSH_KEY}.pub root@${CORRECT_IP}"
  echo ""
  echo "Option 2 (manual):"
  echo "  cat ${SSH_KEY}.pub"
  echo "  # Copy the output and add to server's ~/.ssh/authorized_keys"
  echo ""
  
  read -p "Press Enter after SSH key is copied to server..."
else
  echo -e "${GREEN}✓${NC} SSH key exists: $SSH_KEY"
fi

# Test SSH connection
echo -e "${YELLOW}Testing SSH connection...${NC}"
if ssh -i "$SSH_KEY" -o ConnectTimeout=5 -o StrictHostKeyChecking=no deploy@${CORRECT_IP} "echo connected" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} SSH connection successful (user: deploy)"
  SSH_USER="deploy"
elif ssh -i "$SSH_KEY" -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@${CORRECT_IP} "echo connected" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} SSH connection successful (user: root)"
  SSH_USER="root"
else
  echo -e "${RED}✗${NC} SSH connection failed"
  echo ""
  echo -e "${YELLOW}Troubleshooting:${NC}"
  echo "  1. Make sure SSH key is copied to server"
  echo "  2. Check if server allows key authentication"
  echo "  3. Verify server allows connections (firewall/security group)"
  echo ""
  echo "Try manually:"
  echo "  ssh -i $SSH_KEY root@${CORRECT_IP}"
  echo ""
  exit 1
fi

# ═══════════════════════════════════════════════════════════════════
# 4. SERVER PREPARATION
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}4. SERVER PREPARATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh -i "$SSH_KEY" ${SSH_USER}@${CORRECT_IP} 'bash -s' <<'ENDSSH'
set -e

# Colors for remote
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Checking system...${NC}"

# Check OS
if [ -f /etc/almalinux-release ]; then
  echo -e "${GREEN}✓${NC} AlmaLinux detected"
elif [ -f /etc/redhat-release ]; then
  echo -e "${GREEN}✓${NC} RedHat-based system detected"
else
  echo "⚠️  Unknown OS, continuing anyway..."
fi

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
sudo yum update -y > /dev/null 2>&1
echo -e "${GREEN}✓${NC} System updated"

# Install essentials
echo -e "${YELLOW}Installing essential packages...${NC}"
sudo yum install -y git curl wget vim htop > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Essential packages installed"

# Check if Node.js is installed
if command -v node > /dev/null 2>&1; then
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
  echo -e "${YELLOW}Installing Node.js 20 LTS...${NC}"
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash - > /dev/null 2>&1
  sudo yum install -y nodejs > /dev/null 2>&1
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
fi

# Check if PM2 is installed
if command -v pm2 > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} PM2 installed"
else
  echo -e "${YELLOW}Installing PM2...${NC}"
  sudo npm install -g pm2 > /dev/null 2>&1
  echo -e "${GREEN}✓${NC} PM2 installed"
fi

# Check if PostgreSQL is installed
if command -v psql > /dev/null 2>&1; then
  PG_VERSION=$(psql --version | awk '{print $3}')
  echo -e "${GREEN}✓${NC} PostgreSQL installed: $PG_VERSION"
else
  echo -e "${YELLOW}PostgreSQL not installed yet${NC}"
  echo "  Will be installed during deployment"
fi

# Check if Nginx is installed
if command -v nginx > /dev/null 2>&1; then
  NGINX_VERSION=$(nginx -v 2>&1 | awk -F'/' '{print $2}')
  echo -e "${GREEN}✓${NC} Nginx installed: $NGINX_VERSION"
else
  echo -e "${YELLOW}Nginx not installed yet${NC}"
  echo "  Will be installed during deployment"
fi

# Create deploy directory
if [ ! -d "/home/deploy" ]; then
  sudo useradd -m -s /bin/bash deploy
  echo -e "${GREEN}✓${NC} User 'deploy' created"
else
  echo -e "${GREEN}✓${NC} User 'deploy' exists"
fi

echo ""
echo -e "${GREEN}Server preparation complete!${NC}"
ENDSSH

echo -e "${GREEN}✓${NC} Server prepared"

# ═══════════════════════════════════════════════════════════════════
# 5. DEPLOYMENT SUMMARY
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOYMENT CHECK COMPLETE${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}CURRENT STATUS:${NC}"
echo ""

if [ "$CURRENT_IP" != "$CORRECT_IP" ]; then
  echo -e "${RED}❌ DNS Issue:${NC}"
  echo "   catsupply.nl → ${RED}${CURRENT_IP}${NC} (WRONG)"
  echo "   Should be → ${GREEN}${CORRECT_IP}${NC}"
  echo ""
  echo -e "${YELLOW}⚠️  ACTION: Update DNS A-record at your provider${NC}"
  echo ""
else
  echo -e "${GREEN}✅ DNS:${NC} catsupply.nl → ${CORRECT_IP}"
fi

echo -e "${GREEN}✅ Server:${NC} ${CORRECT_IP} reachable"
echo -e "${GREEN}✅ SSH:${NC} Key authentication working"
echo -e "${GREEN}✅ System:${NC} Packages updated"
echo ""

echo -e "${CYAN}NEXT STEPS:${NC}"
echo ""
echo "1. ${YELLOW}FIX DNS FIRST${NC} (if not correct)"
echo "   → Log in to DNS provider"
echo "   → Change A-record: ${CURRENT_IP} → ${CORRECT_IP}"
echo "   → Wait 5-30 minutes for propagation"
echo ""
echo "2. ${YELLOW}Run full deployment:${NC}"
echo "   ./deploy-production.sh"
echo ""
echo "3. ${YELLOW}Verify deployment:${NC}"
echo "   curl https://catsupply.nl"
echo "   curl https://api.catsupply.nl/health"
echo ""

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

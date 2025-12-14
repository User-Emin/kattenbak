#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE SERVER CHECK + CONNECT
# Check wat er al is + maak directe connectie
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

SERVER_IP="185.224.139.54"

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🔍 SERVER CHECK + SSH CONNECTION${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════
# 1. CHECK AVAILABLE SSH KEYS
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}1. SSH KEYS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ls ~/.ssh/*.pub > /dev/null 2>&1; then
  echo -e "${GREEN}Available SSH keys:${NC}"
  for key in ~/.ssh/*.pub; do
    keyname=$(basename "$key" .pub)
    echo "  ✓ $keyname"
  done
  echo ""
else
  echo -e "${YELLOW}⚠${NC}  No SSH keys found"
  echo ""
fi

# ═══════════════════════════════════════════════════════════════════
# 2. TRY DIFFERENT SSH KEYS
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}2. TESTING SSH CONNECTIONS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CONNECTED=false
WORKING_USER=""
WORKING_KEY=""

# Try with default keys first (no -i flag)
for user in root deploy emin admin; do
  echo -ne "${YELLOW}Testing:${NC} $user@${SERVER_IP} (default keys)... "
  
  if ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no -o BatchMode=yes \
    ${user}@${SERVER_IP} "echo connected" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ SUCCESS!${NC}"
    CONNECTED=true
    WORKING_USER=$user
    WORKING_KEY="default"
    break
  else
    echo -e "${RED}✗${NC}"
  fi
done

# If default didn't work, try specific keys
if [ "$CONNECTED" = false ]; then
  for keyfile in ~/.ssh/id_rsa ~/.ssh/id_ed25519 ~/.ssh/id_ecdsa ~/.ssh/catsupply_deploy; do
    if [ -f "$keyfile" ]; then
      keyname=$(basename "$keyfile")
      
      for user in root deploy emin admin; do
        echo -ne "${YELLOW}Testing:${NC} $user@${SERVER_IP} (key: $keyname)... "
        
        if ssh -i "$keyfile" -o ConnectTimeout=3 -o StrictHostKeyChecking=no -o BatchMode=yes \
          ${user}@${SERVER_IP} "echo connected" > /dev/null 2>&1; then
          echo -e "${GREEN}✓ SUCCESS!${NC}"
          CONNECTED=true
          WORKING_USER=$user
          WORKING_KEY=$keyfile
          break 2
        else
          echo -e "${RED}✗${NC}"
        fi
      done
    fi
  done
fi

echo ""

if [ "$CONNECTED" = false ]; then
  echo -e "${RED}❌ GEEN SSH CONNECTIE MOGELIJK${NC}"
  echo ""
  echo -e "${YELLOW}Mogelijke oorzaken:${NC}"
  echo "  1. SSH key niet op server geïnstalleerd"
  echo "  2. Verkeerde gebruikersnaam"
  echo "  3. Server firewall blokkeert je IP"
  echo "  4. Server heeft password authentication disabled"
  echo ""
  echo -e "${CYAN}Oplossingen:${NC}"
  echo ""
  echo -e "${YELLOW}Optie 1: Password login (als enabled):${NC}"
  echo "  ssh root@${SERVER_IP}"
  echo "  # Dan op server:"
  echo "  mkdir -p ~/.ssh"
  echo "  chmod 700 ~/.ssh"
  echo "  nano ~/.ssh/authorized_keys"
  echo "  # Plak je public key erin"
  echo ""
  
  echo -e "${YELLOW}Optie 2: Via control panel:${NC}"
  echo "  1. Log in op hosting control panel"
  echo "  2. Ga naar SSH keys sectie"
  echo "  3. Upload je public key:"
  
  if [ -f ~/.ssh/id_rsa.pub ]; then
    echo ""
    echo -e "${CYAN}Je public key (id_rsa.pub):${NC}"
    cat ~/.ssh/id_rsa.pub
  elif [ -f ~/.ssh/id_ed25519.pub ]; then
    echo ""
    echo -e "${CYAN}Je public key (id_ed25519.pub):${NC}"
    cat ~/.ssh/id_ed25519.pub
  fi
  
  echo ""
  echo -e "${YELLOW}Optie 3: Nieuwe key maken en uploaden:${NC}"
  echo "  ssh-keygen -t ed25519 -f ~/.ssh/catsupply_deploy"
  echo "  cat ~/.ssh/catsupply_deploy.pub"
  echo "  # Upload naar server via control panel"
  echo ""
  
  exit 1
fi

# ═══════════════════════════════════════════════════════════════════
# 3. CHECK WHAT'S ON SERVER
# ═══════════════════════════════════════════════════════════════════

echo -e "${GREEN}✅ SSH CONNECTED!${NC}"
echo "   User: ${WORKING_USER}"
echo "   Key: ${WORKING_KEY}"
echo ""

echo -e "${CYAN}3. SERVER STATUS CHECK${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SSH_CMD="ssh"
if [ "$WORKING_KEY" != "default" ]; then
  SSH_CMD="ssh -i $WORKING_KEY"
fi

# Get server info
echo -e "${YELLOW}System Info:${NC}"
$SSH_CMD ${WORKING_USER}@${SERVER_IP} 'bash -s' <<'ENDSSH'
echo "  OS: $(cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d'"' -f2 || echo "Unknown")"
echo "  Kernel: $(uname -r)"
echo "  Hostname: $(hostname)"
echo "  Uptime: $(uptime -p 2>/dev/null || uptime)"
ENDSSH

echo ""
echo -e "${YELLOW}Installed Software:${NC}"
$SSH_CMD ${WORKING_USER}@${SERVER_IP} 'bash -s' <<'ENDSSH'
# Node.js
if command -v node > /dev/null 2>&1; then
  echo "  ✓ Node.js: $(node -v)"
else
  echo "  ✗ Node.js: Not installed"
fi

# PM2
if command -v pm2 > /dev/null 2>&1; then
  echo "  ✓ PM2: Installed"
else
  echo "  ✗ PM2: Not installed"
fi

# PostgreSQL
if command -v psql > /dev/null 2>&1; then
  echo "  ✓ PostgreSQL: $(psql --version | awk '{print $3}')"
else
  echo "  ✗ PostgreSQL: Not installed"
fi

# Nginx
if command -v nginx > /dev/null 2>&1; then
  echo "  ✓ Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
else
  echo "  ✗ Nginx: Not installed"
fi

# Certbot
if command -v certbot > /dev/null 2>&1; then
  echo "  ✓ Certbot: Installed"
else
  echo "  ✗ Certbot: Not installed"
fi
ENDSSH

echo ""
echo -e "${YELLOW}Running Services:${NC}"
$SSH_CMD ${WORKING_USER}@${SERVER_IP} 'bash -s' <<'ENDSSH'
# PM2 processes
if command -v pm2 > /dev/null 2>&1; then
  pm2 list 2>/dev/null | grep -E "online|stopped|errored" || echo "  No PM2 processes"
else
  echo "  PM2 not installed"
fi
ENDSSH

echo ""
echo -e "${YELLOW}Nginx Status:${NC}"
$SSH_CMD ${WORKING_USER}@${SERVER_IP} 'bash -s' <<'ENDSSH'
if systemctl is-active nginx > /dev/null 2>&1; then
  echo "  ✓ Nginx: Running"
  # Check config
  if [ -f /etc/nginx/conf.d/catsupply.conf ]; then
    echo "  ✓ Config: /etc/nginx/conf.d/catsupply.conf exists"
  elif [ -f /etc/nginx/sites-enabled/catsupply.conf ]; then
    echo "  ✓ Config: /etc/nginx/sites-enabled/catsupply.conf exists"
  else
    echo "  ⚠ Config: No catsupply.conf found"
  fi
elif systemctl is-enabled nginx > /dev/null 2>&1; then
  echo "  ⚠ Nginx: Installed but not running"
else
  echo "  ✗ Nginx: Not installed/configured"
fi
ENDSSH

echo ""
echo -e "${YELLOW}Project Files:${NC}"
$SSH_CMD ${WORKING_USER}@${SERVER_IP} 'bash -s' <<'ENDSSH'
# Check common locations
for dir in /home/deploy/kattenbak /var/www/kattenbak /root/kattenbak ~/kattenbak; do
  if [ -d "$dir" ]; then
    echo "  ✓ Found: $dir"
    ls -la "$dir" 2>/dev/null | head -5
  fi
done

# If nothing found
if ! ls -d /home/*/kattenbak /var/www/kattenbak /root/kattenbak ~/kattenbak 2>/dev/null; then
  echo "  ⚠ No kattenbak directory found"
fi
ENDSSH

echo ""
echo -e "${YELLOW}Firewall Status:${NC}"
$SSH_CMD ${WORKING_USER}@${SERVER_IP} 'bash -s' <<'ENDSSH'
if command -v ufw > /dev/null 2>&1; then
  sudo ufw status 2>/dev/null | head -10 || echo "  UFW: Cannot check (need sudo)"
elif command -v firewall-cmd > /dev/null 2>&1; then
  sudo firewall-cmd --list-all 2>/dev/null | head -10 || echo "  Firewalld: Cannot check (need sudo)"
else
  echo "  No firewall detected"
fi
ENDSSH

echo ""
echo -e "${YELLOW}Listening Ports:${NC}"
$SSH_CMD ${WORKING_USER}@${SERVER_IP} 'bash -s' <<'ENDSSH'
sudo netstat -tlnp 2>/dev/null | grep LISTEN | grep -E ":80|:443|:3000|:3001|:3101" || \
sudo ss -tlnp 2>/dev/null | grep LISTEN | grep -E ":80|:443|:3000|:3001|:3101" || \
echo "  Cannot check ports (need sudo)"
ENDSSH

# ═══════════════════════════════════════════════════════════════════
# 4. SUMMARY & NEXT STEPS
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ SERVER CHECK COMPLETE${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}Connection Details:${NC}"
echo "  Server: ${SERVER_IP}"
echo "  User: ${WORKING_USER}"
echo "  Key: ${WORKING_KEY}"
echo ""

echo -e "${CYAN}Connect Command:${NC}"
if [ "$WORKING_KEY" = "default" ]; then
  echo "  ssh ${WORKING_USER}@${SERVER_IP}"
else
  echo "  ssh -i ${WORKING_KEY} ${WORKING_USER}@${SERVER_IP}"
fi
echo ""

echo -e "${CYAN}Next Steps:${NC}"
echo "  1. Check wat er al deployed is (zie output boven)"
echo "  2. Als nog niets: run deployment"
echo "  3. Als wel iets: check waarom DNS niet klopt"
echo ""

# Save connection info
cat > /tmp/server-connection-info.txt <<EOF
SERVER_IP=${SERVER_IP}
WORKING_USER=${WORKING_USER}
WORKING_KEY=${WORKING_KEY}
SSH_CMD=${SSH_CMD} ${WORKING_USER}@${SERVER_IP}
EOF

echo -e "${GREEN}Connection info saved to: /tmp/server-connection-info.txt${NC}"
echo ""



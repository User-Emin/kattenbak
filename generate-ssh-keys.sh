#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 1: GENERATE SSH KEYS (RUN LOKAAL)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔐 SSH KEY GENERATOR - LOKAAL${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if key already exists
if [ -f "$HOME/.ssh/kattenbak_deploy" ]; then
  echo -e "${YELLOW}⚠️  SSH key already exists!${NC}"
  echo "Location: $HOME/.ssh/kattenbak_deploy"
  echo ""
  read -p "Do you want to create a new key? (y/n): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Using existing key..."
    PUBLIC_KEY=$(cat "$HOME/.ssh/kattenbak_deploy.pub")
  else
    rm -f "$HOME/.ssh/kattenbak_deploy" "$HOME/.ssh/kattenbak_deploy.pub"
  fi
fi

if [ ! -f "$HOME/.ssh/kattenbak_deploy" ]; then
  echo -e "${GREEN}1/3 Generating SSH key...${NC}"
  ssh-keygen -t ed25519 -C "deploy@kattenbak" -f "$HOME/.ssh/kattenbak_deploy" -N ""
  echo -e "${GREEN}✅ SSH key generated!${NC}"
  echo ""
  
  PUBLIC_KEY=$(cat "$HOME/.ssh/kattenbak_deploy.pub")
fi

# Display keys
echo -e "${GREEN}2/3 Your SSH keys:${NC}"
echo ""
echo "Private key: $HOME/.ssh/kattenbak_deploy"
echo "Public key:  $HOME/.ssh/kattenbak_deploy.pub"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📋 YOUR PUBLIC KEY (to add to server):${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "$PUBLIC_KEY"
echo ""

# Create SSH config
echo -e "${GREEN}3/3 Creating SSH config...${NC}"

# Backup existing config
if [ -f "$HOME/.ssh/config" ]; then
  cp "$HOME/.ssh/config" "$HOME/.ssh/config.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Add to SSH config
cat >> "$HOME/.ssh/config" << EOF

# Kattenbak Production Server
Host kattenbak-prod
    HostName 185.224.139.54
    User deployer
    Port 2222
    IdentityFile ~/.ssh/kattenbak_deploy
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3

EOF

echo -e "${GREEN}✅ SSH config updated!${NC}"
echo ""

# Create server setup script
cat > "$HOME/setup-kattenbak-server.sh" << 'SERVERSCRIPT'
#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# KATTENBAK SERVER SETUP (RUN ON SERVER)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 KATTENBAK SERVER SETUP${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. CREATE DEPLOYER USER
echo -e "${GREEN}1/10 Creating deployer user...${NC}"
if id "deployer" &>/dev/null; then
    echo "User deployer already exists"
else
    sudo useradd -m -s /bin/bash deployer
    echo "deployer:$(openssl rand -base64 32)" | sudo chpasswd
    sudo usermod -aG sudo deployer
    echo "deployer ALL=(ALL) NOPASSWD:ALL" | sudo tee -a /etc/sudoers.d/deployer
fi

# 2. SETUP SSH FOR DEPLOYER
echo -e "${GREEN}2/10 Setting up SSH for deployer...${NC}"
sudo mkdir -p /home/deployer/.ssh
sudo chmod 700 /home/deployer/.ssh
echo "PASTE_PUBLIC_KEY_HERE" | sudo tee /home/deployer/.ssh/authorized_keys
sudo chmod 600 /home/deployer/.ssh/authorized_keys
sudo chown -R deployer:deployer /home/deployer/.ssh

# 3. UPDATE SYSTEM
echo -e "${GREEN}3/10 Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

# 4. INSTALL ESSENTIALS
echo -e "${GREEN}4/10 Installing essential packages...${NC}"
sudo apt install -y curl wget git build-essential ufw fail2ban

# 5. INSTALL NODE.JS 22
echo -e "${GREEN}5/10 Installing Node.js 22...${NC}"
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 6. INSTALL PM2
echo -e "${GREEN}6/10 Installing PM2...${NC}"
sudo npm install -g pm2
pm2 startup | tail -1 | bash

# 7. INSTALL NGINX
echo -e "${GREEN}7/10 Installing Nginx...${NC}"
sudo apt install -y nginx
sudo systemctl enable nginx

# 8. INSTALL POSTGRESQL
echo -e "${GREEN}8/10 Installing PostgreSQL...${NC}"
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql

# 9. INSTALL REDIS
echo -e "${GREEN}9/10 Installing Redis...${NC}"
sudo apt install -y redis-server
sudo systemctl enable redis-server

# 10. SETUP FIREWALL
echo -e "${GREEN}10/10 Configuring firewall...${NC}"
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 2222/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ BASE SETUP COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PM2 version: $(pm2 --version)"
echo ""
echo "Next steps:"
echo "1. Exit this session (type 'exit')"
echo "2. Try SSH with key: ssh deployer@185.224.139.54 -p 2222 -i ~/.ssh/kattenbak_deploy"

SERVERSCRIPT

chmod +x "$HOME/setup-kattenbak-server.sh"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📋 NEXT STEPS:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. SSH into server as root:"
echo "   ${YELLOW}ssh root@185.224.139.54${NC}"
echo "   Password: Pursangue66@"
echo ""
echo "2. Copy setup script to server:"
echo "   ${YELLOW}scp setup-kattenbak-server.sh root@185.224.139.54:~/${NC}"
echo ""
echo "3. On server, edit script to add your public key:"
echo "   ${YELLOW}nano setup-kattenbak-server.sh${NC}"
echo "   Replace PASTE_PUBLIC_KEY_HERE with:"
echo "   ${YELLOW}$PUBLIC_KEY${NC}"
echo ""
echo "4. Run setup script on server:"
echo "   ${YELLOW}bash setup-kattenbak-server.sh${NC}"
echo ""
echo "5. After setup, SSH with key (no password!):"
echo "   ${YELLOW}ssh kattenbak-prod${NC}"
echo ""
echo "Setup script saved to: $HOME/setup-kattenbak-server.sh"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔐 QUICK CONNECT:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "After server setup, connect with:"
echo "${YELLOW}ssh kattenbak-prod${NC}"
echo ""
echo "No password needed! ✨"
echo ""



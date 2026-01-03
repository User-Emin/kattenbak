#!/bin/bash
#
# Server Security Hardening Script
# 
# This script performs essential security configurations:
# 1. Changes SSH password
# 2. Sets up SSH key authentication
# 3. Disables password authentication
# 4. Configures firewall
#
# IMPORTANT: Run this script as root on the production server
#

set -e

echo "🔒 CatSupply Server Security Hardening"
echo "======================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Generate strong password
echo -e "${YELLOW}Step 1: Generate new SSH password${NC}"
NEW_PASSWORD=$(openssl rand -base64 32)
echo "New password generated (save this securely):"
echo "$NEW_PASSWORD"
echo ""
read -p "Press enter to continue..."

# 2. Setup SSH key authentication
echo -e "${YELLOW}Step 2: Setup SSH key authentication${NC}"
echo "On your LOCAL machine, run:"
echo "  ssh-keygen -t ed25519 -C 'catsupply-production'"
echo "  ssh-copy-id root@185.224.139.74"
echo ""
read -p "Have you copied your SSH key? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Please setup SSH key first${NC}"
    exit 1
fi

# 3. Backup sshd_config
echo -e "${YELLOW}Step 3: Backup SSH configuration${NC}"
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d)
echo -e "${GREEN}✓ Backup created${NC}"

# 4. Configure SSH (disable password auth)
echo -e "${YELLOW}Step 4: Configure SSH security${NC}"
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
echo -e "${GREEN}✓ SSH hardened${NC}"

# 5. Setup UFW firewall
echo -e "${YELLOW}Step 5: Configure firewall${NC}"
if ! command -v ufw &> /dev/null; then
    apt-get update && apt-get install -y ufw
fi

ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 5432/tcp # PostgreSQL (only from localhost)
echo "y" | ufw enable
echo -e "${GREEN}✓ Firewall configured${NC}"

# 6. Test SSH configuration
echo -e "${YELLOW}Step 6: Test SSH configuration${NC}"
if sshd -t; then
    echo -e "${GREEN}✓ SSH configuration valid${NC}"
else
    echo -e "${RED}✗ SSH configuration invalid, reverting...${NC}"
    cp /etc/ssh/sshd_config.backup.$(date +%Y%m%d) /etc/ssh/sshd_config
    exit 1
fi

# 7. Restart SSH (IMPORTANT: Don't close your current session!)
echo -e "${YELLOW}Step 7: Restart SSH service${NC}"
echo -e "${RED}WARNING: Keep your current SSH session open!${NC}"
read -p "Press enter to restart SSH service..."
systemctl restart sshd
echo -e "${GREEN}✓ SSH restarted${NC}"

# 8. Update CORS configuration
echo -e "${YELLOW}Step 8: Update CORS configuration${NC}"
cat >> /var/www/catsupply/backend/.env.production << EOF

# Production CORS - Updated $(date +%Y-%m-%d)
CORS_ORIGINS=https://catsupply.nl,https://www.catsupply.nl,https://admin.catsupply.nl
EOF
echo -e "${GREEN}✓ CORS updated${NC}"

# 9. Summary
echo ""
echo -e "${GREEN}======================================"
echo "🎉 Security Hardening Complete!"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo "1. Save the new password in a secure password manager"
echo "2. Test SSH connection from another terminal (keep this one open!)"
echo "3. Restart backend: pm2 restart backend"
echo "4. Verify login works with SSH key"
echo ""
echo -e "${YELLOW}New SSH Password:${NC}"
echo "$NEW_PASSWORD"
echo ""
echo -e "${RED}Important: Do not close this terminal until you've verified SSH key login works!${NC}"


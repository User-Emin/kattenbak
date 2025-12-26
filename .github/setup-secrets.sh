#!/bin/bash

# 🔐 GitHub Secrets Setup Script
# ============================================================================
# Dit script helpt je om alle benodigde GitHub Secrets te configureren
# ============================================================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 GitHub Secrets Setup - CI/CD Pipeline"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
    echo ""
    echo "Or use Homebrew: brew install gh"
    exit 1
fi

echo "✅ GitHub CLI found"
echo ""

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "🔑 Please authenticate with GitHub CLI:"
    gh auth login
fi

echo "✅ Authenticated with GitHub"
echo ""

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"
echo ""

# ============================================================================
# 1. SSH_PRIVATE_KEY
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  SSH_PRIVATE_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SSH_KEY_PATH="$HOME/.ssh/github-deploy"

if [ -f "$SSH_KEY_PATH" ]; then
    echo "✅ SSH key found at $SSH_KEY_PATH"
    read -p "Use this key? (y/n): " USE_EXISTING
    
    if [ "$USE_EXISTING" != "y" ]; then
        echo "Generating new SSH key..."
        ssh-keygen -t rsa -b 4096 -C "github-actions@catsupply.nl" -f "$SSH_KEY_PATH" -N ""
    fi
else
    echo "🔑 Generating new SSH key..."
    ssh-keygen -t rsa -b 4096 -C "github-actions@catsupply.nl" -f "$SSH_KEY_PATH" -N ""
fi

echo ""
echo "📋 Copy this PUBLIC key to your server:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "${SSH_KEY_PATH}.pub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Run this on your server (185.224.139.74):"
echo "mkdir -p ~/.ssh && echo '$(cat ${SSH_KEY_PATH}.pub)' >> ~/.ssh/authorized_keys"
echo ""
read -p "Press Enter when done..."

# Upload private key to GitHub
gh secret set SSH_PRIVATE_KEY < "$SSH_KEY_PATH"
echo "✅ SSH_PRIVATE_KEY uploaded to GitHub"
echo ""

# ============================================================================
# 2. SERVER_HOST
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  SERVER_HOST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Enter server IP (default: 185.224.139.74): " SERVER_HOST
SERVER_HOST=${SERVER_HOST:-185.224.139.74}

echo "$SERVER_HOST" | gh secret set SERVER_HOST
echo "✅ SERVER_HOST set to: $SERVER_HOST"
echo ""

# ============================================================================
# 3. SERVER_USER
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  SERVER_USER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Enter server user (default: root): " SERVER_USER
SERVER_USER=${SERVER_USER:-root}

echo "$SERVER_USER" | gh secret set SERVER_USER
echo "✅ SERVER_USER set to: $SERVER_USER"
echo ""

# ============================================================================
# 4. DB_USER
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  DB_USER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Enter database user (default: kattenbak_user): " DB_USER
DB_USER=${DB_USER:-kattenbak_user}

echo "$DB_USER" | gh secret set DB_USER
echo "✅ DB_USER set to: $DB_USER"
echo ""

# ============================================================================
# 5. DB_PASSWORD
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  DB_PASSWORD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -sp "Enter database password: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Password cannot be empty"
    exit 1
fi

echo "$DB_PASSWORD" | gh secret set DB_PASSWORD
echo "✅ DB_PASSWORD set"
echo ""

# ============================================================================
# 6. DB_NAME
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  DB_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Enter database name (default: kattenbak_prod): " DB_NAME
DB_NAME=${DB_NAME:-kattenbak_prod}

echo "$DB_NAME" | gh secret set DB_NAME
echo "✅ DB_NAME set to: $DB_NAME"
echo ""

# ============================================================================
# SUMMARY
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL SECRETS CONFIGURED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Configured secrets:"
echo "  ✅ SSH_PRIVATE_KEY"
echo "  ✅ SERVER_HOST:    $SERVER_HOST"
echo "  ✅ SERVER_USER:    $SERVER_USER"
echo "  ✅ DB_USER:        $DB_USER"
echo "  ✅ DB_PASSWORD:    ********"
echo "  ✅ DB_NAME:        $DB_NAME"
echo ""
echo "🚀 Your CI/CD pipeline is ready!"
echo ""
echo "Next steps:"
echo "  1. Verify secrets: gh secret list"
echo "  2. Push to main: git push origin main"
echo "  3. Watch deployment: gh run watch"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


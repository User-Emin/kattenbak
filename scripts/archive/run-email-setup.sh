#!/bin/bash
# Local script to run email setup on server
# This script will SSH to server and run email setup

set -e

echo "📧 Email Setup Script"
echo "===================="
echo ""
echo "This script will:"
echo "1. Upload email setup script to server"
echo "2. Run email setup on server"
echo "3. Send test email to emin@catsupply.nl"
echo "4. Restart backend service"
echo ""

# Server details
SERVER="root@185.224.139.74"
SCRIPT_LOCAL="scripts/setup-email-on-server.sh"
SCRIPT_REMOTE="/tmp/setup-email.sh"

# Check if script exists
if [ ! -f "$SCRIPT_LOCAL" ]; then
  echo "❌ Script not found: $SCRIPT_LOCAL"
  exit 1
fi

echo "📤 Uploading script to server..."
scp -o StrictHostKeyChecking=no "$SCRIPT_LOCAL" "$SERVER:$SCRIPT_REMOTE"

if [ $? -eq 0 ]; then
  echo "✅ Script uploaded successfully"
else
  echo "⚠️  Upload may have failed - continuing anyway"
fi

echo ""
echo "🚀 Running email setup on server..."
echo "   (You may be prompted for SSH password)"
echo ""

# Run script on server
ssh -o StrictHostKeyChecking=no "$SERVER" "chmod +x $SCRIPT_REMOTE && bash $SCRIPT_REMOTE"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Email setup completed successfully!"
  echo ""
  echo "📬 Check emin@catsupply.nl for test email"
  echo ""
else
  echo ""
  echo "⚠️  Email setup may have failed - check server logs"
  echo ""
fi
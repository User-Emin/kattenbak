#!/bin/bash
# Local script to execute email setup on server
# This will attempt to connect and run the setup

set -e

echo "🚀 Executing Email Setup on Server..."
echo "======================================"
echo ""

SERVER="root@185.224.139.74"
SCRIPT_PATH="scripts/setup-email-and-verify.sh"

# Check if script exists
if [ ! -f "$SCRIPT_PATH" ]; then
  echo "❌ Script not found: $SCRIPT_PATH"
  exit 1
fi

echo "📤 Uploading script to server..."
echo "   (You may be prompted for SSH password)"
echo ""

# Upload script
cat "$SCRIPT_PATH" | ssh -o StrictHostKeyChecking=no "$SERVER" 'cat > /tmp/setup-email-complete.sh && chmod +x /tmp/setup-email-complete.sh && echo "✅ Script uploaded"'

if [ $? -eq 0 ]; then
  echo "✅ Script uploaded successfully"
  echo ""
  echo "🚀 Executing script on server..."
  echo ""
  
  # Execute script
  ssh -o StrictHostKeyChecking=no "$SERVER" 'bash /tmp/setup-email-complete.sh'
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Email setup completed successfully!"
    echo "📬 Check emin@catsupply.nl for test email"
  else
    echo ""
    echo "⚠️  Script execution may have failed - check output above"
  fi
else
  echo "❌ Failed to upload script - SSH connection failed"
  echo ""
  echo "Please run manually:"
  echo "  cat $SCRIPT_PATH | ssh $SERVER 'bash'"
  exit 1
fi
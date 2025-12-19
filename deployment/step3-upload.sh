#!/bin/bash
##################################################
# STAP 3: UPLOAD MET RETRY & VERIFICATIE
# Resilience: Multiple attempts, connection testing
##################################################

set -e

TAR_FILE="$1"
SERVER="root@37.27.22.75"
REMOTE_DIR="/tmp"
MAX_RETRIES=5
RETRY_DELAY=10

echo "════════════════════════════════════════════"
echo "📤 STAP 3: UPLOAD MET RETRY"
echo "════════════════════════════════════════════"

if [ ! -f "$TAR_FILE" ]; then
    echo "❌ ERROR: Tar file not found: $TAR_FILE"
    exit 1
fi

# 3.1 Test SSH connectivity
echo "🔗 3.1 Testing SSH connection..."
for i in $(seq 1 3); do
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER" "echo 'Connection OK'" 2>/dev/null; then
        echo "   ✅ SSH connection successful"
        break
    else
        if [ $i -eq 3 ]; then
            echo "   ❌ SSH connection failed after 3 attempts"
            echo ""
            echo "🚨 DEPLOYMENT BLOCKED: Cannot reach server"
            echo "   Mogelijke oorzaken:"
            echo "   • Server firewall"
            echo "   • Network issue"
            echo "   • SSH service down"
            echo ""
            echo "📋 ALTERNATIEF:"
            echo "   1. Upload artifact handmatig via SFTP/control panel"
            echo "   2. Artifact locatie: $TAR_FILE"
            echo "   3. Checksums: $TAR_FILE.checksums"
            exit 1
        fi
        echo "   ⚠️  Attempt $i failed, retrying..."
        sleep 5
    fi
done

# 3.2 Upload with retry
echo "📤 3.2 Uploading artifact (with retry logic)..."
UPLOAD_SUCCESS=0

for attempt in $(seq 1 $MAX_RETRIES); do
    echo "   Attempt $attempt/$MAX_RETRIES..."
    
    if scp -o ConnectTimeout=30 "$TAR_FILE" "$TAR_FILE.checksums" "$SERVER:$REMOTE_DIR/" 2>&1 | tee /tmp/scp.log; then
        UPLOAD_SUCCESS=1
        echo "   ✅ Upload successful!"
        break
    else
        if [ $attempt -lt $MAX_RETRIES ]; then
            echo "   ⚠️  Upload failed, waiting ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        else
            echo "   ❌ Upload failed after $MAX_RETRIES attempts"
        fi
    fi
done

if [ $UPLOAD_SUCCESS -eq 0 ]; then
    echo ""
    echo "🚨 UPLOAD FAILED"
    echo "   Artifact beschikbaar voor handmatige upload:"
    echo "   → $TAR_FILE"
    echo "   → $TAR_FILE.checksums"
    exit 1
fi

# 3.3 Verify upload integrity
echo "🔍 3.3 Verifying upload integrity..."
REMOTE_FILE=$(basename "$TAR_FILE")
LOCAL_SHA=$(cat "$TAR_FILE.checksums" | grep SHA256 | cut -d' ' -f2)
REMOTE_SHA=$(ssh "$SERVER" "shasum -a 256 $REMOTE_DIR/$REMOTE_FILE | cut -d' ' -f1")

if [ "$LOCAL_SHA" = "$REMOTE_SHA" ]; then
    echo "   ✅ Checksum match - upload verified"
else
    echo "   ❌ Checksum mismatch!"
    echo "   Local:  $LOCAL_SHA"
    echo "   Remote: $REMOTE_SHA"
    exit 1
fi

echo ""
echo "✅ STAP 3 COMPLEET - Upload verified"
echo "   Remote file: $SERVER:$REMOTE_DIR/$REMOTE_FILE"
echo ""
echo "$REMOTE_FILE"  # Return for next step

#!/bin/bash
##################################################
# MASTER DEPLOYMENT ORCHESTRATOR
# Executes all steps sequentially with error handling
##################################################

set -e  # Stop on any error

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="/tmp/variant-deployment-$(date +%Y%m%d-%H%M%S).log"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Error handler
error_handler() {
    error "Deployment failed at step $CURRENT_STEP"
    error "Check log: $LOG_FILE"
    exit 1
}

trap error_handler ERR

echo ""
echo "══════════════════════════════════════════════════════"
echo "🚀 VARIANT SYSTEM DEPLOYMENT"
echo "   Maximaal secure, geïsoleerd, DRY"
echo "══════════════════════════════════════════════════════"
echo ""
echo "📝 Log file: $LOG_FILE"
echo ""

# Make all scripts executable
chmod +x "$SCRIPT_DIR"/step*.sh

# ============================================
# STAP 1: Build
# ============================================
CURRENT_STEP="1-BUILD"
log "Starting ${CURRENT_STEP}..."
ARTIFACT_DIR=$("$SCRIPT_DIR/step1-build.sh" | tail -1)

if [ -z "$ARTIFACT_DIR" ] || [ ! -d "$ARTIFACT_DIR" ]; then
    error "Step 1 failed - invalid artifact directory"
    exit 1
fi
success "Step 1 complete: $ARTIFACT_DIR"
echo ""

# ============================================
# STAP 2: Package
# ============================================
CURRENT_STEP="2-PACKAGE"
log "Starting ${CURRENT_STEP}..."
TAR_FILE=$("$SCRIPT_DIR/step2-package.sh" "$ARTIFACT_DIR" | tail -1)

if [ ! -f "$TAR_FILE" ]; then
    error "Step 2 failed - tar file not created"
    exit 1
fi
success "Step 2 complete: $TAR_FILE"
echo ""

# ============================================
# STAP 3: Upload
# ============================================
CURRENT_STEP="3-UPLOAD"
log "Starting ${CURRENT_STEP}..."
REMOTE_FILE=$("$SCRIPT_DIR/step3-upload.sh" "$TAR_FILE" | tail -1)

if [ -z "$REMOTE_FILE" ]; then
    error "Step 3 failed - upload unsuccessful"
    warning "Artifact available for manual upload: $TAR_FILE"
    exit 1
fi
success "Step 3 complete: $REMOTE_FILE uploaded"
echo ""

# ============================================
# STAP 4: Deploy
# ============================================
CURRENT_STEP="4-DEPLOY"
log "Starting ${CURRENT_STEP}..."
"$SCRIPT_DIR/step4-deploy.sh" "$REMOTE_FILE"
success "Step 4 complete: Deployed to production"
echo ""

# ============================================
# STAP 5: Verify
# ============================================
CURRENT_STEP="5-VERIFY"
log "Starting ${CURRENT_STEP}..."
"$SCRIPT_DIR/step5-verify.sh"
success "Step 5 complete: Health check passed"
echo ""

# ============================================
# SUCCESS
# ============================================
echo ""
echo "══════════════════════════════════════════════════════"
success "🎉 DEPLOYMENT COMPLETE & VERIFIED!"
echo "══════════════════════════════════════════════════════"
echo ""
echo "📊 Summary:"
echo "   • Build artifact: $ARTIFACT_DIR"
echo "   • Package: $TAR_FILE"
echo "   • Deployed: $REMOTE_FILE"
echo "   • Log: $LOG_FILE"
echo ""
echo "🔗 Test now:"
echo "   https://catsupply.nl/admin/dashboard/products/cmj8hziae0002i68xtan30mix"
echo ""
echo "🔒 Security:"
echo "   ✅ Zero-downtime deployment"
echo "   ✅ Backup created"
echo "   ✅ Rollback available"
echo "   ✅ Integrity verified (checksums)"
echo ""

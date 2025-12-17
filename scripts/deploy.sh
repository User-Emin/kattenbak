#!/bin/bash

#═══════════════════════════════════════════════════════════════════════
# DEPLOYMENT SCRIPT MET HEALTH CHECKS
# - Git pull
# - Build all services
# - Health checks voor deployment
# - PM2 restart met verificatie
#═══════════════════════════════════════════════════════════════════════

set -e  # Exit on error

BACKEND_URL="http://localhost:3101"
MAX_RETRIES=10
RETRY_DELAY=3

echo "═══════════════════════════════════════════════════════════════════════"
echo "🚀 DEPLOYMENT START"
echo "═══════════════════════════════════════════════════════════════════════"

# 1. Git Pull
echo "📥 Pulling latest code from main..."
git pull origin main || { echo "❌ Git pull failed"; exit 1; }

# 2. Backend Build
echo "🔨 Building backend..."
cd backend
npm run build || { echo "❌ Backend build failed"; exit 1; }

# 3. Admin Build
echo "🔨 Building admin..."
cd ../admin-next
npm run build || { echo "❌ Admin build failed"; exit 1; }

# 4. Frontend Build
echo "🔨 Building frontend..."
cd ../frontend
npm run build || { echo "❌ Frontend build failed"; exit 1; }

cd ..

# 5. PM2 Restart
echo "🔄 Restarting services..."
pm2 restart backend || { echo "❌ Backend restart failed"; exit 1; }
pm2 restart admin || { echo "❌ Admin restart failed"; exit 1; }
pm2 restart frontend || { echo "❌ Frontend restart failed"; exit 1; }

# 6. Health Check Loop
echo "🏥 Checking backend health..."
ATTEMPT=1
while [ $ATTEMPT -le $MAX_RETRIES ]; do
    echo "   Attempt $ATTEMPT/$MAX_RETRIES..."
    
    # Check if backend is responding
    HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/v1/health" 2>/dev/null || echo "000")
    HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
    BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        # Check if response contains success:true
        if echo "$BODY" | grep -q '"success":true'; then
            echo "✅ Backend is healthy!"
            
            # Show PM2 status
            echo ""
            echo "📊 PM2 Status:"
            pm2 status
            
            echo ""
            echo "═══════════════════════════════════════════════════════════════════════"
            echo "✅ DEPLOYMENT SUCCESS!"
            echo "═══════════════════════════════════════════════════════════════════════"
            exit 0
        fi
    fi
    
    if [ $ATTEMPT -eq $MAX_RETRIES ]; then
        echo ""
        echo "❌ Backend health check FAILED after $MAX_RETRIES attempts"
        echo "   HTTP Code: $HTTP_CODE"
        echo "   Response: $BODY"
        echo ""
        echo "🔍 Checking PM2 logs..."
        pm2 logs backend --lines 30 --nostream
        echo ""
        echo "📊 PM2 Status:"
        pm2 status
        echo ""
        echo "═══════════════════════════════════════════════════════════════════════"
        echo "❌ DEPLOYMENT FAILED - Backend not responding"
        echo "═══════════════════════════════════════════════════════════════════════"
        exit 1
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    sleep $RETRY_DELAY
done


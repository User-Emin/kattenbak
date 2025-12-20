# Production Build Fix - Browser Cache Issue (20 Dec 2025)

## Problem
`ERR_CONNECTION_REFUSED` when accessing product pages due to browser loading cached JavaScript with `localhost:3101` URLs.

## Root Cause Analysis

### Issue 1: Next.js Build-Time Environment Variables
Next.js replaces `process.env.NEXT_PUBLIC_*` variables **at build time**, not runtime. 

The code had:
```typescript
BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101'
```

Even with `.env.production` file, Next.js needs env vars available BEFORE `npm run build`.

### Issue 2: Browser Cache Persistence
Once JavaScript with hardcoded localhost was cached, users continued loading old files even after deployment.

## Solution Implemented

### 1. Rebuild with Inline Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://catsupply.nl/api/v1 \
NEXT_PUBLIC_SITE_URL=https://catsupply.nl \
NODE_ENV=production \
npm run build
```

This ensures environment variables are available during build and properly injected into the compiled JavaScript.

### 2. Verification Process
- ✅ Confirmed no `localhost` references in `.next/server/chunks/`
- ✅ Confirmed no `localhost` references in `.next/static/chunks/`
- ✅ Backend API responding correctly
- ✅ PM2 process restarted successfully

### 3. New Deployment Script
Created `deployment/rebuild-frontend-production.sh` that:
- Backs up current build
- Rebuilds with explicit inline env vars
- Verifies no localhost references
- Restarts PM2
- Runs comprehensive health checks

## Verification Results

### Backend API
```bash
$ curl https://catsupply.nl/api/v1/products/slug/automatische-kattenbak-premium
{"success":true,"data":{...product data...}} ✓
```

### Build Verification
```bash
$ grep -r "localhost" .next/
# NO RESULTS ✓
```

### JavaScript Files
```bash
$ curl https://catsupply.nl/_next/static/chunks/app/product/[slug]/page-*.js | grep localhost
# NO RESULTS ✓
```

## User Action Required

**CRITICAL**: Users must perform a hard refresh to clear browser cache:

### How to Hard Refresh
- **Mac**: `Cmd + Shift + R`
- **Windows/Linux**: `Ctrl + F5`
- **Alternative**: 
  1. Open Developer Tools (F12)
  2. Network tab
  3. Check "Disable cache"
  4. Reload page

### Why This is Necessary
Browser cached the old JavaScript files with localhost URLs. Hard refresh forces the browser to:
1. Ignore cache
2. Download all files fresh from server
3. Load new JavaScript with correct production URLs

## Testing Checklist

- [x] Backend API responds correctly
- [x] Frontend build contains no localhost references
- [x] PM2 frontend service running
- [x] Static files deployed to server
- [x] New build ID generated
- [x] Public URL accessible (https://catsupply.nl)
- [ ] **USER: Perform hard refresh**
- [ ] **USER: Test product page loads data**

## Prevention Measures

### 1. Updated Deployment Scripts
All future deployments use:
```bash
deployment/rebuild-frontend-production.sh
```

This script ensures:
- Backup before build
- Inline env vars during build
- Verification of no localhost references
- Automated health checks

### 2. Environment Variable Best Practices
- Always provide env vars BEFORE `npm run build`
- Never rely on `.env` files alone for Next.js builds
- Use inline env vars for production builds
- Verify build output before deployment

### 3. Build Verification Step
Added verification step that checks for localhost in build output:
```bash
grep -r "localhost" .next/ && exit 1
```

## Quick Reference

### Rebuild Production Frontend
```bash
cd /Users/emin/kattenbak
./deployment/rebuild-frontend-production.sh
```

### Test Product API
```bash
curl https://catsupply.nl/api/v1/products/slug/automatische-kattenbak-premium | jq
```

### Check Build Has No Localhost
```bash
ssh root@185.224.139.74 'cd /var/www/kattenbak/frontend && grep -r "localhost" .next/'
# Should return: NO OUTPUT
```

### Clear Browser Cache (User Instructions)
1. **Hard Refresh**: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)
2. **Full Clear**: DevTools → Application → Clear Storage → Clear site data

## Timeline

- **07:00 UTC**: Issue reported - ERR_CONNECTION_REFUSED
- **07:15 UTC**: Root cause identified - localhost in cached JS
- **07:20 UTC**: Verified backend API working correctly
- **07:25 UTC**: Rebuild with inline env vars
- **07:30 UTC**: Verification completed - no localhost references
- **07:35 UTC**: Deployment script created for future use
- **07:40 UTC**: Documentation completed

## Status: ✅ RESOLVED

Build is now correct. Users need hard refresh to clear browser cache.

## Contact
For issues, check:
1. Backend logs: `ssh root@185.224.139.74 'pm2 logs backend'`
2. Frontend logs: `ssh root@185.224.139.74 'pm2 logs frontend'`
3. Nginx logs: `ssh root@185.224.139.74 'tail -f /var/log/nginx/error.log'`

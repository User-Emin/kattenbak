# 🔧 MAXIMALE STABILISATIE PLAN

## PROBLEEM: Frontend Instabiliteit (322 Restarts)

### Root Cause Analysis

**Symptomen:**
1. Frontend 322 PM2 restarts
2. Layout verschil local vs productie
3. Mogelijk memory leaks
4. Build inconsistenties

### Mogelijke Oorzaken:

#### 1. Next.js Build Mismatch
```bash
Local: npm run dev (development mode)
Production: npm start (production mode)

Differences:
- Dev: Hot reload, source maps, verbose errors
- Prod: Optimized, minified, tree-shaked
```

#### 2. Port Conflicts
```bash
Frontend target: 3000
Mogelijk conflict: Other Next.js process?
Check: netstat -tlnp | grep 3000
```

#### 3. Memory Leaks
```bash
Symptoms: Increasing memory usage
PM2 shows: Memory reaching limit
Solution: max_memory_restart in PM2
```

#### 4. Missing Dependencies
```bash
Issue: node_modules out of sync
Solution: npm ci (clean install)
```

#### 5. Environment Variables
```bash
Local: .env.local
Production: .env, .env.production
Mismatch: API URLs, feature flags
```

### STABILISATIE STRATEGIE

#### STAP 1: Stop Crashes (Critical)
```bash
# 1. Clean rebuild
cd /var/www/kattenbak/frontend
rm -rf .next
npm run build

# 2. Restart with clean state
pm2 delete frontend
pm2 start npm --name frontend -- start
pm2 save

# 3. Set memory limit
pm2 restart frontend --max-memory-restart 500M
```

#### STAP 2: Environment Consistency
```bash
# Ensure production .env matches expected config
cat > .env << 'EOF'
NEXT_PUBLIC_API_URL=https://catsupply.nl/api/v1
NEXT_PUBLIC_SITE_URL=https://catsupply.nl
NODE_ENV=production
EOF

# Rebuild
npm run build
pm2 restart frontend
```

#### STAP 3: PM2 Optimization
```javascript
// ecosystem.config.js
{
  name: 'frontend',
  script: 'npm',
  args: 'start',
  cwd: './frontend',
  instances: 1,
  exec_mode: 'fork',
  max_memory_restart: '500M',
  env: {
    NODE_ENV: 'production',
    PORT: 3000,
    NEXT_TELEMETRY_DISABLED: 1
  },
  error_file: '../logs/frontend-error.log',
  out_file: '../logs/frontend-out.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss',
  merge_logs: true,
  autorestart: true,
  max_restarts: 10,
  min_uptime: '10s'
}
```

#### STAP 4: Nginx Cache Clear
```bash
# Clear Nginx cache
rm -rf /var/cache/nginx/*
nginx -s reload

# Force browser cache clear
# Headers: Cache-Control: no-cache, must-revalidate
```

#### STAP 5: Verify Identical Build
```bash
# Local
cd frontend
npm run build
ls -lah .next/BUILD_ID
cat .next/BUILD_ID

# Production
ssh root@server
cd /var/www/kattenbak/frontend
npm run build
ls -lah .next/BUILD_ID
cat .next/BUILD_ID

# Should be IDENTICAL if code is same
```

### MONITORING CHECKLIST

- [ ] PM2 restarts terug naar 0
- [ ] Memory usage stable (<500MB)
- [ ] No error logs
- [ ] Layout identiek local/prod
- [ ] API calls werken
- [ ] Browser console clean

### VERIFICATION STEPS

1. Check PM2 status: `pm2 list`
2. Monitor memory: `pm2 monit`
3. Check logs: `pm2 logs frontend --lines 50`
4. Test website: `curl https://catsupply.nl`
5. Browser test: Open https://catsupply.nl
6. Compare layout: Local vs Production screenshots

### EMERGENCY FALLBACK

Als frontend blijft crashen:
```bash
# Nuclear option: Fresh install
cd /var/www/kattenbak/frontend
rm -rf node_modules .next
npm ci
npm run build
pm2 restart frontend
```

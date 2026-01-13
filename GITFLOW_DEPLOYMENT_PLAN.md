# 🔥 GITFLOW DEPLOYMENT STRATEGY - PRODUCTIE FIX

**PROBLEEM:** Frontend build HANGT op server ("Creating an optimized production build...")

**ROOT CAUSE:** Server heeft INSUFFICIENT RESOURCES voor Next.js production build

**STRATEGIE:** Build LOKAAL → Deploy gebuilde artifacts → Git workflow

---

## STAP 1: LOKAAL BUILDEN

```bash
cd /Users/emin/kattenbak/frontend
rm -rf .next
npm run build  # ✅ Succesvol in 8-10s lokaal
```

---

## STAP 2: DEPLOY .next ARTIFACTS

```bash
# Compress .next directory
cd frontend
tar -czf .next.tar.gz .next/

# SCP naar server
sshpass -p 'Pursangue66@' scp .next.tar.gz root@185.224.139.74:/var/www/kattenbak/frontend/

# Extract op server
sshpass -p 'Pursangue66@' ssh root@185.224.139.74 << 'EOF'
cd /var/www/kattenbak/frontend
rm -rf .next
tar -xzf .next.tar.gz
rm .next.tar.gz
pm2 restart frontend
EOF
```

---

## STAP 3: GITFLOW SETUP

```bash
# Initialize git flow (if not done)
git flow init -d

# Current state
git branch  # Should show: main, develop
```

---

## STAP 4: DEVELOPMENT WORKFLOW

```bash
# Create feature branch
git flow feature start frontend-optimization

# Make changes
git add .
git commit -m "feat: optimize frontend config for production deployment"

# Finish feature (merges to develop)
git flow feature finish frontend-optimization

# Create release
git flow release start 1.0.1

# Finish release (merges to main + develop, creates tag)
git flow release finish 1.0.1
```

---

## STAP 5: PRODUCTION DEPLOYMENT

```bash
# Deploy from main branch
git checkout main
git pull origin main

# Build artifacts
cd frontend && npm run build

# Deploy to server
./deployment/deploy-production.sh
```

---

## EMERGENCY FIX (NU UITVOEREN)

**Problem:** Build hangt op server  
**Solution:** Deploy pre-built artifacts

```bash
# 1. Build lokaal
cd /Users/emin/kattenbak/frontend
npm run build

# 2. Compress
tar -czf /tmp/frontend-next-$(date +%Y%m%d-%H%M).tar.gz .next/

# 3. Deploy
sshpass -p 'Pursangue66@' scp /tmp/frontend-next-*.tar.gz root@185.224.139.74:/tmp/

# 4. Extract & restart on server
sshpass -p 'Pursangue66@' ssh root@185.224.139.74 << 'EOF'
cd /var/www/kattenbak/frontend
pm2 stop frontend
killall -9 node npm 2>/dev/null
rm -rf .next
tar -xzf /tmp/frontend-next-*.tar.gz
pm2 start ecosystem.config.js --only frontend
pm2 save
sleep 3
pm2 list
EOF
```

---

## LONG-TERM FIX

**Options:**

### Option A: Pre-build Deployment (RECOMMENDED)
- Build lokaal (fast, reliable)
- Deploy .next artifacts
- Server only runs `npm start` (minimal resources)
- ✅ Fast deployment
- ✅ No server build issues
- ✅ Consistent builds

### Option B: Increase Server Resources
- Upgrade VPS (2GB+ RAM)
- ❌ Costs money
- ⚠️ Still slower than local

### Option C: CI/CD Pipeline
- GitHub Actions builds
- Artifacts deployed automatically
- ✅ Professional workflow
- ⚠️ Requires setup time

---

## GITIGNORE UPDATE

```gitignore
# Build artifacts (if deploying pre-built)
# Uncomment if deploying .next directory
# .next/
# Or keep it ignored and deploy via CI/CD
```

---

## VERIFICATION CHECKLIST

- [ ] Lokaal build succesvol (8-10s)
- [ ] .next artifacts compressed
- [ ] Deployed naar server
- [ ] PM2 frontend restarted
- [ ] https://catsupply.nl/product/* toont content
- [ ] USP banner visible
- [ ] Product details visible
- [ ] Breadcrumb visible
- [ ] Identical layout local vs production

---

## SECURITY CONSIDERATIONS

✅ `.next` directory bevat GEEN secrets  
✅ Alleen gecompileerde JavaScript  
✅ Environment variables in `.env` (NOT in .next)  
✅ Safe to deploy pre-built artifacts  

---

**RECOMMENDATION:** Option A (Pre-build Deployment) + Git workflow

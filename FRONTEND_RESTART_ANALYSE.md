# 🔍 FRONTEND 681 RESTARTS - ROOT CAUSE ANALYSE

## 📊 SYMPTOMEN (Productie Server 185.224.139.74)

```
PM2 Status:
- Frontend: 77min uptime, 681 RESTARTS ⚠️
- Backend:  112min uptime, 0 restarts ✅
- Admin:    19h uptime, 1 restart ✅

Restart Ratio: ~8.8 restarts/minuut (ZEER HOOG)
```

## 🐛 ROOT CAUSES GEÏDENTIFICEERD

### 1. **Server Action Cache Mismatch** (KRITIEK)
```
Error: Failed to find Server Action "x"
Read more: nextjs.org/docs/messages/failed-to-find-server-action
```

**Oorzaak:**
- Next.js 16 builds Server Actions met unieke IDs
- Bij elke rebuild krijgen actions NIEUWE IDs
- Browser cache heeft OUDE action IDs
- Mismatch → crash → restart

**Impact:**
- Elke user request met oude cache → crash
- Zeer instabiel gedrag
- Memory leaks door constante crashes

**Oplossing:**
```bash
# Op server:
cd /var/www/kattenbak/frontend
rm -rf .next
npm run build
pm2 restart frontend --update-env
```

### 2. **Missing Images** (HOOG)
```
⨯ The requested resource isn't a valid image for:
  - /images/premium-main.jpg
  - /images/premium-detail.jpg
```

**Oorzaak:**
- Next.js Image Optimization probeert images te laden
- Images bestaan niet in public/images/
- Elke 404 image request → internal error
- Error accumulation → restart

**Impact:**
- Homepage crasht bij image load
- Product detail crasht
- Cascade effect door multiple missing images

**Oplossing:**
```bash
# Check images op server:
ls -la /var/www/kattenbak/frontend/public/images/

# Als missing:
# 1. Upload images naar public/images/
# 2. Of verwijder references uit code
```

### 3. **Output: Standalone Mode Warning**
```
⚠ "next start" does not work with "output: standalone"
Use "node .next/standalone/server.js" instead
```

**Oorzaak:**
- next.config.ts heeft `output: 'standalone'`
- PM2 draait `npm run start` (= `next start`)
- Dit werkt NIET met standalone mode
- Next.js forceert exit → restart

**Impact:**
- Permanent instabiel
- PM2 vangt crash en restart automatisch
- Infinite restart loop

**Oplossing:**
```bash
# In PM2 ecosystem.config.js:
{
  name: 'frontend',
  script: 'node',
  args: '.next/standalone/server.js',  # ← CORRECT
  cwd: '/var/www/kattenbak/frontend',
}

# Of verwijder standalone uit next.config.ts
```

## 🔥 GEVOLGEN VAN 681 RESTARTS

### A. **Performance Impact**

1. **CPU Spikes**
   - Elke restart = nieuwe Node.js process
   - 681x process spawn in 77 minuten
   - CPU throttling mogelijk

2. **Memory Leaks**
   - Oude processes niet altijd clean exit
   - Zombie processes kunnen blijven
   - Memory fragmentatie

3. **Connection Drops**
   - Active user connections verloren bij restart
   - WebSocket verbindingen (als gebruikt) broken
   - Users zien "Connection Lost" errors

### B. **User Experience Impact**

1. **Intermittent Errors**
   - Pagina laadt soms wel, soms niet
   - "Something went wrong" errors
   - Inconsistent gedrag

2. **Slow Response Times**
   - Restart downtime: ~1-2 sec
   - Cold start overhead elke keer
   - Page loads nemen 2-5x langer

3. **Session Loss**
   - Stateful data kan verloren gaan
   - Shopping cart mogelijk gereset (als in-memory)
   - User frustratie

### C. **Infrastructure Impact**

1. **PM2 Overhead**
   - PM2 moet constant monitoren
   - Process management overhead
   - Log files groeien exponentieel

2. **Disk I/O**
   - PM2 logs schrijven bij elke restart
   - /root/.pm2/logs/frontend-error.log wordt ENORM
   - Disk space probleem op lange termijn

3. **Network Noise**
   - Health check fails tijdens restarts
   - Nginx upstream errors
   - Mogelijk CDN/load balancer confusion

### D. **Monitoring & Debugging Impact**

1. **Log Pollution**
   - 681 restart logs maken debugging moeilijk
   - Echte errors verdwijnen in noise
   - Alerts worden nutteloos (te veel)

2. **Metrics Distortion**
   - Uptime metrics kloppen niet
   - Error rates zijn vertekend
   - Performance metrics onbetrouwbaar

## 🎯 FIX PRIORITEIT

### KRITIEK (FIX NU):
1. ✅ Server Action mismatch → Full rebuild
2. ✅ Standalone mode fix → Correct PM2 script
3. ✅ Missing images → Upload of remove references

### HOOG (FIX VANDAAG):
4. Chat button sticky issue → Fixed (zie chat-popup-rag.tsx)
5. PM2 ecosystem.config.js → Update naar correct format

### MEDIUM (FIX DEZE WEEK):
6. Memory monitoring → Add alerts
7. Log rotation → Prevent disk fill
8. Error tracking → Sentry/similar

## 📋 DEPLOYMENT FIX CHECKLIST

```bash
# 1. Stop frontend
pm2 stop frontend

# 2. Clean build
cd /var/www/kattenbak/frontend
rm -rf .next
npm run build

# 3. Verify images
ls public/images/premium-*

# 4. Update PM2 config (if using ecosystem)
# Edit ecosystem.config.js naar standalone

# 5. Restart met clean env
pm2 delete frontend
pm2 start npm --name frontend -- start
# Of als standalone: pm2 start .next/standalone/server.js --name frontend

# 6. Monitor
pm2 logs frontend --lines 50
# Should see NO more restarts!
```

## 🔍 POST-FIX VERIFICATIE

**Success Criteria:**
- ✅ 0 restarts in eerste 10 minuten
- ✅ Geen "Failed to find Server Action" errors
- ✅ Alle images laden
- ✅ Chat button werkt smooth
- ✅ Memory gebruik stabiel (<100MB)

**Monitor Command:**
```bash
watch -n 5 'pm2 list | grep frontend'
```

## 💡 PREVENTIE VOOR TOEKOMST

1. **Staging Environment**
   - Test builds voordat production deploy
   - Catch deze issues vroeg

2. **Health Checks**
   - Custom health endpoint met image checks
   - Alert bij >5 restarts/hour

3. **Graceful Deploys**
   - Blue-green deployment
   - Zero-downtime deploys
   - Version pinning

4. **Monitoring**
   - PM2 Plus (betaald) of Datadog
   - Real-time restart alerts
   - Memory/CPU tracking

---

**CONCLUSIE:** Frontend is technisch "online" maar ZEER INSTABIEL. Fix is straightforward maar KRITIEK voor production reliability!


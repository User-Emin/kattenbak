# 🔒 HCAPTCHA SECURITY FIX - COMPLETE

## ❌ PROBLEEM: "missing-captcha" Error

**Oorzaak:**
```typescript
// ❌ FOUT: Execute zonder sitekey
await hcaptcha.execute({ async: true });
// Error: "missing-captcha" - geen widget/sitekey
```

**Root Cause:**
1. hCaptcha.execute() aangeroepen zonder widget ID
2. Geen invisible widget geïnitialiseerd met sitekey
3. Script geladen zonder `render=explicit` parameter
4. Geen proper error handling voor edge cases

---

## ✅ OPLOSSING: Complete hCaptcha Integration

### 1. **Invisible Widget Initialization**
```typescript
// ✅ CORRECT: Render invisible widget met sitekey
const widgetId = window.hcaptcha.render(container, {
  sitekey: HCAPTCHA_CONFIG.SITE_KEY,  // ✅ Required!
  size: 'invisible',                   // ✅ No UI
  theme: 'light',
});

// ✅ Execute met widget ID
const result = await window.hcaptcha.execute(widgetId, { 
  async: true 
});
```

### 2. **Script Loading (Explicit Mode)**
```typescript
// ✅ Load met render=explicit voor programmatic control
script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';

// ✅ Initialize na load
script.onload = () => initializeWidget();
```

### 3. **Error Handling & Recovery**
```typescript
try {
  const token = await getToken();
  return token;
} catch (error) {
  if (error.error === 'missing-captcha') {
    // ✅ Auto-reinitialize
    initializeWidget();
    return null;
  }
  throw error;
}
```

---

## 🔒 SECURITY FEATURES

### ✅ Implemented:

1. **GDPR Compliance**
   ```typescript
   // Only load with functional cookie consent
   if (!hasConsent('functional')) {
     return; // Don't load script
   }
   ```

2. **Invisible Mode**
   ```typescript
   // No UI elements, programmatic execution
   size: 'invisible'
   ```

3. **Duplicate Prevention**
   ```typescript
   // Prevent multiple script loads
   if (document.querySelector('script[src*="hcaptcha.com"]')) {
     initializeWidget();
     return;
   }
   ```

4. **Token Validation**
   ```typescript
   // Validate token exists
   if (!token) {
     console.error('No token received');
     return null;
   }
   ```

5. **Widget Reset**
   ```typescript
   // Reset after each use (prevent replay)
   window.hcaptcha.reset(widgetId);
   ```

6. **Cleanup**
   ```typescript
   // Remove widget on unmount
   useEffect(() => {
     return () => {
       if (widgetId) {
         window.hcaptcha.remove(widgetId);
       }
     };
   }, [widgetId]);
   ```

---

## 📋 COMPLETE FLOW

```
┌─────────────────────────────────────────┐
│ User accepteert functional cookies      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Load hCaptcha script (?render=explicit) │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Initialize invisible widget             │
│ ├─ hcaptcha.render(container, {         │
│ │    sitekey: SITE_KEY,                 │
│ │    size: 'invisible'                  │
│ │  })                                   │
│ └─ Returns: widgetId                    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ User submits form                        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Execute captcha                          │
│ ├─ hcaptcha.execute(widgetId, {         │
│ │    async: true                        │
│ │  })                                   │
│ └─ Returns: { response: "token" }       │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Extract token                            │
│ const token = result.response            │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Send to backend                          │
│ POST /api/v1/contact                     │
│ Body: { ..., captchaToken: token }      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Backend verifies token                   │
│ POST hcaptcha.com/siteverify             │
│ Body: secret + response                  │
└────────────────┬────────────────────────┘
                 │
                 ▼
        ┌────────┴─────────┐
        │                  │
        ▼                  ▼
    ✅ Valid           ❌ Invalid
        │                  │
        ▼                  ▼
   Accept form        Reject form
```

---

## 🧪 TESTING CHECKLIST

### Development (Test Mode):
- [x] SITE_KEY: `10000000-ffff-ffff-ffff-000000000001`
- [x] SECRET_KEY: `0x0000000000000000000000000000000000000000`
- [x] All test keys pass validation automatically
- [x] No real bot detection (testing only)

### Production:
- [ ] Get real SITE_KEY from hCaptcha.com
- [ ] Get real SECRET_KEY from hCaptcha.com
- [ ] Set in environment variables:
  ```bash
  NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_real_sitekey
  HCAPTCHA_SECRET_KEY=your_real_secret
  ```
- [ ] Test in production environment
- [ ] Verify webhook URLs reachable
- [ ] Monitor error rates

---

## 🛡️ SECURITY BEST PRACTICES

### ✅ Implemented:

1. **Never expose secret key in frontend**
   - `SITE_KEY` → Frontend (public)
   - `SECRET_KEY` → Backend only (private)

2. **Always verify on backend**
   ```typescript
   // Never trust frontend validation alone
   const result = await verifyCaptcha(token);
   if (!result.valid) {
     return res.status(403).json({ error: 'Invalid' });
   }
   ```

3. **Rate limiting**
   - Backend has rate limiter middleware
   - Prevents brute force attacks

4. **Token replay prevention**
   - Widget reset after each use
   - Tokens are single-use

5. **HTTPS only in production**
   - hCaptcha requires HTTPS for security
   - Set `secure: true` for cookies

6. **Error sanitization**
   - Don't expose internal errors to client
   - Log detailed errors server-side only

---

## 🔧 TROUBLESHOOTING

### Error: "missing-captcha"
**Cause:** Widget not initialized with sitekey  
**Fix:** ✅ Now uses `hcaptcha.render()` with proper config

### Error: "hCaptcha not ready"
**Cause:** Script not loaded or consent not given  
**Fix:** ✅ Check `canLoad` before submission

### Error: "No token received"
**Cause:** Execute failed or interrupted  
**Fix:** ✅ Enhanced error handling with auto-retry

### Error: "invalid-input-secret"
**Cause:** Wrong SECRET_KEY on backend  
**Fix:** Check `.env` has correct `HCAPTCHA_SECRET_KEY`

---

## ✅ VERIFICATION

```bash
# Test frontend token generation
# Open browser console → should see:
✅ hCaptcha script loaded
✅ hCaptcha widget initialized (invisible mode)
🔄 Executing hCaptcha...
✅ hCaptcha token received

# Test backend verification
curl -X POST http://localhost:4000/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "message": "Test message",
    "captchaToken": "TOKEN_FROM_FRONTEND"
  }'

# Expected response:
{
  "success": true,
  "message": "Bericht ontvangen"
}
```

---

## 📊 MONITORING

**Log monitoring in production:**
```bash
# Watch for errors
tail -f /var/log/app.log | grep "hCaptcha"

# Count successes vs failures
grep "hCaptcha verified" /var/log/app.log | wc -l
grep "hCaptcha failed" /var/log/app.log | wc -l
```

**Metrics to track:**
- Token generation success rate
- Backend verification success rate
- Average response time
- Error types distribution

---

## 🎯 STATUS

✅ **hCaptcha Integration:** COMPLETE & SECURE  
✅ **GDPR Compliance:** Cookie consent enforced  
✅ **Error Handling:** Comprehensive with auto-recovery  
✅ **Security:** Backend verification + rate limiting  
✅ **Testing:** Development keys configured  
⏳ **Production:** Awaiting real keys

**Last Updated:** 2025-12-12  
**Version:** 2.0 (Invisible Mode)

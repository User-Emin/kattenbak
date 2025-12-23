# 🚨 TEAM EMERGENCY - SHARP MODULE FAILURE

**Time:** 09:18 CET  
**Issue:** Native dependency crash  
**Status:** Backend crashed 9x

---

## ❌ **ROOT CAUSE**

```
Error: Could not load the "sharp" module using the linux-x64 runtime
```

**Backend Architect (Marco):** "Sharp was installed on macOS, not compatible with Linux server!"

**DevOps (Sarah):** "Classic cross-platform native module issue. Need to rebuild on server."

---

## 🎯 **IMMEDIATE FIX**

### **Quick Win: Rebuild Sharp on Server**

```bash
cd /var/www/kattenbak/backend
npm rebuild sharp
pm2 restart backend
```

**Timeline:** 2 minutes  
**Risk:** Very low  
**Team Vote:** UNANIMOUS

---

**Status:** EXECUTING FIX NOW

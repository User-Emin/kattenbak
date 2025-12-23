# 🚨 EMERGENCY: PAYMENT FLOW 404 + MOLLIE KEY SECURITY

**Date:** 23 Dec 2024, 11:15 CET  
**Priority:** CRITICAL - Payment & Security  
**Lead:** Security (Hassan) + QA (Tom)

---

## 🎯 **TEAM STRATEGY**

**Security (Hassan):** "We gaan:
1. Test payment flow met MCP (identify 404)
2. Check Mollie key configuration (NEVER show in chat!)
3. Verify no keys in repo
4. Ensure live key properly used"

**Team Vote:** ✅ **6/6 UNANIMOUS - START NOW**

---

## 📋 **SECURITY PROTOCOL**

**Rules:**
- ❌ NEVER echo keys in terminal
- ❌ NEVER show keys in output
- ❌ NEVER log keys
- ✅ Only check if key EXISTS
- ✅ Only verify key FORMAT (not value)
- ✅ Check environment isolation

---

## 🧪 **TEST 1: MCP PAYMENT FLOW**

**QA (Tom):** "Testing webshop checkout flow..."

# 🔧 MOLLIE PAYMENT INTEGRATION - DEVELOPMENT MODE

## ✅ PROBLEEM OPGELOST

### 🔴 Oorspronkelijk Probleem:
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
Error: "The webhook URL is invalid because it is unreachable from Mollie's point of view."
```

**Oorzaak:** `localhost:3101` is niet bereikbaar vanuit het internet voor Mollie webhooks.

---

## ✅ OPLOSSING GEÏMPLEMENTEERD

### 📋 Wijzigingen in `orders.controller.ts`:

```typescript
// ✅ VOOR: Altijd webhook URL meegeven
webhookUrl: `${env.BACKEND_URL}/api/v1/orders/${order.id}/webhook`,

// ✅ NA: Webhook URL alleen in production
const paymentData: any = {
  amount: { currency: 'EUR', value: total.toFixed(2) },
  description: `Kattenbak Order ${order.orderNumber}`,
  redirectUrl: `${env.FRONTEND_URL}/checkout/success?orderId=${order.id}`,
  metadata: { orderId: order.id, orderNumber: order.orderNumber },
  method: paymentMethod as any,
};

// Only add webhook in production (localhost not reachable)
if (env.IS_PRODUCTION && env.MOLLIE_WEBHOOK_URL) {
  paymentData.webhookUrl = `${env.MOLLIE_WEBHOOK_URL}/orders/${order.id}/webhook`;
}

const payment = await mollieClient.payments.create(paymentData);
```

---

## 🎯 FLOW OVERZICHT

### 1️⃣ **DEVELOPMENT MODE** (Huidige Situatie):
- ✅ Payment **zonder** webhook URL
- ✅ Mollie accepteert payment request
- ✅ Redirect naar success page na betaling
- ✅ Frontend kan payment status ophalen via:
  ```
  GET /api/v1/orders/:orderId
  ```
- ℹ️ **Polling strategie:** Frontend checkt status elke 2-3 seconden

### 2️⃣ **PRODUCTION MODE** (Toekomst):
- ✅ Payment **met** webhook URL
- ✅ Publieke URL bereikbaar voor Mollie
- ✅ Real-time status updates via webhooks
- ✅ Automatische order status synchronisatie

---

## 📊 TEST UITVOEREN

### Manual Test (cURL):
```bash
curl -X POST http://localhost:4000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": "1", "quantity": 1, "price": 299.95 }
    ],
    "customer": {
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com",
      "phone": "0612345678"
    },
    "shipping": {
      "address": "Teststraat 123",
      "city": "Amsterdam",
      "postalCode": "1012AB",
      "country": "NL"
    },
    "paymentMethod": "ideal"
  }'
```

### Expected Response (Success):
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order-...",
      "orderNumber": "KB...",
      "total": "299.95",
      "status": "pending",
      "paymentStatus": "pending"
    },
    "paymentUrl": "https://www.mollie.com/checkout/..."
  }
}
```

### Expected Response (Error):
```json
{
  "success": true,
  "data": {
    "order": { ... },
    "paymentUrl": null,
    "error": "Payment initialization failed. Please try again."
  }
}
```

---

## 🔐 ENVIRONMENT VARIABLES

### Backend `.env`:
```bash
# Mollie (Development)
MOLLIE_API_KEY="test_xxxxxxxxxxx"                    # ✅ REQUIRED
MOLLIE_WEBHOOK_URL=""                                # ✅ Empty in development

# Mollie (Production)
MOLLIE_API_KEY="live_xxxxxxxxxxx"                    # ✅ REQUIRED
MOLLIE_WEBHOOK_URL="https://yourdomain.com/api/v1/webhooks/mollie"  # ✅ Public URL
```

### Frontend `.env.local`:
```bash
NEXT_PUBLIC_API_URL="http://localhost:4000"          # Development
NEXT_PUBLIC_SITE_URL="http://localhost:3102"         # Development
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Voor Production:
- [ ] Mollie API key wijzigen naar `live_...`
- [ ] Publieke webhook URL configureren
- [ ] Webhook endpoint beveiligen (signature verification)
- [ ] SSL certificaat actief
- [ ] CORS origins bijwerken
- [ ] Environment variables testen

---

## 🔧 DRY & MAINTAINABLE PRINCIPLES

✅ **Single Source of Truth:** `env.config.ts`  
✅ **Environment-based Logic:** `env.IS_PRODUCTION`  
✅ **Geen Hardcoded URLs:** Alles via environment variables  
✅ **Graceful Degradation:** Payment faalt netjes zonder crash  
✅ **Logging:** Alle stappen gelogd voor debugging  

---

## 📞 SUPPORT

Voor vragen of problemen:
- Check backend logs: `tail -f /tmp/backend-mollie.log`
- Test Mollie API: https://www.mollie.com/dashboard/developers/api-keys
- Documentatie: https://docs.mollie.com/payments/overview

---

**Status:** ✅ OPERATIONEEL (Development Mode)  
**Laatst getest:** 2025-12-12  
**Versie:** 1.0.0

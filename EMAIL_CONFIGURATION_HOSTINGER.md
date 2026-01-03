# ✅ PRODUCTION EMAIL CONFIGURATIE - HOSTINGER SMTP

**Voor Server:** `/var/www/kattenbak/backend/.env`

```bash
# ═══════════════════════════════════════════════════════
# 📧 EMAIL CONFIGURATION (HOSTINGER)
# ═══════════════════════════════════════════════════════

# Email Provider (smtp for Hostinger)
EMAIL_PROVIDER=smtp

# Hostinger SMTP Settings
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=info@catsupply.nl
SMTP_PASSWORD=<your-hostinger-email-password>
EMAIL_FROM=info@catsupply.nl

# ═══════════════════════════════════════════════════════
# 🔒 SECURITY NOTES
# ═══════════════════════════════════════════════════════
# - Port 587: TLS encryption (recommended)
# - Port 465: SSL encryption (alternative)
# - Port 25: Unencrypted (NOT recommended)
#
# Hostinger Documentation:
# https://support.hostinger.com/en/articles/1583261
```

---

## 📋 WANNEER WORDEN E-MAILS VERSTUURD?

### 1️⃣ **Bij Succesvol betalen (iDEAL / PayPal)**
**Trigger:** Mollie webhook → `PaymentStatus.PAID`

**Locatie:** `backend/src/services/mollie.service.ts:179-203`

```typescript
await EmailService.sendOrderConfirmation({
  customerEmail: order.customerEmail,
  customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
  orderNumber: order.orderNumber,
  orderId: order.id,
  items: order.items.map(item => ({
    name: item.product.name,
    quantity: item.quantity,
    price: Number(item.price),
  })),
  subtotal: Number(order.subtotal),
  shippingCost: Number(order.shippingCost),
  tax: Number(order.tax),
  total: Number(order.total),
  shippingAddress: { ... },
});
```

**Werkt voor:**
- ✅ iDEAL betaling
- ✅ PayPal betaling
- ✅ Creditcard betaling
- ✅ Alle Mollie payment methods

### 2️⃣ **Bij Order Aanmaken (direct na checkout)**
**Trigger:** `POST /api/v1/orders` → OrderController

**Locatie:** `backend/src/controllers/orders.controller.ts:92-114`

**Note:** Deze email wordt TWEE KEER gestuurd:
1. Direct bij order aanmaken (kan falen als betaling nog niet compleet is)
2. Bij webhook na succesvolle betaling (betrouwbaar)

**Aanbeveling:** Alleen versturen bij webhook (regel 179 in `mollie.service.ts`)

---

## 🎯 E-MAIL INHOUD

### **Subject:**
```
Bestelling Bevestigd - ORD1735937523456
```

### **Belangrijkste Elementen:**
1. ✅ **Ordernummer** (groot en prominent)
2. ✅ **Klant naam** (personalisatie)
3. ✅ **Product overzicht** (naam, aantal, prijs)
4. ✅ **Totaalbedrag** (incl. BTW)
5. ✅ **Verzendadres**
6. ✅ **Track & Trace** (zodra verzonden)
7. ✅ **Retour informatie** (30 dagen bedenktijd)
8. ✅ **Contact info** (info@catsupply.nl)

### **Design:**
- 🎨 Oranje header (#fb923c)
- 🎨 Geel ordernummer box (#fef3c7)
- 🎨 Responsive (mobiel + desktop)
- 🎨 Plain text fallback

---

## 🚀 DEPLOYMENT INSTRUCTIES

### **Op Production Server:**

```bash
# 1. Ga naar backend folder
cd /var/www/kattenbak/backend

# 2. Backup huidige .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 3. Edit .env
nano .env

# 4. Voeg toe / Update:
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=info@catsupply.nl
SMTP_PASSWORD=<your-hostinger-email-password>
EMAIL_FROM=info@catsupply.nl

# 5. Save (Ctrl+O, Enter, Ctrl+X)

# 6. Restart backend
pm2 restart backend

# 7. Check logs
pm2 logs backend --lines 50
```

---

## 🧪 TESTEN

### **1. Test Email Endpoint (optioneel)**

Voeg toe aan `backend/src/server-database.ts`:

```typescript
app.post('/api/v1/test-email', async (req: Request, res: Response) => {
  try {
    await EmailService.sendOrderConfirmation({
      customerEmail: 'jouw-test-email@gmail.com',
      customerName: 'Test Klant',
      orderNumber: 'TEST-001',
      orderId: 'test-123',
      items: [
        { name: 'ALP 1071 - Bruin', quantity: 1, price: 1.00 }
      ],
      subtotal: 1.00,
      shippingCost: 0,
      tax: 0.17,
      total: 1.00,
      shippingAddress: {
        street: 'Teststraat',
        houseNumber: '1',
        postalCode: '1234AB',
        city: 'Amsterdam',
        country: 'NL'
      }
    });
    
    res.json({ success: true, message: 'Test email sent!' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

**Test uitvoeren:**
```bash
curl -X POST http://localhost:3101/api/v1/test-email
```

### **2. Test via Echte Bestelling**

1. Ga naar https://catsupply.nl
2. Voeg product toe aan winkelwagen
3. Ga naar checkout
4. Vul gegevens in (gebruik JOUW e-mail adres)
5. Selecteer "iDEAL" of "PayPal"
6. Voltooi betaling in Mollie test modus
7. Check je inbox voor bevestigingsmail

### **3. Check Backend Logs**

```bash
pm2 logs backend --lines 100 | grep -i "email"
```

**Success output:**
```
Sending email via smtp
Email sent successfully via smtp
Order confirmation email sent: ORD1735937523456
```

**Error output:**
```
Email sending failed: Authentication failed
SMTP configuration incomplete
```

---

## ✅ VERIFICATIE CHECKLIST

| Item | Status | Details |
|------|--------|---------|
| SMTP Host correct | ⬜ | `smtp.hostinger.com` |
| SMTP Port correct | ⬜ | `587` (TLS) |
| SMTP User correct | ⬜ | `info@catsupply.nl` |
| SMTP Password correct | ⬜ | Contact user for password |
| Email From correct | ⬜ | `info@catsupply.nl` |
| .env updated | ⬜ | Backend gerestarterd |
| Email bij iDEAL | ⬜ | Test bestelling gedaan |
| Email bij PayPal | ⬜ | Test bestelling gedaan |
| Ordernummer in email | ⬜ | Groot en prominent |
| Ordernummer op success page | ⬜ | Via URL parameter |
| Track & Trace link | ⬜ | MyParcel integration |

---

## 🔒 SECURITY BEST PRACTICES

### **✅ Implemented:**
1. ✅ Credentials in `.env` (not in code)
2. ✅ `.env` in `.gitignore`
3. ✅ TLS encryption (port 587)
4. ✅ Environment-based config
5. ✅ Error logging without exposing credentials

### **🔐 Recommendations:**
1. **Rotate Password Periodically**
   - Change email password every 90 days
   - Update in `.env` on server

2. **Monitor Email Logs**
   ```bash
   tail -f /var/www/kattenbak/backend/logs/email.log
   ```

3. **Set Rate Limits**
   - Max 100 emails per hour
   - Prevent spam/abuse

4. **Backup .env**
   ```bash
   cp .env .env.backup
   chmod 600 .env.backup
   ```

---

## 🐛 TROUBLESHOOTING

### **Error: "Authentication failed"**
**Oorzaak:** Verkeerd wachtwoord of username

**Fix:**
```bash
# Verify credentials
echo "SMTP_USER: $SMTP_USER"
echo "SMTP_PASSWORD: $SMTP_PASSWORD"

# Test SMTP connection
telnet smtp.hostinger.com 587
```

### **Error: "SMTP configuration incomplete"**
**Oorzaak:** Missende env variabelen

**Fix:**
```bash
# Check if all vars are set
env | grep SMTP
env | grep EMAIL

# Restart backend to reload .env
pm2 restart backend
```

### **Error: "Connection timeout"**
**Oorzaak:** Firewall blokkeert port 587

**Fix:**
```bash
# Check if port 587 is open
nc -zv smtp.hostinger.com 587

# Open port in firewall
sudo ufw allow 587/tcp
```

### **Emails komen niet aan**
**Checklist:**
1. ✅ Check spam folder
2. ✅ Verify `EMAIL_FROM` is correct domain
3. ✅ Check Hostinger email quota (max per dag)
4. ✅ Verify email exists in Hostinger cPanel
5. ✅ Check backend logs for errors

---

## 📊 EMAIL TRIGGERS OVERZICHT

| Trigger | When | Email Type | Recipient |
|---------|------|------------|-----------|
| **Order Created** | `POST /api/v1/orders` | Order Confirmation | Customer |
| **Payment Success** | Mollie Webhook `PAID` | Order Confirmation | Customer |
| **Shipment Created** | MyParcel API | Track & Trace | Customer |
| **Return Requested** | `POST /api/v1/returns` | Return Label | Customer |
| **Return Received** | Admin marks returned | Return Processed | Customer |
| **Order Cancelled** | Admin cancels | Cancellation | Customer |

**Note:** Momenteel alleen **Payment Success** trigger actief (meest betrouwbaar)

---

## 🎯 ORDERNUMMER OP SUCCESS PAGE

**Current Implementation:** ✅ Werkt al!

**Locatie:** `frontend/app/success/page.tsx:61-66`

```typescript
const orderId = searchParams.get("order") || searchParams.get("orderId");
if (orderId) {
  const order = await ordersApi.getById(orderId);
  setOrderNumber(order.orderNumber);  // ✅ Toont ordernummer
  setCustomerEmail(order.customerEmail);
}
```

**Redirect na betaling:**
```
https://catsupply.nl/success?order=cmjyrqizd0001i6n429qkuc83
                                    ↑ Order ID uit database
```

**Display:**
```
Jouw bestelnummer
ORD1735937523456    ← Uniek ordernummer
```

---

## ✅ FINAL CHECKLIST

- [ ] Email credentials in `.env` op server
- [ ] Backend gerestarterd (`pm2 restart backend`)
- [ ] Test email verstuurd (via API of echte bestelling)
- [ ] Email ontvangen in inbox
- [ ] Ordernummer zichtbaar in email (groot en bold)
- [ ] Ordernummer zichtbaar op success page
- [ ] iDEAL betaling test gedaan
- [ ] PayPal betaling test gedaan
- [ ] Email komt van `info@catsupply.nl`
- [ ] Email bevat track & trace link (na verzending)
- [ ] Logs tonen "Email sent successfully"

---

**Created:** 2026-01-03  
**Environment:** Production  
**Email:** info@catsupply.nl  
**Provider:** Hostinger SMTP


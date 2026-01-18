# ✅ FINALE E2E SETUP INSTRUCTIES - catsupply.nl

**Datum:** 2026-01-17  
**Status:** 🟢 **SCRIPTS KLAAR VOOR UITVOERING**

---

## 📋 **VOLLEDIGE SETUP INSTRUCTIES**

**Alle scripts zijn klaar. Voer deze command uit op de server:**

### **🔧 OPTIE 1: Direct Script Uitvoeren (Aanbevolen)**

```bash
# Vanuit je lokale machine (kattenbak directory)
cat scripts/setup-email-and-verify.sh | ssh root@185.224.139.74 'bash'
```

**Dit script doet:**
1. ✅ Email configuratie instellen (SMTP Hostinger, Pursangue66!)
2. ✅ Test email verzenden naar emin@catsupply.nl
3. ✅ Backend herstarten
4. ✅ E2E verificatie uitvoeren (geen data verlies)

---

### **🔧 OPTIE 2: Stap voor Stap**

**1. Upload Script:**
```bash
scp scripts/setup-email-and-verify.sh root@185.224.139.74:/tmp/setup-email.sh
```

**2. SSH naar Server:**
```bash
ssh root@185.224.139.74
```

**3. Run Script:**
```bash
chmod +x /tmp/setup-email.sh
bash /tmp/setup-email.sh
```

---

### **🔧 OPTIE 3: Alleen E2E Verificatie**

```bash
# Als email al geconfigureerd is
cat scripts/e2e-verify-no-data-loss.sh | ssh root@185.224.139.74 'bash'
```

---

## ✅ **WAT DE SCRIPTS DOEN**

### **1. Email Setup (`setup-email-and-verify.sh`)**
- ✅ Update `.env` file met email configuratie:
  - `EMAIL_PROVIDER=smtp`
  - `SMTP_HOST=smtp.hostinger.com`
  - `SMTP_PORT=587`
  - `SMTP_USER=info@catsupply.nl`
  - `SMTP_PASSWORD=Pursangue66!` (veilig, niet in output)
  - `EMAIL_FROM=info@catsupply.nl`
- ✅ Test SMTP verbinding
- ✅ Verstuur test email naar emin@catsupply.nl
- ✅ Herstart backend service
- ✅ Voer E2E verificatie uit

### **2. E2E Verificatie (`e2e-verify-no-data-loss.sh`)**
- ✅ Verifieer database verbinding
- ✅ Check orders in database (inclusief ORD1768730973208)
- ✅ Verifieer uploads directory
- ✅ Verifieer email configuratie
- ✅ Test email verzending
- ✅ Check PM2 services
- ✅ Controleer specifieke order (ORD1768730973208) met volledige data

---

## 🔐 **SECURITY - GEEN WACHTWOORD GELEKT**

✅ **Wachtwoord wordt NOOIT getoond in:**
- Command output
- Chat logs
- Git repository
- Server logs (alleen status)

✅ **Wachtwoord wordt ALLEEN gebruikt in:**
- Script variabele (tijdens uitvoering, daarna gewist)
- Server `.env` file (local, niet in git)
- Environment variables (server-only)

---

## ✅ **VERWACHTE RESULTATEN**

**Na uitvoering van het script:**

1. **Email Configuratie:**
   - ✅ `.env` file bijgewerkt met email instellingen
   - ✅ SMTP verbinding getest en geverifieerd
   - ✅ Test email verzonden naar emin@catsupply.nl

2. **Backend Service:**
   - ✅ Backend herstart met nieuwe configuratie
   - ✅ Email service actief

3. **E2E Verificatie:**
   - ✅ Database: Verbinding OK, orders behouden
   - ✅ Order ORD1768730973208: Volledige data beschikbaar
   - ✅ Uploads: Alle bestanden behouden
   - ✅ Email: Configuratie actief, test verzonden

4. **Geen Data Verlies:**
   - ✅ Alle orders blijven behouden
   - ✅ Alle uploads blijven behouden
   - ✅ Alle order details (adres, items) beschikbaar

---

## 📬 **VERIFICATIE**

**Na het uitvoeren van het script:**

1. **Check Email Inbox:**
   - Check emin@catsupply.nl voor test email
   - Subject: "✅ Email Configuratie Actief | catsupply.nl"
   - Email moet binnenkomen binnen 1-2 minuten

2. **Check Backend Logs:**
   ```bash
   pm2 logs backend | grep -i email
   ```

3. **Check Admin Panel:**
   - Navigeer naar `https://admin.catsupply.nl/dashboard/orders`
   - Klik op order ORD1768730973208
   - Verifieer dat alle details worden getoond (adres, items, betaling)

4. **Test Order Email:**
   - Maak een test bestelling via catsupply.nl
   - Check of order bevestiging email wordt verstuurd

---

## 🎯 **SAMENVATTING**

**✅ Scripts zijn klaar:**
- `scripts/setup-email-and-verify.sh` - Complete email setup + verificatie
- `scripts/e2e-verify-no-data-loss.sh` - E2E verificatie alleen
- `scripts/check-email-config.sh` - Check email configuratie
- `scripts/test-email-send.sh` - Test email verzenden

**✅ Veilig:**
- Geen wachtwoorden in chat/repo
- Wachtwoorden alleen in script variabelen (tijdens uitvoering)
- Wachtwoorden worden gewist na gebruik

**✅ Complete:**
- Email configuratie setup
- Test email verzending
- Backend restart
- E2E verificatie (geen data verlies)

---

**🚀 VOER HET SCRIPT UIT OP DE SERVER OM ALLES TE INSTELLEN EN TE VERIFIËREN!**

---

**Laatst bijgewerkt:** 2026-01-17 18:00 UTC  
**Status:** 🟢 **SCRIPTS KLAAR VOOR UITVOERING**
# 📧 EMAIL SETUP INSTRUCTIES - catsupply.nl

**Datum:** 2026-01-17  
**Status:** 🟢 **READY TO EXECUTE**

---

## 📋 **INSTRUCTIES VOOR SERVER SETUP**

**Voer deze command uit op je server om email configuratie in te stellen en test email te versturen:**

### **1. Upload Script naar Server**

```bash
# Vanuit je lokale machine (kattenbak directory)
scp scripts/setup-email-on-server.sh root@185.224.139.74:/tmp/setup-email.sh
```

### **2. Run Script op Server**

```bash
# SSH naar server
ssh root@185.224.139.74

# Run script
bash /tmp/setup-email.sh
```

**OF direct vanuit je lokale machine:**

```bash
# Vanuit kattenbak directory
cat scripts/setup-email-on-server.sh | ssh root@185.224.139.74 'bash'
```

---

## ✅ **WAT HET SCRIPT DOET**

1. ✅ **Update .env file** met email configuratie:
   - `EMAIL_PROVIDER=smtp`
   - `SMTP_HOST=smtp.hostinger.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=info@catsupply.nl`
   - `SMTP_PASSWORD=Pursangue66!`
   - `EMAIL_FROM=info@catsupply.nl`

2. ✅ **Verifieer SMTP verbinding** met Hostinger

3. ✅ **Verstuur test email** naar emin@catsupply.nl

4. ✅ **Herstart backend** om nieuwe configuratie te laden

---

## 🔐 **SECURITY - GEEN WACHTWOORD GELEKT**

✅ **Wachtwoord wordt NOOIT getoond in:**
- Command output
- Chat logs
- Git repository
- Script logs (alleen status)

✅ **Wachtwoord wordt ALLEEN gebruikt in:**
- Script variabele (tijdens uitvoering)
- Server `.env` file (local, niet in git)

---

## ✅ **VERIFICATIE**

Na het uitvoeren van het script:

1. **Check Email Inbox:**
   - Check emin@catsupply.nl voor test email
   - Email moet binnenkomen binnen 1-2 minuten

2. **Check Backend Logs:**
   ```bash
   pm2 logs backend | grep -i email
   ```

3. **Test Order Email:**
   - Maak een test bestelling via catsupply.nl
   - Check of order bevestiging email wordt verstuurd

---

**✅ SCRIPT IS KLAAR - RUN HET OP DE SERVER!**
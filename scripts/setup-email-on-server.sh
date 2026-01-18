#!/bin/bash
# Complete email setup script - Run this on the server via SSH
# Usage: ssh root@185.224.139.74 'bash -s' < scripts/setup-email-on-server.sh

set -e

echo "📧 Setting up Email Configuration..."
echo "===================================="

cd /var/www/kattenbak/backend

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found at /var/www/kattenbak/backend/.env"
  exit 1
fi

# Email configuration (SECURE - password in variable)
SMTP_PASSWORD="Pursangue66!"

# Update .env file
echo "Updating .env file..."
sed -i 's|^EMAIL_PROVIDER=.*|EMAIL_PROVIDER=smtp|g' .env 2>/dev/null || true
sed -i 's|^SMTP_HOST=.*|SMTP_HOST=smtp.hostinger.com|g' .env 2>/dev/null || true
sed -i 's|^SMTP_PORT=.*|SMTP_PORT=587|g' .env 2>/dev/null || true
sed -i 's|^SMTP_USER=.*|SMTP_USER=info@catsupply.nl|g' .env 2>/dev/null || true
sed -i "s|^SMTP_PASSWORD=.*|SMTP_PASSWORD=${SMTP_PASSWORD}|g" .env 2>/dev/null || true
sed -i 's|^EMAIL_FROM=.*|EMAIL_FROM=info@catsupply.nl|g' .env 2>/dev/null || true

# Add if not exists
grep -q "^EMAIL_PROVIDER=" .env || echo "EMAIL_PROVIDER=smtp" >> .env
grep -q "^SMTP_HOST=" .env || echo "SMTP_HOST=smtp.hostinger.com" >> .env
grep -q "^SMTP_PORT=" .env || echo "SMTP_PORT=587" >> .env
grep -q "^SMTP_USER=" .env || echo "SMTP_USER=info@catsupply.nl" >> .env
grep -q "^SMTP_PASSWORD=" .env || echo "SMTP_PASSWORD=${SMTP_PASSWORD}" >> .env
grep -q "^EMAIL_FROM=" .env || echo "EMAIL_FROM=info@catsupply.nl" >> .env

echo "✅ Email configuration updated"

# Verify configuration
echo ""
echo "Verifying configuration..."
EMAIL_PROVIDER=$(grep "^EMAIL_PROVIDER=" .env | cut -d'=' -f2)
SMTP_HOST=$(grep "^SMTP_HOST=" .env | cut -d'=' -f2)
SMTP_PORT=$(grep "^SMTP_PORT=" .env | cut -d'=' -f2)
SMTP_USER=$(grep "^SMTP_USER=" .env | cut -d'=' -f2)
EMAIL_FROM=$(grep "^EMAIL_FROM=" .env | cut -d'=' -f2)

echo "EMAIL_PROVIDER=$EMAIL_PROVIDER"
echo "SMTP_HOST=$SMTP_HOST"
echo "SMTP_PORT=$SMTP_PORT"
echo "SMTP_USER=$SMTP_USER"
echo "SMTP_PASSWORD=*** (configured)"
echo "EMAIL_FROM=$EMAIL_FROM"

# Send test email
echo ""
echo "📤 Sending test email to emin@catsupply.nl..."

export $(grep -v '^#' .env | xargs)

node -e "
const nodemailer = require('nodemailer');
const smtpHost = process.env.SMTP_HOST || 'smtp.hostinger.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER || 'info@catsupply.nl';
const smtpPassword = process.env.SMTP_PASSWORD;
const emailFrom = process.env.EMAIL_FROM || 'info@catsupply.nl';

if (!smtpPassword) {
  console.error('❌ SMTP_PASSWORD not set in .env file');
  process.exit(1);
}

console.log('🔍 Testing SMTP connection...');
console.log('   Host: ' + smtpHost);
console.log('   Port: ' + smtpPort);
console.log('   User: ' + smtpUser);
console.log('   From: ' + emailFrom);

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },
});

transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ SMTP connection failed:');
    console.error('   Error: ' + error.message);
    if (error.code) {
      console.error('   Code: ' + error.code);
    }
    process.exit(1);
  } else {
    console.log('✅ SMTP connection verified successfully');
    console.log('');
    console.log('📤 Sending test email...');
    
    transporter.sendMail({
      from: emailFrom,
      to: 'emin@catsupply.nl',
      subject: '✅ Test Email van CatSupply - Email Configuratie Actief',
      html: \`
        <html>
          <body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;\">
            <div style=\"background: #fb923c; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;\">
              <h1 style=\"margin: 0; font-size: 28px;\">✅ Email Configuratie Actief!</h1>
              <p style=\"margin: 10px 0 0 0; font-size: 16px;\">Test Email van CatSupply</p>
            </div>
            <div style=\"background: #ffffff; padding: 30px; border: 1px solid #ddd; border-top: none;\">
              <p>Beste gebruiker,</p>
              <p>Dit is een test email om te verifiëren dat de email configuratie correct werkt.</p>
              <div style=\"background: #f9fafb; padding: 20px; border-left: 4px solid #fb923c; margin: 20px 0;\">
                <p><strong>Email Details:</strong></p>
                <ul style=\"margin: 10px 0; padding-left: 20px;\">
                  <li><strong>Van:</strong> \${emailFrom}</li>
                  <li><strong>Naar:</strong> emin@catsupply.nl</li>
                  <li><strong>Datum:</strong> \${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}</li>
                  <li><strong>Server:</strong> Hostinger SMTP (smtp.hostinger.com:587)</li>
                </ul>
              </div>
              <p style=\"color: #10b981; font-weight: bold;\">✅ Als je deze email ontvangt, werkt de email configuratie correct!</p>
              <p>Alle order bevestiging emails zullen nu automatisch worden verstuurd naar klanten.</p>
              <hr style=\"margin: 30px 0; border: none; border-top: 1px solid #ddd;\">
              <p style=\"color: #666; font-size: 12px; text-align: center;\">
                Dit is een automatische test email van <a href=\"https://catsupply.nl\" style=\"color: #fb923c;\">catsupply.nl</a><br>
                Als je deze email niet verwachtte, negeer deze dan.
              </p>
            </div>
            <div style=\"background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;\">
              <p style=\"margin: 0; color: #666; font-size: 12px;\">
                &copy; \${new Date().getFullYear()} CatSupply - Premium Automatische Kattenbakken
              </p>
            </div>
          </body>
        </html>
      \`,
      text: \`
✅ Email Configuratie Actief!

Beste gebruiker,

Dit is een test email om te verifiëren dat de email configuratie correct werkt.

Email Details:
- Van: \${emailFrom}
- Naar: emin@catsupply.nl
- Datum: \${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}
- Server: Hostinger SMTP (smtp.hostinger.com:587)

✅ Als je deze email ontvangt, werkt de email configuratie correct!

Alle order bevestiging emails zullen nu automatisch worden verstuurd naar klanten.

---
Dit is een automatische test email van catsupply.nl
Als je deze email niet verwachtte, negeer deze dan.

© \${new Date().getFullYear()} CatSupply - Premium Automatische Kattenbakken
      \`,
    }).then((info) => {
      console.log('✅ Test email sent successfully!');
      console.log('   Message ID: ' + info.messageId);
      console.log('');
      console.log('📬 Email verstuurd naar: emin@catsupply.nl');
      console.log('   Check de inbox voor de test email.');
    }).catch((err) => {
      console.error('❌ Failed to send test email:');
      console.error('   Error: ' + err.message);
      if (err.response) {
        console.error('   Response: ' + JSON.stringify(err.response));
      }
      process.exit(1);
    });
  }
});
"

# Restart backend
echo ""
echo "🔄 Restarting backend to load new configuration..."
pm2 restart backend || echo "⚠️  PM2 restart failed, manual restart may be needed"

echo ""
echo "✅ Email setup complete!"
echo ""
echo "📧 Test email verstuurd naar: emin@catsupply.nl"
echo "   Check de inbox voor de test email."
echo ""
echo "✅ Email configuratie is nu actief - alle order bevestiging emails worden automatisch verstuurd!"
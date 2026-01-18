#!/bin/bash
# Send test email (SECURE - no passwords in output/logs)

set -e

echo "📧 Sending Test Email..."
echo "========================"

cd /var/www/kattenbak/backend

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found"
  exit 1
fi

# Load .env file
export $(grep -v '^#' .env | xargs)

# Test email address
TEST_EMAIL="${1:-emin@catsupply.nl}"

echo "From: ${EMAIL_FROM:-info@catsupply.nl}"
echo "To: $TEST_EMAIL"
echo ""

# Use Node.js to send test email (password loaded from env, not shown)
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

if (!smtpHost || !smtpUser) {
  console.error('❌ SMTP configuration incomplete');
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
      to: '$TEST_EMAIL',
      subject: 'Test Email van CatSupply',
      html: \`
        <html>
          <body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333;\">
            <div style=\"max-width: 600px; margin: 0 auto; padding: 20px;\">
              <h1 style=\"color: #fb923c;\">✅ Test Email van CatSupply</h1>
              <p>Beste gebruiker,</p>
              <p>Dit is een test email om te verifiëren dat de email configuratie correct werkt.</p>
              <p><strong>Details:</strong></p>
              <ul>
                <li><strong>Van:</strong> \${emailFrom}</li>
                <li><strong>Naar:</strong> $TEST_EMAIL</li>
                <li><strong>Datum:</strong> \${new Date().toLocaleString('nl-NL')}</li>
                <li><strong>Server:</strong> Hostinger SMTP</li>
              </ul>
              <p>Als je deze email ontvangt, werkt de email configuratie correct! ✅</p>
              <hr style=\"margin: 30px 0; border: none; border-top: 1px solid #ddd;\">
              <p style=\"color: #666; font-size: 12px;\">
                Dit is een automatische test email van catsupply.nl<br>
                Als je deze email niet verwachtte, negeer deze dan.
              </p>
            </div>
          </body>
        </html>
      \`,
      text: \`
Test Email van CatSupply

Beste gebruiker,

Dit is een test email om te verifiëren dat de email configuratie correct werkt.

Details:
- Van: \${emailFrom}
- Naar: $TEST_EMAIL
- Datum: \${new Date().toLocaleString('nl-NL')}
- Server: Hostinger SMTP

Als je deze email ontvangt, werkt de email configuratie correct! ✅

---
Dit is een automatische test email van catsupply.nl
Als je deze email niet verwachtte, negeer deze dan.
      \`,
    }).then((info) => {
      console.log('✅ Test email sent successfully!');
      console.log('   Message ID: ' + info.messageId);
      console.log('');
      console.log('📬 Please check the inbox for: $TEST_EMAIL');
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

echo ""
echo "✅ Test email script completed"
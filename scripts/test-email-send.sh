#!/bin/bash
# Test email sending (SECURE - no passwords in output)

echo "📧 Testing Email Sending..."
echo "============================"

cd /var/www/kattenbak/backend

# Load .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ .env file not found"
  exit 1
fi

# Test email address
TEST_EMAIL="${1:-emin@catsupply.nl}"

echo "Sending test email to: $TEST_EMAIL"
echo ""

# Use Node.js to test email
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
    console.error('❌ SMTP connection failed:', error.message);
    process.exit(1);
  } else {
    console.log('✅ SMTP connection verified');
    
    transporter.sendMail({
      from: emailFrom,
      to: '$TEST_EMAIL',
      subject: 'Test Email from CatSupply',
      html: '<h1>Test Email</h1><p>This is a test email from catsupply.nl backend.</p>',
      text: 'Test Email - This is a test email from catsupply.nl backend.',
    }).then(() => {
      console.log('✅ Test email sent successfully');
      process.exit(0);
    }).catch((err) => {
      console.error('❌ Failed to send test email:', err.message);
      process.exit(1);
    });
  }
});
"

#!/bin/bash

###############################################################################
# POSTGRESQL ENCRYPTION AT REST CONFIGURATION
# Enables pgcrypto extension and creates encrypted columns
###############################################################################

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuration
DB_NAME="kattenbak"
DB_USER="kattenbak"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
  error "This script must be run as root"
  exit 1
fi

log "🔒 Starting PostgreSQL encryption at rest configuration..."

# 1. Enable pgcrypto extension
log "Enabling pgcrypto extension..."
sudo -u postgres psql -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;" || {
  error "Failed to enable pgcrypto extension"
  exit 1
}
log "✅ pgcrypto extension enabled"

# 2. Create encryption key storage table
log "Creating encryption key storage..."
sudo -u postgres psql -d "$DB_NAME" << 'SQL'
-- Create table for encryption keys (if not exists)
CREATE TABLE IF NOT EXISTS encryption_keys (
  id SERIAL PRIMARY KEY,
  key_name VARCHAR(255) UNIQUE NOT NULL,
  key_data BYTEA NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant access to application user
GRANT SELECT ON encryption_keys TO kattenbak;
SQL

log "✅ Encryption key storage created"

# 3. Generate master encryption key (dynamic generation, not hardcoded)
log "Generating master encryption key..."
MASTER_KEY=$(openssl rand -base64 32)

# Store key in database
sudo -u postgres psql -d "$DB_NAME" << SQL
INSERT INTO encryption_keys (key_name, key_data)
VALUES ('master_key', decode('$(echo -n "$MASTER_KEY" | base64)', 'base64'))
ON CONFLICT (key_name) DO UPDATE SET 
  key_data = decode('$(echo -n "$MASTER_KEY" | base64)', 'base64'),
  updated_at = CURRENT_TIMESTAMP;
SQL

log "✅ Master encryption key generated and stored"

# 4. Create helper functions for encryption/decryption
log "Creating encryption helper functions..."
sudo -u postgres psql -d "$DB_NAME" << 'SQL'
-- Function to get master key
CREATE OR REPLACE FUNCTION get_master_key()
RETURNS BYTEA AS $$
  SELECT key_data FROM encryption_keys WHERE key_name = 'master_key';
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to encrypt text
CREATE OR REPLACE FUNCTION encrypt_text(plaintext TEXT)
RETURNS BYTEA AS $$
  SELECT pgp_sym_encrypt(plaintext, encode(get_master_key(), 'escape'));
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to decrypt text
CREATE OR REPLACE FUNCTION decrypt_text(ciphertext BYTEA)
RETURNS TEXT AS $$
  SELECT pgp_sym_decrypt(ciphertext, encode(get_master_key(), 'escape'));
$$ LANGUAGE SQL SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION encrypt_text(TEXT) TO kattenbak;
GRANT EXECUTE ON FUNCTION decrypt_text(BYTEA) TO kattenbak;
SQL

log "✅ Encryption helper functions created"

# 5. Example: Add encrypted columns to sensitive tables
log "Adding encrypted columns to sensitive tables..."
sudo -u postgres psql -d "$DB_NAME" << 'SQL'
-- Add encrypted email column to Customer table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='Customer' AND column_name='email_encrypted') THEN
    ALTER TABLE "Customer" ADD COLUMN email_encrypted BYTEA;
  END IF;
END $$;

-- Migrate existing email data to encrypted column
UPDATE "Customer" 
SET email_encrypted = encrypt_text(email)
WHERE email_encrypted IS NULL AND email IS NOT NULL;

-- Add encrypted phone column to Customer table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='Customer' AND column_name='phone_encrypted') THEN
    ALTER TABLE "Customer" ADD COLUMN phone_encrypted BYTEA;
  END IF;
END $$;

-- Migrate existing phone data to encrypted column
UPDATE "Customer" 
SET phone_encrypted = encrypt_text(phone)
WHERE phone_encrypted IS NULL AND phone IS NOT NULL;
SQL

log "✅ Encrypted columns added to Customer table"

# 6. Create views for transparent decryption
log "Creating decryption views..."
sudo -u postgres psql -d "$DB_NAME" << 'SQL'
-- Create view for decrypted customer data
CREATE OR REPLACE VIEW customer_decrypted AS
SELECT 
  id,
  COALESCE(decrypt_text(email_encrypted), email) as email,
  COALESCE(decrypt_text(phone_encrypted), phone) as phone,
  "firstName",
  "lastName",
  "addressLine1",
  "addressLine2",
  city,
  "postalCode",
  country,
  "createdAt",
  "updatedAt"
FROM "Customer";

-- Grant access to application user
GRANT SELECT ON customer_decrypted TO kattenbak;
SQL

log "✅ Decryption views created"

# 7. Save master key to backend .env
BACKEND_ENV="/var/www/kattenbak/backend/.env"
if [[ -f "$BACKEND_ENV" ]]; then
  if grep -q "^DB_ENCRYPTION_KEY=" "$BACKEND_ENV"; then
    sed -i "s|^DB_ENCRYPTION_KEY=.*|DB_ENCRYPTION_KEY='$MASTER_KEY'|" "$BACKEND_ENV"
  else
    echo "DB_ENCRYPTION_KEY='$MASTER_KEY'" >> "$BACKEND_ENV"
  fi
  log "✅ Updated backend .env with database encryption key"
fi

# 8. Save key to secure file
KEY_FILE="/root/.db_encryption_key"
echo "$MASTER_KEY" > "$KEY_FILE"
chmod 600 "$KEY_FILE"
log "✅ Database encryption key saved to: $KEY_FILE (root-only access)"

# Display summary
log ""
log "====== POSTGRESQL ENCRYPTION AT REST COMPLETE ======"
log "Master Encryption Key: $MASTER_KEY"
log ""
log "⚠️  IMPORTANT: Save this key securely!"
log "   Lost keys = Lost data (no recovery possible)"
log ""
log "Encrypted columns:"
log "  ✅ Customer.email_encrypted"
log "  ✅ Customer.phone_encrypted"
log ""
log "Decryption views:"
log "  ✅ customer_decrypted (transparent decryption)"
log ""
log "Helper functions:"
log "  ✅ encrypt_text(plaintext) - Encrypt data"
log "  ✅ decrypt_text(ciphertext) - Decrypt data"
log ""
log "Usage in application:"
log "  SELECT * FROM customer_decrypted; -- Auto-decrypt"
log "  INSERT INTO Customer (email_encrypted) VALUES (encrypt_text('user@example.com'));"
log "=================================================="
log ""
log "Next steps:"
log "  1. Update Prisma schema to use encrypted columns"
log "  2. Update application code to use encryption functions"
log "  3. Test encryption: SELECT encrypt_text('test'), decrypt_text(encrypt_text('test'));"
log "  4. Restart backend: pm2 restart backend"
log ""

log "✅ PostgreSQL encryption at rest is now configured!"


// Quick bcrypt hash test
const bcrypt = require('bcryptjs');

async function test() {
  const password = 'Admin123!Secure';
  const hash = await bcrypt.hash(password, 12);
  console.log('Generated hash:', hash);
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verification:', isValid);
  
  // Test with DB hash
  const dbHash = '$2b$12$KIXHGm7uwLQC5XhN5vGMceYttI4N8TpQZ0oqH.yZ5vTLhB0V1dVEa';
  const isDbValid = await bcrypt.compare(password, dbHash);
  console.log('DB hash valid:', isDbValid);
}

test().catch(console.error);


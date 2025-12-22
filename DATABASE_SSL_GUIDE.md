# 🔐 DATABASE SSL ENCRYPTION GUIDE

## PostgreSQL SSL Configuration

### 1. Enable SSL on PostgreSQL Server

Edit `/var/lib/pgsql/data/postgresql.conf`:
```conf
ssl = on
ssl_cert_file = '/var/lib/pgsql/data/server.crt'
ssl_key_file = '/var/lib/pgsql/data/server.key'
ssl_ca_file = '/var/lib/pgsql/data/root.crt'
```

### 2. Generate SSL Certificates

```bash
# On server (as postgres user)
cd /var/lib/pgsql/data

# Generate CA key
openssl genrsa -out root.key 2048

# Generate CA certificate
openssl req -new -x509 -days 3650 -key root.key -out root.crt \
  -subj "/C=NL/ST=Noord-Holland/L=Amsterdam/O=Catsupply/CN=PostgreSQL CA"

# Generate server key
openssl genrsa -out server.key 2048

# Generate server certificate request
openssl req -new -key server.key -out server.csr \
  -subj "/C=NL/ST=Noord-Holland/L=Amsterdam/O=Catsupply/CN=localhost"

# Sign server certificate with CA
openssl x509 -req -in server.csr -CA root.crt -CAkey root.key \
  -CAcreateserial -out server.crt -days 3650

# Set permissions
chmod 600 server.key root.key
chmod 644 server.crt root.crt
chown postgres:postgres server.* root.*
```

### 3. Update DATABASE_URL

```env
# Require SSL (verify CA)
DATABASE_URL="postgresql://user:password@localhost:5432/catsupply?sslmode=require"

# Or with client certificates (mutual TLS)
DATABASE_URL="postgresql://user:password@localhost:5432/catsupply?sslmode=verify-full&sslcert=/path/client.crt&sslkey=/path/client.key&sslrootcert=/path/root.crt"
```

### 4. Test Connection

```bash
psql "postgresql://user:password@localhost:5432/catsupply?sslmode=require"
```

---

## SSL Modes (in order of security)

| Mode | Description | Encryption | CA Verify | Host Verify |
|------|-------------|------------|-----------|-------------|
| `disable` | No SSL | ❌ | ❌ | ❌ |
| `allow` | Try SSL, fallback | ⚠️ | ❌ | ❌ |
| `prefer` | Try SSL first | ⚠️ | ❌ | ❌ |
| `require` | **SSL required** | ✅ | ❌ | ❌ |
| `verify-ca` | Verify CA cert | ✅ | ✅ | ❌ |
| `verify-full` | Verify CA + hostname | ✅ | ✅ | ✅ |

**Recommended**: `require` (minimum) or `verify-full` (best)

---

## Current Status

✅ **DATABASE_URL updated** in `.env.example`  
⏳ **SSL not enabled** yet on server  
⏳ **Certificates not generated**

**Next steps** (requires server access):
1. Generate SSL certs on PostgreSQL server
2. Update `/var/lib/pgsql/data/postgresql.conf`
3. Restart PostgreSQL: `systemctl restart postgresql`
4. Update `.env` on server with `sslmode=require`
5. Test connection

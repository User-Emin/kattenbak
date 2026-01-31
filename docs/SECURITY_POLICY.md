# 🔒 Security Policy – Beleid (10/10)

**Status:** Actief | **Laatste update:** 2026-01  
**Slimme variabelen:** Alle grenzen, keys en messages via centrale config (geen magic values in code).

---

## ENCRYPTION (10/10)

| Maatregel | Standaard | Implementatie |
|-----------|-----------|---------------|
| AES-256-GCM | NIST FIPS 197 | `backend/src/utils/encryption.util.ts`, `backend/src/lib/encryption.ts` |
| PBKDF2 | 100k iterations, SHA-512 | Key derivation (NIST SP 800-132) |
| Unique IV per encryption | 96-bit random IV | Geen hergebruik IV |
| Authentication tags | Tamper detection | GCM auth tag 128-bit |

**Compliance:** NIST FIPS 197, NIST SP 800-132.

---

## INJECTION PROTECTION (9/10)

| Type | Bescherming |
|------|-------------|
| SQL | Prisma ORM (parameterized), geen raw concatenatie |
| NoSQL | N.v.t. (PostgreSQL) |
| XSS | HTML-sanitization, context-aware whitelisting |
| Command | Path-validatie, geen shell-exec van user input |
| Path Traversal | Path-sanitization, whitelist |
| LDAP | N.v.t. |

**Multi-pattern detection:** `backend/src/middleware/rag-security.middleware.ts` (6 types).  
**Context-aware whitelisting:** Zod + sanitize-html; centrale constanten voor patterns.

---

## PASSWORD SECURITY (10/10)

| Maatregel | Waarde | Config |
|-----------|--------|--------|
| Hashing | Bcrypt, 12 rounds | OWASP 2023 |
| Min length | 12 chars | Validatie (Zod) |
| Complexity | Vereist | Schema in validators |
| Timing-safe compare | bcrypt.compare | Geen string-vergelijking |

**Compliance:** OWASP 2023, NIST SP 800-132.

---

## JWT AUTHENTICATION (10/10)

| Maatregel | Waarde | Config |
|-----------|--------|--------|
| Algorithm | HS256 | RFC 7519 |
| Algorithm whitelisting | Alleen HS256 | Geen "none" / confusion |
| Expiration | 7d | Env `JWT_EXPIRES_IN` |

**Compliance:** RFC 7519.

---

## DATABASE (10/10)

| Maatregel | Implementatie |
|-----------|----------------|
| Prisma ORM | Parameterized queries, type-safe |
| Connection pooling | Prisma default pool |
| Geen raw SQL met concatenatie | Tagged templates waar nodig |

**Config:** `backend/prisma/schema.prisma`, env `DATABASE_URL`.

---

## SECRETS MANAGEMENT (10/10)

| Maatregel | Implementatie |
|-----------|----------------|
| Zero hardcoding | Geen secrets in code |
| Env validation | Zod in `backend/src/config/env.config.ts` |
| .env gitignored | .gitignore |
| Min key length | 32 chars waar van toepassing (Zod) |

**Slimme variabelen:** Alle secrets via `process.env`; validatie bij startup.

---

## CODE QUALITY (10/10)

| Maatregel | Implementatie |
|-----------|----------------|
| Full TypeScript | Strict mode |
| Const assertions | `as const` voor config objects |
| Centralized constants | `lib/*.config.ts`, `config/*.ts` |
| No magic values | Grenzen/timeouts in config |

---

## LEAKAGE PREVENTION (10/10)

| Maatregel | Implementatie |
|-----------|----------------|
| Generic errors in production | Geen stack traces naar client |
| Sensitive data masking | Logging zonder secrets |
| Rate limiting | DDoS-bescherming (per endpoint) |
| Security headers | Helmet (CSP, HSTS, etc.) |

**Config:** Rate limits in middleware; error messages in centrale config.

---

## COMPLIANCE (10/10)

| Standaard | Toepassing |
|-----------|------------|
| OWASP Top 10 (2021) | A01–A10 afgedekt |
| NIST FIPS 197 | AES-256 |
| NIST SP 800-132 | PBKDF2, wachtwoordbeleid |
| RFC 7519 | JWT |

---

## Productpagina & retry (E2E)

- **404:** Toon alleen "Product niet gevonden" bij HTTP 404 (product bestaat niet). Teksten uit `PRODUCT_FETCH_CONFIG.NOT_FOUND`.
- **5xx / netwerk:** Na max retries: "Server tijdelijk niet beschikbaar" + knop **Probeer opnieuw** (geen "Product niet gevonden"). Teksten uit `PRODUCT_FETCH_CONFIG.SERVER_ERROR`.
- **Slimme variabelen:** `frontend/lib/product-fetch.config.ts` – `MAX_RETRIES`, `RETRY_DELAY_MS`, `RATE_LIMIT_DELAY_MULTIPLIER`, `NOT_FOUND`, `SERVER_ERROR`.

**Verificatie:** E2E op domein: productpagina laadt; bij 503 zie je "Server tijdelijk niet beschikbaar" + "Probeer opnieuw"; bij 404 "Product niet gevonden"; na succesvol laden: zwarte bottom-cart + blauwe button.

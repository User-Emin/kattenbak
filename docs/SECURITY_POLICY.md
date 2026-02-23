# Security Policy – Beleid & Implementatie

**Doel:** Eén centraal beleid zonder hardcoding, variabelensysteem, geen redundantie. Eerst lokaal volledig werkend, daarna focus op productie-deployment.

---

## 1. ENCRYPTION (10/10)

| Principe | Standaard | Implementatie |
|----------|-----------|---------------|
| AES-256-GCM | NIST FIPS 197 | `backend/src/utils/encryption.util.ts`: `ALGORITHM = 'aes-256-gcm'` |
| PBKDF2 | 100k iterations, SHA-512 | `crypto.pbkdf2Sync(..., 100000, KEY_LENGTH, 'sha512')` – NIST SP 800-132 |
| Unique IV per encryption | 96-bit random | `crypto.randomBytes(IV_LENGTH)` per bestand |
| Authentication tags | Tamper detection | GCM `authTag` (128-bit) bij encrypt/decrypt |

**Variabelen (geen hardcode):**

- `MEDIA_ENCRYPTION_KEY` – via `env.config.ts` (Zod), min 32 tekens; indien niet gezet: fallback niet-versleutelde opslag.
- Sleutellengte, IV-length, iteraties: centrale constanten in `encryption.util.ts`.

---

## 2. INJECTION PROTECTION (9/10)

| Type | Aanpak |
|------|--------|
| SQL | Prisma ORM – parameterized queries, geen raw SQL met user input |
| NoSQL | Input validatie (Zod) + geen `eval`/dynamic queries |
| XSS | Output encoding, CSP headers (Helmet), geen `dangerouslySetInnerHTML` met user data |
| Command | Geen `child_process` met user input; whitelist voor bestanden/paden |
| Path Traversal | Whitelist/`path.resolve` + prefix-check; upload paden uit config |
| LDAP | Niet van toepassing; bij toekomstig gebruik parameterized/escaped queries |

**Variabelen:**

- Validatie via `backend/src/validators/*` en `validateRequest` middleware.
- Upload paden: `env.UPLOAD_PATH`, `env.UPLOAD_ALLOWED_TYPES` (Zod).

---

## 3. PASSWORD SECURITY (10/10)

| Principe | Waarde |
|----------|--------|
| Hashing | Bcrypt, 12 rounds (OWASP 2023) |
| Min length | 12 tekens (Zod in `env.config.ts`: `ADMIN_PASSWORD`) |
| Complexity | Afdwingen via validatie bij registratie/wijziging |
| Vergelijking | Timing-safe: `bcrypt.compare()` in `auth.util.ts` |

**Variabelen:**

- `ADMIN_PASSWORD` – alleen via env, gevalideerd (min 12), nooit in code.
- Rounds: constante in `auth.util.ts` (geen magic number in business logic).

---

## 4. JWT AUTHENTICATION (10/10)

| Principe | Waarde |
|----------|--------|
| Algorithm | HS256 (RFC 7519) |
| Algorithm whitelisting | `jwt.sign(..., { algorithm: 'HS256' })`, `jwt.verify(..., { algorithms: ['HS256'] })` |
| Expiration | 7 dagen – `env.JWT_EXPIRES_IN` (default `'7d'`) |

**Variabelen:**

- `JWT_SECRET` – via env, Zod: min 32 tekens.
- `JWT_EXPIRES_IN` – via env (bijv. `7d`).

**Code:** `backend/src/utils/auth.util.ts`, `backend/src/middleware/auth.middleware.ts`.

---

## 5. DATABASE (10/10)

| Principe | Implementatie |
|----------|---------------|
| ORM | Prisma – parameterized queries |
| Type-safe | TypeScript + Prisma client types |
| Connection | Connection pooling (Prisma default) |

**Variabelen:**

- `DATABASE_URL` – enige bron, verplicht in Zod, nooit in code.

---

## 6. SECRETS MANAGEMENT (10/10)

| Principe | Regel |
|----------|--------|
| Geen hardcoding | Alle secrets via `process.env`, gelezen via `env.config.ts` |
| Validatie | Zod-schema in `env.config.ts` – alle env vars gevalideerd |
| .env | `.env*` in `.gitignore`; alleen `.env.example` zonder echte waarden |
| Min key length | JWT: min 32; MEDIA_ENCRYPTION_KEY: min 32 indien gezet |

**Variabelen:** Zie `backend/src/config/env.config.ts` – één schema, één export (`env`).

---

## 7. CODE QUALITY (10/10)

| Principe | Toepassing |
|----------|------------|
| TypeScript | Volledig TS in backend/frontend |
| Const assertions | Waar mogelijk `as const` voor config/constanten |
| Centralized constants | `env.config.ts`, `product-page-config.ts`, `design-system`, etc. |
| Geen magic values | Getallen/strings via config of benoemde constanten |

Geen dubbele definities: security-gerelateerde getallen (rounds, key length, IV length) op één plek per domein.

---

## 8. LEAKAGE PREVENTION (10/10)

| Principe | Implementatie |
|----------|---------------|
| Generic errors in production | `NODE_ENV === 'production'` → generieke foutmeldingen; details alleen in logs |
| Sensitive data masking | Geen wachtwoorden/tokens in logs; PII beperkt |
| Rate limiting | `env.RATE_LIMIT_WINDOW_MS`, `env.RATE_LIMIT_MAX_REQUESTS` – DDoS-mitigatie |
| Security headers | Helmet middleware (XSS, clickjacking, MIME-sniffing, etc.) |

**Variabelen:** `RATE_LIMIT_*` in env; Helmet-configuratie centraal in server-setup.

---

## 9. COMPLIANCE (10/10)

| Standaard | Toepassing |
|-----------|------------|
| OWASP Top 10 (2021) | Behandeld via bovenstaande (injection, auth, crypto, config, etc.) |
| NIST FIPS 197 | AES-256 (encryption.util) |
| NIST SP 800-132 | PBKDF2-parameters (key derivation) |
| RFC 7519 | JWT (HS256, exp, algorithm whitelisting) |

Geen hardcoding van compliance-specifieke waarden; waar mogelijk via env of centrale config.

---

## 10. Lokaal vs productie

- **Lokaal:** Zelfde beleid en code als productie. Enige verschil: `.env` (en optioneel `.env.development`) met lokale waarden; `NODE_ENV=development` voor foutdetails en minder strikte CORS indien gewenst.
- **Productie:** Zelfde codebase; andere env (lange secrets, productie-URLs, `NODE_ENV=production`). Geen aparte “productie-only” security code – alles via het variabelensysteem en dit beleid.

**Volgorde:** Eerst lokaal volledig werkend (alle env vars gezet, validatie groen, encryption/auth/rate-limit getest), daarna deployment naar productie met productie-env.

---

## Referenties in codebase

| Onderdeel | Bestand(en) |
|-----------|-------------|
| Env & secrets | `backend/src/config/env.config.ts` |
| Encryptie | `backend/src/utils/encryption.util.ts` |
| Wachtwoord & JWT | `backend/src/utils/auth.util.ts` |
| Auth middleware | `backend/src/middleware/auth.middleware.ts` |
| Rate limiting | `backend/src/middleware/ratelimit.middleware.ts` |
| Validatie (Zod) | `backend/src/validators/*`, `validateRequest` |
| Prisma | `backend/src/lib/prisma.ts`, schema |
| Helmet | Server bootstrap (bijv. `server-database.ts` / `server.ts`) |

Dit document is het centrale beleid; wijzigingen in principes of scores worden hier bijgehouden en in code via het variabelensysteem toegepast.

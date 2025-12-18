# Kattenbak Webshop - Enterprise E-commerce Platform

Modern, schaalbare e-commerce oplossing gebouwd met Next.js, Node.js, en PostgreSQL.

## 🏗️ Architectuur

```
kattenbak/
├── frontend/          # Next.js 16 - Customer-facing webshop
├── backend/           # Node.js + Express - REST API
├── admin/             # React Admin - Admin dashboard
└── shared/            # Gedeelde types en utilities
```

## 🚀 Tech Stack

### Frontend
- **Next.js 16** - App Router, Server Components, ISR
- **React 19** - Latest features via Next.js canary
- **TypeScript 5.7** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Headless accessible components
- **Framer Motion** - Smooth animations
- **TanStack Query** - Server state management

### Backend
- **Node.js 22 LTS** - JavaScript runtime
- **Express 4** - Web framework
- **Prisma 6** - Type-safe ORM
- **PostgreSQL 16** - Relational database
- **Redis 7** - Caching layer
- **Winston** - Logging
- **JWT** - Authentication

### Integrations
- **Mollie** - Payment processing
- **MyParcel** - Shipping labels & tracking

## 📋 Prerequisites

- Node.js >= 22.0.0
- npm >= 10.0.0
- PostgreSQL >= 16
- Redis >= 7 (optional maar aanbevolen)

## ⚡ Quick Start

### 1. Installatie

```bash
# Clone repository
git clone <repository-url>
cd kattenbak

# Install dependencies (alle workspaces)
npm install

# Setup environment
cp .env.example .env.development
```

### 2. Database Setup

```bash
# Start PostgreSQL (via Docker)
docker run --name kattenbak-postgres \
  -e POSTGRES_USER=kattenbak_user \
  -e POSTGRES_PASSWORD=kattenbak_dev_password \
  -e POSTGRES_DB=kattenbak_dev \
  -p 5432:5432 \
  -d postgres:16

# Run Prisma migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### 3. Development

```bash
# Start alle services (backend + frontend + admin)
npm run dev

# Of individueel:
npm run dev:backend   # Backend API op http://localhost:3001
npm run dev:frontend  # Frontend op http://localhost:3000
npm run dev:admin     # Admin op http://localhost:3002
```

### 4. Open Browser

- **Webshop**: http://localhost:3000
- **Admin Panel**: http://localhost:3002
- **API Docs**: http://localhost:3001/api/v1/docs

## 🔐 Environment Configuration

### Development

Gebruik `.env.development` met test API keys:
- ✅ Mollie test API key al geconfigureerd
- ✅ Lokale database
- ✅ Debug logging enabled
- ✅ Relaxed rate limiting

### Production

Voor production deployment:

1. **Kopieer .env.example naar .env.production**
```bash
cp .env.example .env.production
```

2. **Update CRITICAL values:**

```env
# 1. Environment
NODE_ENV=production

# 2. Database (managed service)
DATABASE_URL="postgresql://user:password@your-db-host:5432/kattenbak_prod"

# 3. Mollie LIVE API Key
MOLLIE_API_KEY="live_YOUR_LIVE_API_KEY_HERE"
MOLLIE_WEBHOOK_URL="https://yourdomain.com/api/v1/webhooks/mollie"

# 4. Secure JWT Secret (genereer random 64+ chars)
JWT_SECRET="your_super_secure_random_64_char_string_here"

# 5. Admin credentials
ADMIN_EMAIL="your@email.com"
ADMIN_PASSWORD="StrongPasswordHere123!"

# 6. URLs
BACKEND_URL="https://api.yourdomain.com"
NEXT_PUBLIC_API_URL="https://api.yourdomain.com/api/v1"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# 7. CORS
CORS_ORIGINS="https://yourdomain.com,https://admin.yourdomain.com"

# 8. Logging
LOG_LEVEL="error"
```

3. **Deploy checklist**
- [ ] Alle environment variables gezet
- [ ] Database migrations uitgevoerd
- [ ] SSL certificaten geïnstalleerd
- [ ] Firewall configuratie
- [ ] Backup strategie ingesteld
- [ ] Monitoring ingesteld
- [ ] Redis cache gestart
- [ ] Mollie webhook getest
- [ ] MyParcel integratie getest

## 🏭 Production Build

```bash
# Build alle services
npm run build

# Start production servers
NODE_ENV=production npm run start
```

## 🐳 Docker Deployment

```bash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# Logs
docker-compose logs -f
```

## 📁 Project Structure

```
kattenbak/
├── frontend/
│   ├── app/                    # Next.js App Router
│   │   ├── (shop)/            # Customer-facing pages
│   │   ├── api/               # API routes (proxies)
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── features/          # Feature-specific components
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utilities & configs
│   └── public/                # Static assets
│
├── backend/
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access
│   │   ├── middleware/        # Express middleware
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utilities
│   │   └── server.ts          # Express app
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── tests/                 # Tests
│
└── admin/
    ├── src/
    │   ├── components/        # Admin components
    │   ├── providers/         # Data providers
    │   └── App.tsx            # React Admin app
    └── public/
```

## 🔧 API Endpoints

### Public API
- `GET /api/v1/products` - Lijst producten
- `GET /api/v1/products/:id` - Product detail
- `POST /api/v1/orders` - Plaats bestelling
- `POST /api/v1/payments` - Start betaling

### Admin API (requires JWT)
- `POST /api/v1/admin/auth/login` - Admin login
- `CRUD /api/v1/admin/products` - Product management
- `CRUD /api/v1/admin/orders` - Order management
- `POST /api/v1/admin/shipping/label` - Genereer verzendlabel

### Webhooks
- `POST /api/v1/webhooks/mollie` - Mollie payment updates
- `POST /api/v1/webhooks/myparcel` - MyParcel shipping updates

## 🧪 Testing

```bash
# Run all tests
npm test

# Test coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📊 Monitoring

### Development
```bash
# View logs
npm run dev # logs naar console

# Prisma Studio (database GUI)
npm run prisma:studio
```

### Production
- Check logs: `pm2 logs`
- Monitor processes: `pm2 monit`
- View health: `curl https://yourdomain.com/health`

## 🔒 Security Features

- ✅ JWT authentication voor admin
- ✅ Rate limiting op alle endpoints
- ✅ CORS configuratie
- ✅ Helmet security headers
- ✅ Input validation (Zod schemas)
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS protection
- ✅ CSRF tokens
- ✅ Encrypted passwords (bcrypt)
- ✅ Audit logging
- ✅ Environment-based secrets

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

Private - All Rights Reserved

## 🆘 Support

Voor vragen of problemen:
- Check documentatie in `/docs`
- Open een GitHub issue
- Contact: support@catsupply.nl



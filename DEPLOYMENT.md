# KATTENBAK WEBSHOP - DEPLOYMENT GUIDE

## 🚀 Quick Start (Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Database (Docker)
```bash
docker-compose up -d postgres redis
```

### 3. Setup Environment
```bash
# Environment files already created:
# - env.development (for local dev)
# - env.example (template for production)
```

### 4. Initialize Database
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
cd ..
```

### 5. Start Development Servers
```bash
# Start all services
npm run dev

# Or individually:
npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:3000
npm run dev:admin     # http://localhost:3002
```

## 🏭 Production Deployment

### Option 1: Automated Deployment Script

```bash
# Create production environment file
cp env.example .env.production

# Edit .env.production and set:
# - MOLLIE_API_KEY=live_YOUR_LIVE_KEY
# - DATABASE_URL=your_production_database
# - JWT_SECRET=random_64_char_string
# - ADMIN_PASSWORD=secure_password

# Run deployment
./deploy.sh .env.production
```

### Option 2: Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Manual VPS Deployment

#### Server Requirements
- Ubuntu 22.04 LTS (or similar)
- Node.js 22+
- PostgreSQL 16
- Nginx (reverse proxy)
- PM2 (process manager)

#### Steps

1. **Clone & Install**
```bash
git clone <your-repo>
cd kattenbak
npm install
```

2. **Configure Environment**
```bash
cp env.example .env.production
# Edit .env.production with production values
```

3. **Setup Database**
```bash
# Create PostgreSQL database
sudo -u postgres createdb kattenbak_prod

# Run migrations
cd backend
DATABASE_URL="postgresql://..." npm run prisma:migrate:prod
```

4. **Build Applications**
```bash
# Backend
cd backend
npm ci --only=production
npm run build

# Frontend
cd ../frontend
npm ci --only=production
npm run build

# Admin
cd ../admin
npm ci --only=production
npm run build
```

5. **Start with PM2**
```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start dist/server.js --name kattenbak-backend

# Start frontend
cd ../frontend
pm2 start npm --name kattenbak-frontend -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

6. **Configure Nginx**
```nginx
# /etc/nginx/sites-available/kattenbak

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/kattenbak /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

7. **SSL Certificate (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 📊 Monitoring & Maintenance

### PM2 Commands
```bash
pm2 status              # View all processes
pm2 logs                # View logs
pm2 monit               # Live monitoring
pm2 restart all         # Restart all services
pm2 stop all            # Stop all services
```

### Database Backup
```bash
# Manual backup
pg_dump DATABASE_URL > backup_$(date +%Y%m%d).sql

# Automated daily backup (crontab)
0 2 * * * /path/to/backup-script.sh
```

### Update Deployment
```bash
git pull
./deploy.sh .env.production
```

## 🔒 Security Checklist

- [ ] Changed MOLLIE_API_KEY to live_ key
- [ ] Strong JWT_SECRET (64+ characters)
- [ ] Secure ADMIN_PASSWORD
- [ ] Production DATABASE_URL configured
- [ ] CORS_ORIGINS restricted to your domain
- [ ] SSL certificate installed
- [ ] Firewall configured (UFW)
- [ ] Regular database backups scheduled
- [ ] LOG_LEVEL set to "error" in production

## 📈 Performance Optimization

### Database
- Enable connection pooling
- Add indexes for frequently queried fields
- Regular VACUUM and ANALYZE

### Redis
- Configure maxmemory policy
- Enable persistence (AOF)

### Frontend
- Enable CDN for static assets
- Configure image optimization
- Enable compression

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs kattenbak-backend

# Common issues:
- Database connection failed (check DATABASE_URL)
- Port already in use (change BACKEND_PORT)
- Missing environment variables
```

### Frontend build fails
```bash
# Clear cache
rm -rf frontend/.next
npm run build

# Check Node version
node -v  # Should be 22+
```

### Database migration fails
```bash
# Reset database (CAUTION: deletes all data)
cd backend
npm run prisma:migrate:reset

# Or manually fix migration
npx prisma studio
```

## 📞 Support

Voor vragen of problemen:
- Check logs: `pm2 logs`
- View health: `curl http://localhost:3001/health`
- Database status: `docker-compose ps`

## 🎯 Environment Variables Reference

See `.env.example` for complete list with descriptions.

Critical for production:
- `NODE_ENV=production`
- `MOLLIE_API_KEY=live_...`
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=...`
- `ADMIN_PASSWORD=...`



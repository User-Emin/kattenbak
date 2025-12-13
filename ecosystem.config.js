/**
 * PM2 ECOSYSTEM CONFIG - PRODUCTION
 * Complete process management voor alle services
 */

module.exports = {
  apps: [
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // BACKEND API
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'kattenbak-backend',
      script: 'dist/server.js',
      cwd: './backend',
      instances: 'max',              // Use all CPU cores
      exec_mode: 'cluster',          // Cluster mode for scaling
      max_memory_restart: '500M',    // Auto-restart if memory > 500MB
      
      // Environment variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 3101,
      },
      
      // Logging
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      
      // Auto-restart settings
      autorestart: true,
      watch: false,                  // Don't watch in production
      max_restarts: 10,
      min_uptime: '10s',
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FRONTEND (NEXT.JS)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'kattenbak-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './frontend',
      instances: 2,                  // 2 instances genoeg voor Next.js
      exec_mode: 'cluster',
      max_memory_restart: '1G',      // Next.js uses more memory
      
      env_production: {
        NODE_ENV: 'production',
        PORT: 3100,
      },
      
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ADMIN PANEL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'kattenbak-admin',
      script: 'serve',
      args: '-s build -l 3002',
      cwd: './admin',
      instances: 1,                  // Admin needs only 1 instance
      exec_mode: 'fork',
      max_memory_restart: '300M',
      
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      
      error_file: './logs/admin-error.log',
      out_file: './logs/admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      
      kill_timeout: 5000,
    },
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DEPLOYMENT SETTINGS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  deploy: {
    production: {
      user: 'deployer',
      host: '185.224.139.54',
      ref: 'origin/main',
      repo: 'https://github.com/User-Emin/kattenbak.git',
      path: '/var/www/kattenbak',
      
      // Pre-deploy (run on server before deploy)
      'pre-deploy-local': '',
      
      // Post-deploy (run after git pull)
      'post-deploy': `
        cd backend && npm install --production && npm run build && pm2 reload ecosystem.config.js --only kattenbak-backend &&
        cd ../frontend && npm install --production && npm run build && pm2 reload ecosystem.config.js --only kattenbak-frontend &&
        cd ../admin && npm install --production && npm run build && pm2 reload ecosystem.config.js --only kattenbak-admin
      `,
      
      // Pre-setup (run once on first deploy)
      'pre-setup': '',
    },
  },
};

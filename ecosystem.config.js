module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'dist/server-database.js',
      cwd: '/var/www/kattenbak/backend',
      instances: 1,
      exec_mode: 'fork',
      /** ✅ ZERO-DOWNTIME: PM2 waits for process.send('ready') before killing old process */
      wait_ready: true,
      listen_timeout: 30000,
      env: {
        NODE_ENV: 'production',
        PORT: 3101
      },
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '500M',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 10000,
      // CPU optimization for KVM
      node_args: '--max-old-space-size=512',
      merge_logs: true,
      log_type: 'json'
    },
    {
      name: 'frontend',
      script: '.next/standalone/frontend/server.js',  // ✅ CPU-FRIENDLY: Use pre-built standalone (NO BUILD on server)
      cwd: './frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3102,  // ✅ FIX: Port 3102 (matches Nginx config)
        HOSTNAME: '0.0.0.0',
        NEXT_TELEMETRY_DISABLED: 1
      },
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '800M',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'admin',
      script: 'node_modules/.bin/next',
      args: 'start -p 3103 -H 0.0.0.0',
      cwd: './admin-next',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3103,
        HOSTNAME: '0.0.0.0',
        NEXT_PUBLIC_API_URL: 'https://catsupply.nl/api/v1',
        NEXT_TELEMETRY_DISABLED: 1
      },
      error_file: '../logs/admin-error.log',
      out_file: '../logs/admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '500M',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_cpu_restart: '70%'
    }
  ],

  deploy: {
    production: {
      user: process.env.DEPLOY_USER || 'root',
      host: process.env.DEPLOY_HOST || 'localhost',
      ref: 'origin/main',
      repo: process.env.DEPLOY_REPO || 'git@github.com:User-Emin/kattenbak.git',
      path: process.env.DEPLOY_PATH || '/var/www/kattenbak',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};

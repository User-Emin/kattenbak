module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'node',
      args: 'dist/server.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
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
      kill_timeout: 5000,
      // CPU optimization for KVM
      node_args: '--max-old-space-size=512',
      merge_logs: true,
      log_type: 'json'
    },
    {
      name: 'frontend',
      script: 'npm',  // ✅ FIX: Use npm start (compatible with standard Next.js build)
      args: 'start',
      cwd: './frontend',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,  // ✅ FIX: Changed from 3102 to 3000 (standard frontend port)
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
      script: 'npm',
      args: 'start',
      cwd: './admin-next',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3002,  // ✅ Admin op aparte poort - volledig gescheiden van dev
        NEXT_TELEMETRY_DISABLED: 1
      },
      error_file: '../logs/admin-error.log',
      out_file: '../logs/admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '500M',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: '185.224.139.74',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/kattenbak.git',
      path: '/var/www/catsupply',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};

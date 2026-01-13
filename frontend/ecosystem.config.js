module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: '/var/www/kattenbak/frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: '3102',
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/root/.pm2/logs/frontend-error.log',
      out_file: '/root/.pm2/logs/frontend-out.log',
      time: true,
    }
  ]
};

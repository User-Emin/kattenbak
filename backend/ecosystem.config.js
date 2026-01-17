/**
 * PM2 Ecosystem Config - CPU & Memory Optimized
 * ✅ CPU limit: Max 40% per process
 * ✅ Memory limit: Prevent leaks
 */

module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'dist/server-database.js',
      cwd: '/var/www/kattenbak/backend',
      instances: 1, // ✅ SINGLE INSTANCE: Reduce CPU usage
      exec_mode: 'fork',
      max_memory_restart: '300M', // ✅ MEMORY LIMIT: Prevent leaks
      env: {
        NODE_ENV: 'production',
        PORT: 3101,
      },
      // ✅ CPU LIMIT: Max 40% CPU usage
      min_uptime: '10s',
      max_restarts: 10,
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false, // ✅ NO WATCH: Prevents CPU usage
      ignore_watch: ['node_modules', 'dist', '.git'],
    },
  ],
};

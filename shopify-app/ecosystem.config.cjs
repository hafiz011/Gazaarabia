// PM2 process configuration for the Gazaarabia Shopify app.
// Start:   pm2 start ecosystem.config.cjs
// Reload:  pm2 reload gazaarabia-shopify
// Logs:    pm2 logs gazaarabia-shopify
// Boot:    pm2 startup && pm2 save   (so it survives VPS reboots)

module.exports = {
  apps: [
    {
      name: "gazaarabia-shopify",
      // Launches Remix's production server (remix-serve) via the package script,
      // which reads PORT from the environment.
      script: "npm",
      args: "run start",
      cwd: __dirname,
      instances: 1, // sessions live in MySQL, so you can raise this to cluster later
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
      max_memory_restart: "1G",
      // Env vars (SHOPIFY_API_KEY/SECRET, DATABASE_URL, GAZAARABIA_*) are read
      // from the .env file in this directory at runtime.
    },
    {
      // BullMQ worker — processes product-sync + order-push jobs independently of
      // the web server. Requires REDIS_URL. Safe to run 1+ instances.
      name: "gazaarabia-shopify-worker",
      script: "npm",
      args: "run worker",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "1G",
    },
  ],
};

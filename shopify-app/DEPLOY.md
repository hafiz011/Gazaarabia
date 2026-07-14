# Deploying the Gazaarabia Shopify app on your VPS (nginx + PM2 + MySQL)

Target: run this app as a separate Node service on a subdomain
(`shopify.gazaarabia.com`), reverse-proxied by nginx, kept alive by PM2, using
your existing MySQL for session storage.

Your VPS (24 GB / 12 core) runs this comfortably alongside the main site.

---

## 0. Prerequisites (on the VPS)
- **Node ≥ 20.19** — check `node -v`. If older, install via nvm:
  `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && nvm install 20`
- **PM2** — `npm i -g pm2`
- **nginx** + **certbot** — `sudo apt install nginx certbot python3-certbot-nginx`
- A **DNS A record**: `shopify.gazaarabia.com` → your VPS IP.

## 1. Create the app in Shopify (once, from your laptop)
```bash
cd shopify-app
npm install
npm run config:link      # browser login → creates/links the app, writes client_id
```
In the Partner/Dev Dashboard set the app URL + allowed redirect to your subdomain
(`https://shopify.gazaarabia.com`). You'll also copy the **API key** and **API
secret** for the VPS `.env`.

## 2. MySQL database (on the VPS)
```sql
CREATE DATABASE gazaarabia_shopify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'shopify_user'@'localhost' IDENTIFIED BY 'a-strong-password';
GRANT ALL PRIVILEGES ON gazaarabia_shopify.* TO 'shopify_user'@'localhost';
FLUSH PRIVILEGES;
```

## 3. Get the code + env on the VPS
```bash
# copy/clone the shopify-app/ folder to the VPS, then:
cd shopify-app
cp .env.example .env
# edit .env: SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_URL,
#            DATABASE_URL, GAZAARABIA_API_URL, GAZAARABIA_INTERNAL_SECRET
npm ci
```

## 4. Build + migrate
```bash
npx prisma migrate deploy   # creates the Session table in MySQL
npm run build               # produces build/ (Remix production server)
```

## 5. Start with PM2
```bash
pm2 start ecosystem.config.cjs
pm2 save            # persist process list
pm2 startup         # print the command to run so PM2 relaunches on reboot
pm2 logs gazaarabia-shopify
```
The app now listens on `127.0.0.1:3001`.

## 6. nginx + HTTPS
```bash
sudo cp deploy/nginx-shopify.conf /etc/nginx/sites-available/shopify.gazaarabia.com
sudo ln -s /etc/nginx/sites-available/shopify.gazaarabia.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d shopify.gazaarabia.com   # issues + wires up TLS
```
Confirm `https://shopify.gazaarabia.com` loads (you'll see a Shopify auth redirect).

## 7. Point Shopify at production + deploy config
```bash
# from your laptop (or VPS) with the CLI:
npm run deploy      # pushes shopify.app.toml (scopes, webhooks) to Shopify
```
Ensure `application_url` / redirect URLs in the app settings = `https://shopify.gazaarabia.com`.

## 8. Install on a dev store and test
Use the install link from the Partner Dashboard → install on a development store →
the embedded UI loads in the Shopify Admin → click **Sync products now**.

---

## Updating later
```bash
cd shopify-app && git pull
npm ci && npx prisma migrate deploy && npm run build
pm2 reload gazaarabia-shopify
```

## Notes
- **Don't commit `.env`** — it holds the API secret and DB password.
- The main gazaarabia site is untouched; this is a separate PM2 process on its own
  subdomain and its own MySQL database.
- Raise PM2 `instances` to cluster later if needed — sessions are in MySQL, so it's
  safe to scale horizontally.

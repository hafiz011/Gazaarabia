# Production environment template and local split

This repository has two separate apps:

- Gazaarabia Next.js marketplace
- Shopify Remix app

The production configuration is intentionally environment-based. This file documents the variables the code actually reads and the safe placeholder format to use in a real deployment target.

## 1) Local development vs production

### Local development
- `http://localhost:*` for the marketplace app
- `shopify app dev` for the Shopify app, with a local dev store and a CLI-managed tunnel URL
- local MySQL connection via `DATABASE_URL`
- optional local Redis via `REDIS_URL`
- local shared secret in `GAZAARABIA_INTERNAL_SECRET`

### Production
- public HTTPS app URL, e.g. `https://shopify.gazaarabia.com`
- production MySQL URL in `DATABASE_URL`
- production Redis in `REDIS_URL`
- public Gazaarabia marketplace URL in `GAZAARABIA_API_URL` and `GAZAARABIA_APP_URL`
- production `SHOPIFY_APP_URL` that matches the deployed Shopify app URL
- production server-to-server shared secret in `GAZAARABIA_INTERNAL_SECRET`
- PM2 web process + PM2 worker for the Shopify app
- cron/backstop with `CRON_SECRET` and Bearer auth

> Important: this repository does not prove any production host is currently live. The domain `https://shopify.gazaarabia.com` is only used as a template/example where the configuration explicitly expects it.

## 2) Required variables used by the code

The table below lists only variables actually read by the repository.

| Variable | Required in production | Secret | Used by | Example placeholder |
| --- | --- | --- | --- | --- |
| `SHOPIFY_APP_URL` | Yes | No | Shopify app runtime + order push flow | `https://shopify.gazaarabia.com` |
| `GAZAARABIA_API_URL` | Yes | No | Shopify app to marketplace API | `https://gazaarabia.com` |
| `GAZAARABIA_APP_URL` | Yes | No | browser redirect/linking | `https://gazaarabia.com` |
| `GAZAARABIA_INTERNAL_SECRET` | Yes | Yes | internal request verification | `<PRODUCTION_SHARED_SECRET>` |
| `CRON_SECRET` | Yes, if cron route is enabled | Yes | cron/backstop auth | `<CRON_SECRET>` |
| `DATABASE_URL` | Yes | Yes | Prisma/MySQL | `<PRODUCTION_MYSQL_DATABASE_URL>` |
| `REDIS_URL` | Optional but recommended | Maybe | BullMQ queue/worker durability | `<PRODUCTION_REDIS_URL>` |
| `SHOPIFY_API_KEY` | Yes | Yes | Shopify app auth | `<SHOPIFY_CLIENT_ID>` |
| `SHOPIFY_API_SECRET` | Yes | Yes | Shopify app auth | `<SHOPIFY_CLIENT_SECRET>` |
| `SCOPES` | Yes | No | Shopify app config | `read_inventory,read_products,write_orders,read_orders,read_customers` |
| `STRIPE_SECRET_KEY` | If Stripe is used | Yes | Stripe API | `<STRIPE_SECRET_KEY>` |
| `STRIPE_WEBHOOK_SECRET` | If Stripe webhook is enabled | Yes | Stripe signature verification | `<STRIPE_WEBHOOK_SECRET>` |
| `NEXTAUTH_SECRET` | If NextAuth is used | Yes | Next.js auth | `<NEXTAUTH_SECRET>` |
| `AUTH_SECRET` | Only if used by project auth config | Yes | alternate auth config | `<AUTH_SECRET>` |
| `NEXTAUTH_URL` | If NextAuth is used | No | auth callback URL | `https://gazaarabia.com` |
| `AUTH_URL` | Only if used by project auth config | No | alternate auth URL | `https://gazaarabia.com` |
| `SESSION_SECRET` | If session middleware uses it | Yes | session secret | `<SESSION_SECRET>` |
| `PORT` | Yes for server binding | No | local or PM2 app port | `3001` |

## 3) Safe committed example

Use the repo-safe examples:

- `.env.example` for the marketplace app
- `shopify-app/.env.example` for the Shopify app
- `shopify-app/.env.development` for local dev configuration
- `shopify-app/.env.production` for an ignored production-only template

These files contain placeholders only. They intentionally avoid real values.

## 4) Deployment notes

- Do not commit real `.env`, `.env.local`, `.env.production`, or Shopify app runtime env files.
- Do not add live credentials to the repository.
- Review `.gitignore` and keep secret-bearing env files outside version control.
- Run Prisma migrations only against the intended database target when deployment occurs.
- Keep the cron route authenticated with `CRON_SECRET` and Bearer auth.
- Keep Redis optional in local dev, but production should use it for durable queueing and retry/backstop reliability.

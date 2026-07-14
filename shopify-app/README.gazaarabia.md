# Gazaarabia — Shopify App

A **public, embedded Shopify app** (OAuth + GraphQL Admin API) that lets a
merchant connect their Shopify store to the Gazaarabia marketplace. Built on
Shopify's official Remix template.

It does three things:
1. **Sync products** from the merchant's store → gazaarabia (GraphQL, cursor-paginated).
2. **Push orders** to the merchant's store when a marketplace sale happens (`orderCreate`).
3. **Sync order status** back to gazaarabia via HMAC-verified webhooks.

> This is a **separate service** from the gazaarabia Next.js app. WooCommerce is
> unaffected and keeps using the existing REST integration in the main app.

---

## Architecture

```
Merchant's Shopify Admin  ── embedded app UI (this project) ──┐
                                                              │ OAuth token (stored per shop)
   Shopify GraphQL Admin API  ◄───────────────────────────────┘
      ▲   │
      │   └── products (read)  ── syncProducts() ──► gazaarabia backend
      │   └── orderCreate      ◄── /api/push-order ── gazaarabia backend
      └────── webhooks (orders/*, GDPR, app/uninstalled) ──► gazaarabia backend
```

Tokens live **only** in this app's session store. gazaarabia never sees a
Shopify token; it calls `/api/push-order` here with a shared secret and this app
uses the stored offline session to talk to Shopify.

---

## What's been scaffolded

| File | Purpose |
|---|---|
| `shopify.app.toml` | Scopes (`read_products,write_orders,read_orders`) + all webhook subscriptions incl. the 3 mandatory GDPR topics |
| `app/lib/sync.server.ts` | Paginated GraphQL product read → forwards to gazaarabia |
| `app/lib/queries.server.ts` | `PRODUCTS_QUERY`, `ORDER_CREATE_MUTATION` |
| `app/lib/gazaarabia.server.ts` | Server-to-server client (shared-secret) for the gazaarabia backend |
| `app/routes/app._index.tsx` | Merchant home page with a "Sync products now" button |
| `app/routes/api.push-order.tsx` | Endpoint gazaarabia calls to create an order in the store |
| `app/routes/webhooks.orders.*.tsx` | Order status → gazaarabia (HMAC auto-verified) |
| `app/routes/webhooks.customers.*` / `webhooks.shop.redact.tsx` | Mandatory GDPR compliance handlers |

---

## Setup (steps you run — they need interactive Shopify login)

1. **Prereqs:** Node ≥ 20.19, a free [Shopify Partner account](https://partners.shopify.com), and a development store.
2. **Install:** `cd shopify-app && npm install`
3. **Create the app + link config:**
   ```bash
   npm run config:link      # or: npx shopify app config link
   ```
   This logs into your Partner account (browser), lets you create/select the app,
   and writes `client_id` into `shopify.app.toml`.
4. **Env:** copy `.env.example` → `.env` and fill `GAZAARABIA_API_URL` +
   `GAZAARABIA_INTERNAL_SECRET` (the CLI provides the Shopify vars in dev).
5. **Run:** `npm run dev` — starts the app, opens a tunnel, and gives an install
   link. Install it on your dev store; the embedded UI loads in the Shopify Admin.
6. **Deploy webhook/config changes:** `npm run deploy`.

> I could not run these here — `shopify app` requires interactive Partner-account
> auth in a browser, which isn't possible in this environment.

---

## Production notes

- **Session storage:** the template defaults to SQLite (`prisma/schema.prisma`).
  Switch the datasource to your production DB (Postgres/MySQL) before launch and
  run `prisma migrate deploy`.
- **API version:** pinned to `2025-01` in `shopify.app.toml` and
  `app/shopify.server.ts`. Bump both together on each Shopify release.
- **`orderCreate` input:** verify `OrderCreateOrderInput` fields against your
  `api_version` (use `npm run graphql-codegen` for typed operations).

---

## Backend endpoints gazaarabia must implement

This app calls the following on `GAZAARABIA_API_URL` (all `POST`, all must check
the `x-internal-secret` header):

| Endpoint | Sent when | Body |
|---|---|---|
| `/api/integrations/shopify/products` | Merchant clicks "Sync products" | `{ shop, products[] }` (products use the same shape as `NormalizedProduct`) |
| `/api/integrations/shopify/order-status` | `orders/fulfilled` or `orders/cancelled` | `{ shop, topic, externalOrderId, status }` |
| `/api/integrations/shopify/gdpr/data-request` | GDPR data request | `{ shop, payload }` |
| `/api/integrations/shopify/gdpr/customer-redact` | GDPR customer redact | `{ shop, payload }` |
| `/api/integrations/shopify/gdpr/shop-redact` | GDPR shop redact | `{ shop, payload }` |

And gazaarabia calls **this app** to push an order:

| This app endpoint | Body |
|---|---|
| `POST /api/push-order` (header `x-internal-secret`) | `{ shop, order }` where `order` is an `OrderCreateOrderInput` |

---

## Publishing checklist (App Store)

- [ ] OAuth + embedded working on a dev store
- [ ] GraphQL only (no REST) ✅ scaffolded
- [ ] 3 GDPR compliance webhooks return 200 and actually act ✅ scaffolded (wire the gazaarabia side)
- [ ] All webhooks HMAC-verified ✅ (via `authenticate.webhook`)
- [ ] Billing via Shopify Billing API — only if you charge
- [ ] Listing: real screenshots, privacy policy, demo store, support contact
- [ ] Submit → review (~2–4 weeks; budget ~6 weeks with iteration)

See the upstream template guide in `README.md`.

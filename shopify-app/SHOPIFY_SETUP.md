# Shopify App — Dev / Production Setup

This app uses a **two-app architecture**: a dedicated **development** Partner app and a
separate **production** Partner app. They are fully isolated (different `client_id`, API
secret, OAuth, webhook registrations, URLs), so day-to-day development can never disturb
production.

> This document covers **configuration and workflow only**. No application code, routes,
> database schema, queue, workers, webhook handlers, or OAuth logic are affected by any of it.

---

## 1. File map

| File | Purpose | Committed? |
|------|---------|-----------|
| `shopify.app.toml` | **Default = DEVELOPMENT** config → *Gazaarabia Dev* app | ✅ yes (no secrets) |
| `shopify.app.production.toml` | **PRODUCTION** config → *Gazaarabia* app | ✅ yes (no secrets) |
| `.env.development` | Dev environment values (auto-loaded in dev) | ❌ gitignored |
| `.env.production` | Production environment values (VPS) | ❌ gitignored |
| `.env` / `.env.local` | Optional per-developer local overrides | ❌ gitignored |
| `.env.example` | Reference template | ✅ yes |

`client_id` (a.k.a. API key) is **public** and lives in the `.toml`. The **API secret** and
all other credentials live only in the gitignored `.env.*` files.

---

## 2. Why `shopify.app.toml` is development

The Shopify CLI reads `shopify.app.toml` **by default** when no `--config` is passed. Making
that the development config means the everyday command is simply:

```bash
shopify app dev
```

No `shopify app config use …` step, no chance of accidentally running `dev` against
production. It is also the CLI's future-proof default.

## 3. Why production is a separate file

Production is intentionally **not** the default. It must be selected explicitly:

```bash
shopify app config use shopify.app.production.toml
shopify app deploy
```

Requiring an explicit switch means production is only ever touched on purpose. Combined with
`automatically_update_urls_on_dev = false` in the production toml, a stray `dev` can never
rewrite the production `application_url` or redirect URLs.

---

## 4. Environment loading (no copy workflow)

You do **not** copy any file. Loading is automatic:

- **Development** — `shopify app dev` runs Vite in *development* mode. `vite.config.ts` calls
  Vite's `loadEnv` and merges `.env.development` into `process.env`, **without overriding**
  anything the shell or the Shopify CLI already set (so CLI-injected `SHOPIFY_API_KEY`,
  `SHOPIFY_API_SECRET`, and the tunnel `HOST`/`SHOPIFY_APP_URL` always win). Empty values in
  the file are ignored. `.env` / `.env.local` are also loaded for personal overrides.
- **Production** — there is no Vite and no CLI at runtime. Load `.env.production` into the
  process environment before starting the server:

  ```bash
  set -a; source .env.production; set +a
  pm2 start ecosystem.config.cjs
  ```

**Golden rule:** never set `SHOPIFY_APP_URL` in `.env.development`. The CLI tunnel owns that
value in development. It is set **only** in `.env.production` (`https://shopify.gazaarabia.com`).

---

## 5. Partner App separation

| | Development | Production |
|---|---|---|
| Partner app name | **Gazaarabia Dev** | **Gazaarabia** |
| `client_id` | its own (CLI-linked) | `2d7ddfe6c238bfc3798d7702a70eb553` |
| API secret | dev secret | production secret |
| `application_url` | Cloudflare tunnel (auto) | `https://shopify.gazaarabia.com` |
| `redirect_urls` | tunnel callback (auto) | `https://shopify.gazaarabia.com/auth/callback` |
| `automatically_update_urls_on_dev` | `true` | `false` |
| Webhook registrations | dev app's dashboard | production app's dashboard |
| Store | development store | live merchant stores |

Because they are **different apps with different `client_id`s**, their webhook registrations
and URLs live in **different dashboards**. `shopify app dev` operates on the dev app; it is
physically incapable of modifying the production app. This is the core guarantee.

**Identical on purpose** (must stay in sync): `api_version = "2025-01"` (matches
`ApiVersion.January25` in `app/shopify.server.ts`), `scopes`, and the webhook topic set.

---

## 6. Webhooks

Both configs subscribe to the **same** set of topics:

- `app/uninstalled`, `app/scopes_update`
- `products/create|update|delete`, `inventory_levels/update`
- GDPR compliance: `customers/data_request`, `customers/redact`, `shop/redact`
- **Protected Customer Data:** `orders/create|updated|paid|fulfilled|partially_fulfilled|cancelled|delete`, `refunds/create`

The 17 webhook **handlers** in `app/routes/webhooks.*` are unchanged and always present. The
config only decides which topics each app **subscribes** to.

---

## 7. Protected Customer Data (PCD) approval

The 8 order/refund topics contain protected customer data and require Shopify approval
**per app**.

- **Production:** request PCD access for the *Gazaarabia* app (Partner Dashboard → app →
  **API access** → **Protected customer data access**). After approval,
  `shopify app deploy` registers all order/refund webhooks.
- **Development:** if the *Gazaarabia Dev* app is **also** PCD-approved, leave the topics
  enabled — dev then mirrors production exactly. If it is **not** approved yet, **comment out
  the 8 PCD blocks** in `shopify.app.toml` (they are clearly fenced with a comment banner).
  Otherwise `shopify app dev` fails with *"not approved to subscribe to webhook topics
  containing protected customer data."* Everything else (products, inventory, GDPR, lifecycle)
  works without approval.

Toggling the dev topics never affects production — production keeps every topic via
`shopify.app.production.toml`.

---

## 8. Workflows

### Development
```bash
cd shopify-app
# one-time: create + link the dev app (fills client_id in shopify.app.toml)
shopify app config link            # choose "Create a new app" → name it "Gazaarabia Dev"
# then, every day:
shopify app dev
```

### Production (VPS)
```bash
cd shopify-app
set -a; source .env.production; set +a     # load prod env
npx prisma migrate deploy                  # apply migrations
npm run build
pm2 start ecosystem.config.cjs             # web + worker
# from a dev machine, register the prod config with Shopify:
shopify app config use shopify.app.production.toml
shopify app deploy                         # registers webhooks (needs PCD approval for orders/*)
```

### Staging (optional)
Clone the pattern: create a third Partner app + `shopify.app.staging.toml`
(`https://shopify-staging.gazaarabia.com`, `automatically_update_urls_on_dev = false`) and a
`.env.staging`. Deploy with `shopify app deploy --config=staging`. Same isolation guarantees.

---

## 9. Common mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Setting `SHOPIFY_APP_URL` in `.env.development` | Cloudflare 1033 / iframe refuses to load; tunnel ignored | Remove it — the CLI tunnel owns it in dev |
| Running `shopify app deploy` without switching config | Dev app deployed instead of production | `shopify app config use shopify.app.production.toml` **first** |
| PCD topics enabled on an unapproved dev app | `shopify app dev` fails: "not approved … protected customer data" | Comment out the 8 PCD blocks in `shopify.app.toml`, or get the dev app PCD-approved |
| `api_version` drift between toml and `shopify.server.ts` | Webhooks register on the wrong version | Keep both tomls at `2025-01` = `ApiVersion.January25` |
| Dev pointed at the production database | Dev data mixes into prod | `.env.development` uses `gazaarabia_shopify_dev` |
| Committing a `.env.*` file | Secret leak | `.env` and `.env.*` are gitignored — keep them so |
| Deploying without loading env on the VPS | App boots with missing `SHOPIFY_API_SECRET`/`DATABASE_URL` | `set -a; source .env.production; set +a` before `pm2 start` |

---

## 10. Recovery steps

- **"No config found" / wrong app active** → `shopify app config use shopify.app.toml`
  (dev) or `shopify app config use shopify.app.production.toml` (prod). Confirm the active
  config name printed in the CLI banner.
- **Dev `client_id` is empty / link lost** → `shopify app config link` and select the
  *Gazaarabia Dev* app (or create it). The CLI rewrites `client_id` in `shopify.app.toml`.
- **Production URLs got overwritten** (should be impossible now) → verify
  `automatically_update_urls_on_dev = false` in `shopify.app.production.toml`, then
  `shopify app config use shopify.app.production.toml && shopify app deploy` to re-register
  the correct URLs.
- **Tunnel URL stale / iframe won't load in dev** → stop `dev`, run `shopify app dev --reset`
  to remint the tunnel and re-sync dev URLs.
- **Webhooks missing in production** → confirm PCD approval, then re-run
  `shopify app deploy` with the production config active.

---

## 11. Verification checklist

- [ ] `shopify.app.toml` and `shopify.app.production.toml` both present; no plain-conflict `.toml` leftovers.
- [ ] `api_version = "2025-01"` in both tomls, matching `ApiVersion.January25` in `app/shopify.server.ts`.
- [ ] `automatically_update_urls_on_dev` = `true` (dev) / `false` (production).
- [ ] `.env.development` has **no** `SHOPIFY_APP_URL`; `.env.production` sets it to `https://shopify.gazaarabia.com`.
- [ ] `.env.development` / `.env.production` are gitignored; tomls are committed.
- [ ] `shopify app dev` works (PCD blocks commented out if the dev app is not yet approved).
- [ ] `shopify app config use shopify.app.production.toml && shopify app deploy` registers the full webhook set (after PCD approval).
- [ ] Running dev does not change anything in the production app's Partner dashboard.

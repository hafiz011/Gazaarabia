import type { ActionFunctionArgs } from "@remix-run/node";
import { processWebhook } from "../lib/webhook.server";
import db from "../db.server";
import { gazaarabiaFetch } from "../lib/gazaarabia.server";

// Mandatory GDPR webhook (48h SLA): purge all of the store's data.
export const action = ({ request }: ActionFunctionArgs) =>
  processWebhook(request, async ({ shop, payload }) => {
    await db.session.deleteMany({ where: { shop } });
    await gazaarabiaFetch("/api/integrations/shopify/gdpr/shop-redact", { shop, payload });
  });

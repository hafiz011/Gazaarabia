import type { ActionFunctionArgs } from "@remix-run/node";
import { processWebhook } from "../lib/webhook.server";
import { gazaarabiaFetch } from "../lib/gazaarabia.server";

// Mandatory GDPR webhook (30-day SLA). Forward to gazaarabia to erase.
export const action = ({ request }: ActionFunctionArgs) =>
  processWebhook(request, ({ shop, payload }) =>
    gazaarabiaFetch("/api/integrations/shopify/gdpr/customer-redact", { shop, payload })
  );

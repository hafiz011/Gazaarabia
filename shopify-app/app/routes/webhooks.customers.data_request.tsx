import type { ActionFunctionArgs } from "@remix-run/node";
import { processWebhook } from "../lib/webhook.server";
import { gazaarabiaFetch } from "../lib/gazaarabia.server";

// Mandatory GDPR webhook (30-day SLA). gazaarabia owns the data → forward.
export const action = ({ request }: ActionFunctionArgs) =>
  processWebhook(request, ({ shop, payload }) =>
    gazaarabiaFetch("/api/integrations/shopify/gdpr/data-request", { shop, payload })
  );

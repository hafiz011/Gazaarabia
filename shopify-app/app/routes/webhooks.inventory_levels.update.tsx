import type { ActionFunctionArgs } from "@remix-run/node";
import { processWebhook } from "../lib/webhook.server";
import { handleInventoryUpdate } from "../lib/productWebhook.server";

export const action = ({ request }: ActionFunctionArgs) =>
  processWebhook(request, ({ shop, admin, payload }) => handleInventoryUpdate(shop, admin, payload));

import type { ActionFunctionArgs } from "@remix-run/node";
import { processWebhook } from "../lib/webhook.server";
import { handleProductDelete } from "../lib/productWebhook.server";

export const action = ({ request }: ActionFunctionArgs) =>
  processWebhook(request, ({ shop, payload }) => handleProductDelete(shop, payload));

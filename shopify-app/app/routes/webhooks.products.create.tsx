import type { ActionFunctionArgs } from "@remix-run/node";
import { processWebhook } from "../lib/webhook.server";
import { handleProductUpsert } from "../lib/productWebhook.server";

export const action = ({ request }: ActionFunctionArgs) =>
  processWebhook(request, ({ shop, payload }) => handleProductUpsert(shop, payload));

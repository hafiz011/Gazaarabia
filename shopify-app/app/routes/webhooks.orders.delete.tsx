import type { ActionFunctionArgs } from "@remix-run/node";
import { processWebhook } from "../lib/webhook.server";
import { forwardOrderDelete } from "../lib/orderStatus.server";

export const action = ({ request }: ActionFunctionArgs) =>
  processWebhook(request, ({ shop, payload }) => forwardOrderDelete(shop, payload));

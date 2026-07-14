import type { ActionFunctionArgs } from "@remix-run/node";
import { processWebhook } from "../lib/webhook.server";
import { forwardOrderStatus } from "../lib/orderStatus.server";

export const action = ({ request }: ActionFunctionArgs) =>
  processWebhook(request, ({ shop, topic, payload }) => forwardOrderStatus(shop, topic, payload));

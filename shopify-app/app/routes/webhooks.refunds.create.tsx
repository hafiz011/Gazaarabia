import type { ActionFunctionArgs } from "@remix-run/node";
import { processWebhook } from "../lib/webhook.server";
import { forwardRefund } from "../lib/orderStatus.server";

export const action = ({ request }: ActionFunctionArgs) =>
  processWebhook(request, ({ shop, payload }) => forwardRefund(shop, payload));

import type { ActionFunctionArgs } from "@remix-run/node";
import { processWebhook } from "../lib/webhook.server";
import db from "../db.server";

export const action = ({ request }: ActionFunctionArgs) =>
  processWebhook(request, async ({ shop, session }) => {
    // Fires multiple times / after uninstall — deleteMany is safe.
    if (session) {
      await db.session.deleteMany({ where: { shop } });
    }
  });

import type { ActionFunctionArgs } from "@remix-run/node";
import { processWebhook } from "../lib/webhook.server";
import db from "../db.server";

export const action = ({ request }: ActionFunctionArgs) =>
  processWebhook(request, async ({ session, payload }) => {
    const current = payload.current as string[];
    if (session) {
      await db.session.update({
        where: { id: session.id },
        data: { scope: current.toString() },
      });
    }
  });

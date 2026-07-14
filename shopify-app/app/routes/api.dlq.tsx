import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { dlqList, dlqReplay } from "../lib/queue.server";
import { verifyInternalSecret } from "../lib/security.server";

// Ops-only Dead Letter Queue. GET = inspect exhausted jobs; POST = replay them.
export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (!verifyInternalSecret(request)) return new Response("Unauthorized", { status: 401 });
  return Response.json({ dlq: await dlqList() });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (!verifyInternalSecret(request)) return new Response("Unauthorized", { status: 401 });
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  return Response.json({ replayed: await dlqReplay() });
};

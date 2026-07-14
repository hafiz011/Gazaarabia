import type { LoaderFunctionArgs } from "@remix-run/node";
import { metricsSnapshot } from "../lib/metrics.server";
import { verifyInternalSecret } from "../lib/security.server";

// Ops-only metrics snapshot (counters, success rate, latency, queue depth).
export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (!verifyInternalSecret(request)) return new Response("Unauthorized", { status: 401 });
  return Response.json(await metricsSnapshot());
};

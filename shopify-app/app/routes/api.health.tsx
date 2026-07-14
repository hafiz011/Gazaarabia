import type { LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";
import { redisHealthy } from "../lib/redis.server";
import { queueCounts } from "../lib/queue.server";
import { verifyInternalSecret } from "../lib/security.server";
import { log } from "../lib/logger.server";

// Ops-only. Reports DB (session store), Redis, and queue health.
export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (!verifyInternalSecret(request)) return new Response("Unauthorized", { status: 401 });

  const dbOk = await db.session.count().then(() => true).catch(() => false);
  const redis = await redisHealthy();
  const queues = await queueCounts().catch(() => null);

  const status = dbOk ? "ok" : "degraded"; // Redis is optional (graceful)
  if (!dbOk) log.error("health.failure", { db: dbOk, redis });

  return Response.json({ status, db: dbOk, redis, queues }, { status: dbOk ? 200 : 503 });
};

// Standalone BullMQ worker process. Run separately from the web server (a second
// PM2 process) so job processing scales/fails independently of HTTP traffic:
//   npm run worker
import "@shopify/shopify-app-remix/adapters/node";
import { startWorkers } from "./app/lib/workers.server";

startWorkers();

console.log(
  JSON.stringify({ ts: new Date().toISOString(), level: "info", event: "worker.boot" })
);

// Keep the process alive.
process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));

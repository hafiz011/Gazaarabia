// Lightweight structured (JSON-line) logging for the Shopify sync/reconcile path
// on the Gazaarabia side. Greppable by `event`.
//
// Failure events are emitted on console.error (and warnings on console.warn) so
// they surface in error-level log drains / alerting instead of being buried in
// stdout alongside routine info lines. The severity is derived from the event
// name, so no call site has to change and control flow is unaffected.

const ERROR_EVENT = /(fail|error|misconfigured|denied|unauthorized|rejected)/i;
const WARN_EVENT = /(warn|retry|skip|invalid|validation|timeout|throttl)/i;

export type SyncLogLevel = "info" | "warn" | "error";

/** Severity for an event name. Exported so tests/callers can assert on it. */
export function syncLogLevel(event: string): SyncLogLevel {
  if (ERROR_EVENT.test(event)) return "error";
  if (WARN_EVENT.test(event)) return "warn";
  return "info";
}

export function syncLog(event: string, fields: Record<string, unknown> = {}): void {
  const level = syncLogLevel(event);
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    scope: "shopify-sync",
    event,
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

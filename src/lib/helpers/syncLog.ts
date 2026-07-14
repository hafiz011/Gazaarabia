// Lightweight structured (JSON-line) logging for the Shopify sync/reconcile path
// on the Gazaarabia side. Greppable by `event`.
export function syncLog(event: string, fields: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), scope: "shopify-sync", event, ...fields }));
}

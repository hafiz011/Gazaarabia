// Structured (JSON-line) logging so sync/webhook events are greppable and
// machine-parseable in production (PM2 logs / log shippers).

type Fields = Record<string, unknown>;

function emit(level: "info" | "warn" | "error", event: string, fields: Fields) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  if (level === "error") console.error(line);
  else console.log(line);
}

export const log = {
  info: (event: string, fields: Fields = {}) => emit("info", event, fields),
  warn: (event: string, fields: Fields = {}) => emit("warn", event, fields),
  error: (event: string, fields: Fields = {}) => emit("error", event, fields),
};

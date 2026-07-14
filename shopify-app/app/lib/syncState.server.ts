// Persistent (DB-backed) per-shop sync status so progress survives restarts and
// a crashed sync can resume from its last cursor. Same shape as before, but now
// async — backed by the SyncJob table.

import db from "../db.server";

export type SyncStatus = "idle" | "running" | "completed" | "failed";

export interface SyncState {
  status: SyncStatus;
  mode: "full" | "delta";
  synced: number;
  pages: number;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  cursor: string | null; // resume point (in-progress)
  lastCursor: string | null;
}

const DEFAULT: SyncState = {
  status: "idle",
  mode: "full",
  synced: 0,
  pages: 0,
  error: null,
  startedAt: null,
  finishedAt: null,
  cursor: null,
  lastCursor: null,
};

function toState(row: any): SyncState {
  if (!row) return DEFAULT;
  return {
    status: row.status,
    mode: row.mode,
    synced: row.synced,
    pages: row.page,
    error: row.error,
    startedAt: row.startedAt ? row.startedAt.toISOString() : null,
    finishedAt: row.completedAt ? row.completedAt.toISOString() : null,
    cursor: row.cursor,
    lastCursor: row.lastCursor,
  };
}

export async function getSyncState(shop: string): Promise<SyncState> {
  return toState(await db.syncJob.findUnique({ where: { shop } }));
}

export async function setSyncState(shop: string, patch: Partial<SyncState>): Promise<void> {
  const data: any = {};
  if (patch.status !== undefined) data.status = patch.status;
  if (patch.mode !== undefined) data.mode = patch.mode;
  if (patch.synced !== undefined) data.synced = patch.synced;
  if (patch.pages !== undefined) data.page = patch.pages;
  if (patch.error !== undefined) data.error = patch.error;
  if (patch.cursor !== undefined) data.cursor = patch.cursor;
  if (patch.lastCursor !== undefined) data.lastCursor = patch.lastCursor;
  if (patch.startedAt !== undefined) data.startedAt = patch.startedAt ? new Date(patch.startedAt) : null;
  if (patch.finishedAt !== undefined) data.completedAt = patch.finishedAt ? new Date(patch.finishedAt) : null;

  await db.syncJob.upsert({ where: { shop }, update: data, create: { shop, ...data } });
}

export async function isSyncing(shop: string): Promise<boolean> {
  const row = await db.syncJob.findUnique({ where: { shop }, select: { status: true } });
  return row?.status === "running";
}

import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData, useRevalidator } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Banner,
  Badge,
  Spinner,
  ProgressBar,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { startSyncInBackground } from "../lib/sync.server";
import { enqueueProductSync } from "../lib/queue.server";
import { getLinkStatus, buildConnectUrl } from "../lib/link.server";
import { getSyncState, isSyncing, setSyncState, type SyncState } from "../lib/syncState.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const { linked, lastSyncedAt } = await getLinkStatus(shop);
  return {
    shop,
    linked,
    lastSyncedAt,
    connectUrl: buildConnectUrl(shop),
    initialState: await getSyncState(shop),
  };
};

// Starts a sync in the BACKGROUND (never blocks the request handler) and returns
// immediately. mode=full forces a full re-sync; otherwise it runs a delta from
// the last sync time.
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  if (await isSyncing(shop)) return { started: false, reason: "already_running" as const };

  const form = await request.formData();
  const forceFull = form.get("mode") === "full";
  const { lastSyncedAt } = await getLinkStatus(shop);
  const since = forceFull ? null : lastSyncedAt;
  const mode = since ? ("delta" as const) : ("full" as const);
  const startedAtIso = new Date().toISOString();

  await setSyncState(shop, {
    status: "running",
    mode,
    synced: 0,
    pages: 0,
    error: null,
    startedAt: startedAtIso,
    finishedAt: null,
    cursor: null,
  });

  // Queue when Redis is available (crash-safe, resumable); else run in-process.
  const queued = await enqueueProductSync({ shop, mode, since });
  if (!queued) startSyncInBackground(admin, shop, { since, mode, startedAtIso });

  return { started: true as const };
};

export default function Index() {
  const { shop, linked, connectUrl, lastSyncedAt, initialState } = useLoaderData<typeof loader>();
  return (
    <Page>
      <TitleBar title="Gazaarabia Marketplace" />
      {linked ? (
        <ConnectedDashboard shop={shop} lastSyncedAt={lastSyncedAt} initialState={initialState} />
      ) : (
        <NotConnected shop={shop} connectUrl={connectUrl} />
      )}
    </Page>
  );
}

// ─── Connected: product sync + live status ──────────────────────
function ConnectedDashboard({
  shop,
  lastSyncedAt,
  initialState,
}: {
  shop: string;
  lastSyncedAt: string | null;
  initialState: SyncState;
}) {
  const start = useFetcher<typeof action>();
  const status = useFetcher<{ state: SyncState }>();
  const revalidator = useRevalidator();

  const state: SyncState = status.data?.state ?? initialState;
  const running = state.status === "running";

  // Poll the status route while a sync is running.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => status.load("/app/sync-status"), 1500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // When a run finishes, refresh the loader once to pick up the new lastSyncedAt.
  const [wasRunning, setWasRunning] = useState(running);
  useEffect(() => {
    if (wasRunning && !running) revalidator.revalidate();
    setWasRunning(running);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const triggerSync = (mode: "delta" | "full") =>
    start.submit({ mode }, { method: "POST" });

  const starting = start.state !== "idle";

  return (
    <Layout>
      <Layout.Section>
        <Banner tone="success" title="Store Ready">
          Your store is connected to Gazaarabia.
        </Banner>
      </Layout.Section>

      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h2" variant="headingMd">Product synchronization</Text>
              <Badge tone="success">Connected</Badge>
            </InlineStack>
            <Text as="p" tone="subdued">{shop}</Text>

            <SyncStatusView state={state} lastSyncedAt={lastSyncedAt} />

            <InlineStack gap="300">
              <Button
                variant="primary"
                loading={starting || running}
                disabled={running}
                onClick={() => triggerSync("delta")}
              >
                {running ? "Synchronizing…" : "Sync products"}
              </Button>
              <Button
                onClick={() => triggerSync("full")}
                loading={starting}
                disabled={running}
              >
                Full re-sync
              </Button>
            </InlineStack>

            {start.data && !start.data.started && start.data.reason === "already_running" && (
              <Text as="span" tone="subdued">A sync is already in progress…</Text>
            )}
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );
}

function SyncStatusView({ state, lastSyncedAt }: { state: SyncState; lastSyncedAt: string | null }) {
  const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "Never");

  if (state.status === "running") {
    return (
      <BlockStack gap="200">
        <InlineStack gap="200" blockAlign="center">
          <Spinner size="small" accessibilityLabel="Synchronizing" />
          <Text as="span">Synchronizing… {state.synced} products ({state.pages} pages)</Text>
        </InlineStack>
        <ProgressBar progress={Math.min(90, state.pages * 5)} size="small" />
      </BlockStack>
    );
  }
  if (state.status === "completed") {
    return state.synced > 0 ? (
      <Banner tone="success">Completed — {state.synced} products synchronized.</Banner>
    ) : (
      <Banner tone="info">No products to sync.</Banner>
    );
  }
  if (state.status === "failed") {
    return (
      <Banner tone="critical" title="Sync failed — retry required">
        {state.error || "Something went wrong."}
      </Banner>
    );
  }
  return (
    <Text as="span" tone="subdued">Last synchronized: {fmt(lastSyncedAt)}</Text>
  );
}

// ─── Not linked: prompt to connect (Milestone 1) ────────────────
function NotConnected({ shop, connectUrl }: { shop: string; connectUrl: string }) {
  const revalidator = useRevalidator();
  const [redirecting, setRedirecting] = useState(false);
  const checking = revalidator.state === "loading";

  return (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h2" variant="headingMd">Connect your store</Text>
              <Badge tone="attention">Not connected</Badge>
            </InlineStack>
            <Text as="p" tone="subdued">{shop}</Text>
            <Text as="p">
              To sell on Gazaarabia, connect this store to your Gazaarabia seller
              account. You'll log in to Gazaarabia and authorise the connection —
              your Shopify credentials are never shared.
            </Text>
            <InlineStack gap="300">
              <Button
                variant="primary"
                url={connectUrl}
                target="_top"
                loading={redirecting}
                onClick={() => setRedirecting(true)}
              >
                {redirecting ? "Redirecting…" : "Connect to Gazaarabia"}
              </Button>
              <Button onClick={() => revalidator.revalidate()} loading={checking} disabled={redirecting}>
                I've connected — refresh
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );
}

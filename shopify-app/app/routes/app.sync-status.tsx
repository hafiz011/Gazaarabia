import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getSyncState } from "../lib/syncState.server";

// Polled by the embedded app to render live sync progress.
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { state: await getSyncState(session.shop) };
};

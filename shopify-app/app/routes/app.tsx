import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const startedAt = Date.now();
  console.log("[DASHBOARD-AUTH][ENTER] authenticate.admin", {
    url: request.url,
    hasAuthorization: Boolean(request.headers.get("authorization")),
  });
  try {
    await authenticate.admin(request);
    console.log("[DASHBOARD-AUTH][EXIT] authenticate.admin", {
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    const responseDetails = error instanceof Response
      ? {
          status: error.status,
          statusText: error.statusText,
          headers: Object.fromEntries(error.headers.entries()),
          body: await error.clone().text().catch(() => "[unreadable]"),
        }
      : undefined;
    console.error("[DASHBOARD-AUTH][ERROR] authenticate.admin", {
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
      response: responseDetails,
    });
    throw error;
  }

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

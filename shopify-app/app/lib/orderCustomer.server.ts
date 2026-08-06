// Customer reuse for orderCreate. Searches Shopify for an existing customer by
// email and returns an OrderCreateCustomerInput.toAssociate reference, so an order
// links to the existing customer instead of creating a duplicate. Returns null
// when no customer exists — orderCreate then creates one naturally from `email`
// (guest checkout keeps working; the email is always preserved by the caller).

import { CUSTOMER_BY_EMAIL_QUERY } from "./queries.server";
import { log } from "./logger.server";

export async function resolveCustomerAssociation(
  admin: any,
  email?: string | null,
): Promise<{ toAssociate: { id: string } } | null> {
  console.log("[ORDER-PUSH-TRACE][ENTER] resolveCustomerAssociation", { email });
  if (!email) {
    console.log("[ORDER-PUSH-TRACE][RETURN] resolveCustomerAssociation: missing_email");
    return null;
  }
  try {
    // Quoted exact-match: unquoted queries token-split on '+' etc. (foo+tag@x.com).
    // Strip embedded quotes so the search syntax cannot be broken by input.
    const safe = String(email).replace(/"/g, "");
    const res = await admin.graphql(CUSTOMER_BY_EMAIL_QUERY, {
      variables: { query: `email:"${safe}"` },
    });
    const json: any = await res.json();
    console.log("[ORDER-PUSH-TRACE][EXIT] admin.graphql(customer_lookup)", {
      email,
      status: res.status,
      response: json,
    });
    const node = json?.data?.customers?.edges?.[0]?.node;
    if (node?.id) {
      log.info("CustomerAssociated", { email, customerId: node.id });
      return { toAssociate: { id: node.id } };
    }
    log.info("CustomerNotFound", { email }); // Shopify will create one from `email`
    return null;
  } catch (e) {
    console.error("[ORDER-PUSH-TRACE][ERROR] admin.graphql(customer_lookup)", {
      email,
      error: (e as Error).message,
      stack: (e as Error).stack,
    });
    // Never block order creation on a customer lookup — fall back to email-only.
    log.warn("CustomerLookupFailed", { email, error: (e as Error).message });
    return null;
  }
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle2, AlertTriangle, Store, ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";

type PreviewState = "available" | "linked_you" | "linked_other" | "no_seller" | "invalid";

type Screen =
  | "checking"
  | "login_required"
  | "confirm" //  available
  | "connecting"
  | "connected"
  | "already_you"
  | "linked_other"
  | "no_seller"
  | "invalid"
  | "failed";

export default function ShopifyConnectPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;

  const [token, setToken] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("checking");
  const [shop, setShop] = useState<string>("");
  const [returnUrl, setReturnUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  //  Grab the signed link token from the URL (client-only, avoids Suspense).
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    setToken(t);
    if (!t) setScreen("invalid");
  }, []);

  //  Not logged in → send to the existing seller login, returning here after.
  useEffect(() => {
    if (status !== "unauthenticated" || !token) return;
    const callbackUrl = `/shopify/connect?token=${encodeURIComponent(token)}`;
    setScreen("login_required");
    window.location.href = `${ROUTES.SELLER.LOGIN}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }, [status, token]);

  //  Logged in → evaluate what to show.
  useEffect(() => {
    if (status !== "authenticated" || !token || !user?.token) return;
    (async () => {
      try {
        setScreen("checking");
        const res = await fetch("/api/integrations/shopify/link/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.shop) setShop(data.shop);
        if (data.returnUrl) setReturnUrl(data.returnUrl);

        const map: Record<PreviewState, Screen> = {
          available: "confirm",
          linked_you: "already_you",
          linked_other: "linked_other",
          no_seller: "no_seller",
          invalid: "invalid",
        };
        setScreen(map[data.state as PreviewState] ?? "invalid");
      } catch {
        setScreen("failed");
        setError("Could not reach Gazaarabia. Please try again.");
      }
    })();
  }, [status, token, user?.token]);

  const connect = useCallback(async () => {
    if (!token || !user?.token) return;
    setScreen("connecting");
    try {
      const res = await fetch("/api/integrations/shopify/link", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setReturnUrl(data.returnUrl || returnUrl);
        setScreen("connected");
        //  Bounce back into the embedded Shopify app.
        setTimeout(() => {
          if (data.returnUrl || returnUrl) window.location.href = data.returnUrl || returnUrl;
        }, 1200);
      } else if (data.state === "linked_other") {
        setScreen("linked_other");
      } else {
        setScreen("failed");
        setError(data.message || "Linking failed. Please try again.");
      }
    } catch {
      setScreen("failed");
      setError("Could not reach Gazaarabia. Please try again.");
    }
  }, [token, user?.token, returnUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center">
            <Store size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Connect your Shopify store</h1>
            <p className="text-xs text-gray-500">Gazaarabia Marketplace</p>
          </div>
        </div>

        {(screen === "checking" || status === "loading") && (
          <State icon="spin" title="Checking connection…" text="One moment while we verify your store." />
        )}

        {screen === "login_required" && (
          <State icon="spin" title="Login required" text="Redirecting you to sign in…" />
        )}

        {screen === "confirm" && (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">
              Connect <span className="font-semibold text-gray-900">{shop}</span> to your Gazaarabia
              seller account? Your products will sync to the marketplace.
            </p>
            <button
              onClick={connect}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] text-white py-3 text-sm font-semibold hover:brightness-110 transition"
            >
              Connect this store <ArrowRight size={16} />
            </button>
            <p className="text-[11px] text-gray-400 text-center">
              You can disconnect at any time from your seller dashboard.
            </p>
          </div>
        )}

        {screen === "connecting" && (
          <State icon="spin" title="Connecting…" text={`Linking ${shop} to your account.`} />
        )}

        {screen === "connected" && (
          <State icon="ok" title="Connected" text="Store ready. Returning you to Shopify…" />
        )}

        {screen === "already_you" && (
          <div className="space-y-5">
            <State icon="ok" title="Already connected" text={`${shop} is linked to your account.`} />
            {returnUrl && (
              <a href={returnUrl} className="block w-full text-center rounded-xl bg-[var(--brand-primary)] text-white py-3 text-sm font-semibold hover:brightness-110 transition">
                Return to Shopify
              </a>
            )}
          </div>
        )}

        {screen === "linked_other" && (
          <State icon="warn" title="Store already linked" text={`${shop} is connected to a different Gazaarabia business. A store can only be linked to one account.`} />
        )}

        {screen === "no_seller" && (
          <div className="space-y-5">
            <State icon="warn" title="Seller account required" text="You need a Gazaarabia seller account to connect a store." />
            <a href={ROUTES.SELLER.REGISTER} className="block w-full text-center rounded-xl bg-[var(--brand-primary)] text-white py-3 text-sm font-semibold hover:brightness-110 transition">
              Create a seller account
            </a>
          </div>
        )}

        {screen === "invalid" && (
          <State icon="warn" title="Invalid or expired link" text="Please reopen the connection from your Shopify app." />
        )}

        {screen === "failed" && (
          <div className="space-y-5">
            <State icon="warn" title="Connection failed" text={error || "Something went wrong."} />
            <button
              onClick={connect}
              className="w-full rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function State({ icon, title, text }: { icon: "spin" | "ok" | "warn"; title: string; text: string }) {
  return (
    <div className="text-center py-4">
      <div className="flex justify-center mb-3">
        {icon === "spin" && <Loader2 className="h-8 w-8 text-[var(--brand-primary)] animate-spin" />}
        {icon === "ok" && <CheckCircle2 className="h-8 w-8 text-green-600" />}
        {icon === "warn" && <AlertTriangle className="h-8 w-8 text-amber-500" />}
      </div>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{text}</p>
    </div>
  );
}

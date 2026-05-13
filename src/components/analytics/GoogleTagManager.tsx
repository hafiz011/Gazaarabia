"use client";

import Script from "next/script";

const GTM_ID = "GTM-TXL7J7K5";

export default function GoogleTagManager() {
    if (!GTM_ID) return null;

    return (
        <>
            {/* Google Tag Manager Script */}
            <Script
                id="google-tag-manager"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({
                'gtm.start': new Date().getTime(),
                event:'gtm.js'
              });

              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer' ? '&l='+l : '';

              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;

              f.parentNode.insertBefore(j,f);

            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
                }}
            />

            {/* Google Tag Manager NoScript */}
            <noscript>
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                    height="0"
                    width="0"
                    style={{
                        display: "none",
                        visibility: "hidden",
                    }}
                />
            </noscript>
        </>
    );
}

/* =========================================================
   Helper Functions for GTM Ecommerce Tracking
========================================================= */

declare global {
    interface Window {
        dataLayer: Record<string, any>[];
    }
}

/**
 * Generic GTM Event Push
 */
export const pushToDataLayer = (data: Record<string, any>) => {
    if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(data);
    }
};

/**
 * View Product
 */
export const trackViewItem = (product: {
    id: number | string;
    name: string;
    category?: string;
    price: number;
    currency?: string;
}) => {
    pushToDataLayer({
        event: "view_item",
        ecommerce: {
            currency: product.currency || "gbp",
            value: product.price,
            items: [
                {
                    item_id: product.id,
                    item_name: product.name,
                    item_category: product.category,
                    price: product.price,
                    quantity: 1,
                },
            ],
        },
    });
};

/**
 * Add To Cart
 */
export const trackAddToCart = (product: {
    id: number | string;
    name: string;
    category?: string;
    price: number;
    quantity?: number;
    currency?: string;
}) => {
    pushToDataLayer({
        event: "add_to_cart",
        ecommerce: {
            currency: product.currency || "gbp",
            value: product.price,
            items: [
                {
                    item_id: product.id,
                    item_name: product.name,
                    item_category: product.category,
                    price: product.price,
                    quantity: product.quantity || 1,
                },
            ],
        },
    });
};

/**
 * Remove From Cart
 */
export const trackRemoveFromCart = (product: {
    id: number | string;
    name: string;
    category?: string;
    price: number;
    quantity?: number;
    currency?: string;
}) => {
    pushToDataLayer({
        event: "remove_from_cart",
        ecommerce: {
            currency: product.currency || "USD",
            value: product.price,
            items: [
                {
                    item_id: product.id,
                    item_name: product.name,
                    item_category: product.category,
                    price: product.price,
                    quantity: product.quantity || 1,
                },
            ],
        },
    });
};

/**
 * Begin Checkout
 */
export const trackBeginCheckout = (
    items: any[],
    total: number,
    currency = "gbp"
) => {
    pushToDataLayer({
        event: "begin_checkout",
        ecommerce: {
            currency,
            value: total,
            items,
        },
    });
};

/**
 * Purchase Event
 */
export const trackPurchase = ({
    orderId,
    total,
    tax = 0,
    shipping = 0,
    currency = "gbp",
    items = [],
}: {
    orderId: string | number;
    total: number;
    tax?: number;
    shipping?: number;
    currency?: string;
    items: any[];
}) => {
    pushToDataLayer({
        event: "purchase",
        ecommerce: {
            transaction_id: orderId,
            value: total,
            tax,
            shipping,
            currency,
            items,
        },
    });
};
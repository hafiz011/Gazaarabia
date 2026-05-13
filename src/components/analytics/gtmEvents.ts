// components/analytics/gtmEvents.ts

"use client";

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
  }
}

/* =========================================================
   Generic Push Function
========================================================= */

export const pushToDataLayer = (data: Record<string, any>) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
  }
};

/* =========================================================
   Page View
========================================================= */

export const trackPageView = (url: string) => {
  pushToDataLayer({
    event: "page_view",
    page: url,
  });
};

/* =========================================================
   View Product
========================================================= */

export const trackViewItem = ({
  id,
  name,
  category,
  price,
  currency = "GBP",
}: {
  id: string | number;
  name: string;
  category?: string;
  price: number;
  currency?: string;
}) => {
  pushToDataLayer({
    event: "view_item",

    ecommerce: {
      currency,
      value: price,

      items: [
        {
          item_id: id,
          item_name: name,
          item_category: category,
          price,
          quantity: 1,
        },
      ],
    },
  });
};

/* =========================================================
   Add To Cart
========================================================= */

export const trackAddToCart = ({
  id,
  name,
  category,
  price,
  quantity = 1,
  currency = "GBP",
}: {
  id: string | number;
  name: string;
  category?: string;
  price: number;
  quantity?: number;
  currency?: string;
}) => {
  pushToDataLayer({
    event: "add_to_cart",

    ecommerce: {
      currency,
      value: price * quantity,

      items: [
        {
          item_id: id,
          item_name: name,
          item_category: category,
          price,
          quantity,
        },
      ],
    },
  });
};

/* =========================================================
   Remove From Cart
========================================================= */

export const trackRemoveFromCart = ({
  id,
  name,
  category,
  price,
  quantity = 1,
  currency = "GBP",
}: {
  id: string | number;
  name: string;
  category?: string;
  price: number;
  quantity?: number;
  currency?: string;
}) => {
  pushToDataLayer({
    event: "remove_from_cart",

    ecommerce: {
      currency,
      value: price * quantity,

      items: [
        {
          item_id: id,
          item_name: name,
          item_category: category,
          price,
          quantity,
        },
      ],
    },
  });
};

/* =========================================================
   Begin Checkout
========================================================= */

export const trackBeginCheckout = ({
  items,
  total,
  currency = "GBP",
}: {
  items: any[];
  total: number;
  currency?: string;
}) => {
  pushToDataLayer({
    event: "begin_checkout",

    ecommerce: {
      currency,
      value: total,
      items,
    },
  });
};

/* =========================================================
   Purchase
========================================================= */

export const trackPurchase = ({
  orderId,
  total,
  tax = 0,
  shipping = 0,
  currency = "GBP",
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
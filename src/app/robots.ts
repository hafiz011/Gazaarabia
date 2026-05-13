// src/app/robots.ts

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",

        disallow: [
          "/admin/",
          "/seller/",
          "/affiliate/",
          "/api/",
          "/cart",
          "/checkout",
          "/account",
          "/orders",
          "/wishlist",
          "/private/",
          "/server/",
        ],
      },
    ],

    sitemap: "https://gazaarabia.com/sitemap.xml",
  };
}
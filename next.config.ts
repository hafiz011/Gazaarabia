import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * SECURITY-HARDENED NEXT.JS CONFIG
 * Compatible with Next.js 13 / 14 (App Router or Pages)
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header

  // Do not expose source maps in production
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // --- Core browser protections ---
          {
            key: "X-Frame-Options",
            value: "DENY", // Prevent clickjacking
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Prevent MIME sniffing
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // --- Permissions / feature abuse control ---
          {
            key: "Permissions-Policy",
            value: [
              "accelerometer=()",
              "camera=()",
              "geolocation=()",
              "gyroscope=()",
              "magnetometer=()",
              "microphone=()",
              "payment=()",
              "usb=()",
            ].join(", "),
          },

          // --- Cross-site isolation (safe default) ---
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },

          // --- XSS mitigation ---
          {
            key: "X-XSS-Protection",
            value: "0", // Disable legacy buggy filter (modern CSP is better)
          },

          // --- Content Security Policy ---
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",

              // Scripts
              "script-src 'self' 'unsafe-inline' https://www.paypal.com https://js.stripe.com https://apple-pay-gateway.apple.com https://pay.google.com",

              // Styles (unsafe-inline allowed for Next.js/React styles)
              "style-src 'self' 'unsafe-inline'",

              // Images
              "img-src 'self' data: https: https://www.paypalobjects.com https://www.paypal.com",

              // Fonts
              "font-src 'self' data:",

              "frame-src https://www.paypal.com https://js.stripe.com https://apple-pay-gateway.apple.com https://pay.google.com",

              // API / backend calls
              "connect-src 'self' https: https://www.paypal.com https://www.paypalobjects.com https://api.stripe.com https://apple-pay-gateway.apple.com https://pay.google.com",

              // Forms
              "form-action 'self'",

              // Media
              "media-src 'self'",

              // Workers
              "worker-src 'self'",

              // Prevent mixed content
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

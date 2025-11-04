import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

const isProduction = process.env.NODE_ENV === "production";

export default withPWA({
  dest: "public",
  disable: !isProduction, // Disable PWA in development mode
  register: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.(?:jpg|jpeg|gif|png|svg|webp|ico|woff|woff2|ttf|eot)$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "static-resources",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      {
        urlPattern: /^https?:\/\/.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "network-first",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
})(nextConfig);

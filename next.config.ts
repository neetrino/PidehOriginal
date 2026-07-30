import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Google Maps JS loads from maps.googleapis.com / maps.gstatic.com
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https:",
      "worker-src 'self' blob:",
      "frame-src 'self' https://www.google.com https://maps.google.com https://maps.googleapis.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

function buildImageRemotePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  // `remotePatterns` is evaluated at build time. Always allow R2 public hosts so
  // Vercel builds work even when R2_PUBLIC_BASE_URL is only set at runtime.
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    {
      protocol: "https",
      hostname: "images.pexels.com",
    },
    {
      protocol: "https",
      hostname: "**.r2.dev",
      pathname: "/**",
    },
  ];

  const r2Base =
    process.env.R2_PUBLIC_BASE_URL || process.env.R2_PUBLIC_URL;
  if (r2Base) {
    try {
      const url = new URL(r2Base);
      if (url.protocol === "https:" || url.protocol === "http:") {
        patterns.push({
          protocol: url.protocol.replace(":", "") as "http" | "https",
          hostname: url.hostname,
          pathname: "/**",
        });
      }
    } catch {
      // Invalid R2 public base — wildcard *.r2.dev still covers default public URLs.
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  // Product/category/hero drawers upload images via Server Actions (up to 5MB each).
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  images: {
    remotePatterns: buildImageRemotePatterns(),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

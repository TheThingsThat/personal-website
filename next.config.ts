import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /* One stylesheet (~3.5KB gz) inlined into the static HTML: first paint
       no longer waits on a CSS round trip. */
    inlineCss: true,
  },
};

export default nextConfig;

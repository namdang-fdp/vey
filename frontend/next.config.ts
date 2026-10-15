import type { NextConfig } from "next";
const config: NextConfig = {
  turbopack: { root: process.cwd() },
  devIndicators: { position: "top-right" },
};
export default config;

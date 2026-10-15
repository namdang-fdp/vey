import type { NextConfig } from "next";
const config: NextConfig = {
  output: "standalone",
  turbopack: { root: process.cwd() },
  devIndicators: { position: "top-right" },
};
export default config;

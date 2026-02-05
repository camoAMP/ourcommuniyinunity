import fs from "node:fs";
import path from "node:path";

const loadDevVars = () => {
  if (process.env.NODE_ENV !== "development") return;
  const devVarsPath = path.join(process.cwd(), ".dev.vars");
  if (!fs.existsSync(devVarsPath)) return;

  const content = fs.readFileSync(devVarsPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const rawValue = trimmed.slice(eqIndex + 1).trim();
    const value = rawValue.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = value;
  }
};

if (process.env.NODE_ENV === "development") {
  loadDevVars();
  const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

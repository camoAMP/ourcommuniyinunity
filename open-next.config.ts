import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

const baseConfig = defineCloudflareConfig();

export default {
  ...baseConfig,
  buildCommand: "next build",
};

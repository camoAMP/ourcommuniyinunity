import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      ".cache/**",
      ".open-next/**",
      ".next/**",
      ".pnpm-store/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      ".wrangler/**",
      // Archived sub-project; not part of the Next.js app and doesn't follow our lint rules.
      "app/Kimi_Agent_News Video Generation System/**",
    ],
  },
  ...coreWebVitals,
  ...typescript,
];

export default config;

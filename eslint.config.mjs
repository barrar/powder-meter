process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA = "true";
process.env.BROWSERSLIST_IGNORE_OLD_DATA = "true";

import nextConfig from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: ["**/node_modules/**"],
  },
  ...nextConfig,
];

export default config;

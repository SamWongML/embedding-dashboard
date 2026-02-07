import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/components/dashboard/sidebar",
              message: "Use '@/components/ui/sidebar' primitives with '@/components/dashboard/sidebar/app-sidebar'.",
            },
            {
              name: "@/components/dashboard/header",
              message: "Import directly from concrete files or remove dead header artifacts.",
            },
            {
              name: "@/components/account",
              message: "Import concrete files (e.g. '@/components/account/account-provider').",
            },
            {
              name: "@/components/charts",
              message: "Import chart components directly to avoid barrel imports.",
            },
            {
              name: "@/components/dashboard/panels/metrics",
              message: "Import from concrete panel files (e.g. metrics/metrics-panel).",
            },
            {
              name: "@/components/dashboard/panels/records",
              message: "Import from concrete panel files (e.g. records/records-panel).",
            },
            {
              name: "@/components/dashboard/panels/search",
              message: "Import from concrete panel files (e.g. search/search-panel).",
            },
            {
              name: "@/components/dashboard/panels/text-embedding",
              message: "Import from concrete panel files (e.g. text-embedding/text-embedding-panel).",
            },
            {
              name: "@/components/dashboard/panels/image-embedding",
              message: "Import from concrete panel files (e.g. image-embedding/image-embedding-panel).",
            },
            {
              name: "@/components/dashboard/panels/users",
              message: "Import from concrete panel files (e.g. users/users-panel).",
            },
            {
              name: "@/components/dashboard/panels/server-status",
              message: "Import from concrete panel files (e.g. server-status/server-status-panel).",
            },
            {
              name: "@/components/dashboard/panels/graph",
              message: "Import from concrete panel files (e.g. graph/graph-panel).",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

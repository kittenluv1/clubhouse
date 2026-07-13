import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    // Build output, deps, and coverage artifacts should never be linted.
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // This UI intentionally uses <img> for local SVG icons. next/image adds
      // required-dimension/SVG-handling complexity with negligible LCP benefit
      // for these small static assets, so the rule is disabled project-wide.
      // Accessibility is still enforced via jsx-a11y/alt-text.
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;

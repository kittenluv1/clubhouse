import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
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

export default config;

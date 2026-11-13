import { PostHog } from "posthog-node";

/** @type {PostHog | null} */
let posthogClient = null;

/** Server-side PostHog client, or null outside production or without a token. */
export function getPostHogClient() {
  const token = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;
  if (process.env.NODE_ENV !== "production" || !token) return null;
  if (!posthogClient) {
    posthogClient = new PostHog(token, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
}

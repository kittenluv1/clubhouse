import { PostHog } from "posthog-node";

let posthogClient = null;

export function getPostHogClient() {
  if (process.env.NODE_ENV !== "production") return null;
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_TOKEN, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
}
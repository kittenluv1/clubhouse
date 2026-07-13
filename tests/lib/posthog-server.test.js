/**
 * @jest-environment node
 */

// PostHog is mocked so we never open a real client.
const mockCapture = jest.fn();
jest.mock("posthog-node", () => ({
  PostHog: jest.fn().mockImplementation(() => ({ capture: mockCapture })),
}));

describe("getPostHogClient", () => {
  const OLD_ENV = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = OLD_ENV;
    jest.resetModules();
  });

  it("returns null outside of production", () => {
    process.env.NODE_ENV = "test";
    jest.isolateModules(() => {
      const { getPostHogClient } = require("@/app/lib/posthog-server");
      expect(getPostHogClient()).toBeNull();
    });
  });

  it("returns a singleton client in production", () => {
    process.env.NODE_ENV = "production";
    jest.isolateModules(() => {
      const { getPostHogClient } = require("@/app/lib/posthog-server");
      const a = getPostHogClient();
      const b = getPostHogClient();
      expect(a).not.toBeNull();
      expect(a).toBe(b); // cached singleton
    });
  });
});

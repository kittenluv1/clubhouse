import { timingSafeEqual } from "node:crypto";

/**
 * Vercel cron jobs send `Authorization: Bearer $CRON_SECRET` when the
 * CRON_SECRET environment variable is set. Check it in constant time.
 * @param {Request} req
 * @param {string} secret
 * @returns {boolean}
 */
export function hasCronSecret(req, secret) {
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(req.headers.get("authorization") ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

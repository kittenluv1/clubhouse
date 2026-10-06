// Shared plumbing for API route handlers: authentication, admin checks,
// request parsing and error responses. Handlers throw HttpError for expected
// failures; anything else is logged and returned as a generic 500 so database
// and library error details never reach the client.

import { createAuthenticatedClient } from "@/app/lib/server-db";
import { HttpError } from "@/app/lib/server/errors";

export { HttpError };

/**
 * @param {number} status
 * @param {string} message
 */
export function jsonError(status, message) {
  return Response.json({ error: message }, { status });
}

/** @param {{ email?: string } | null | undefined} user */
export function isAdmin(user) {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  return Boolean(adminEmail && user?.email === adminEmail);
}

/**
 * Parse a JSON request body, turning malformed input into a 400.
 * @param {Request} req
 */
export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}

/**
 * @typedef {{ id: string, email?: string }} SessionUser
 * @typedef {{ user: SessionUser, supabase: any, params: Record<string, string> }} RouteContext
 * @typedef {(req: import("next/server").NextRequest, ctx: RouteContext) => Promise<Response>} AuthedHandler
 */

/**
 * Wrap a route handler so it only runs for a signed-in user.
 * @param {AuthedHandler} handler
 * @param {{ admin?: boolean }} [options]
 */
export function withUser(handler, { admin = false } = {}) {
  return async (req, context) => {
    try {
      const supabase = await createAuthenticatedClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return jsonError(401, "Unauthorized");
      if (admin && !isAdmin(user)) return jsonError(403, "Forbidden");

      const params = context?.params ? await context.params : {};
      return await handler(req, { user, supabase, params });
    } catch (err) {
      return errorResponse(req, err);
    }
  };
}

/** @param {AuthedHandler} handler */
export function withAdmin(handler) {
  return withUser(handler, { admin: true });
}

/**
 * @param {Request | undefined} req
 * @param {unknown} err
 */
export function errorResponse(req, err) {
  if (err instanceof HttpError) return jsonError(err.status, err.message);
  console.error(
    `Unhandled error in ${req?.method ?? "?"} ${req?.url ?? ""}:`,
    err,
  );
  return jsonError(500, "Internal server error");
}

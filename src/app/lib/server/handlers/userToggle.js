// POST (turn on) and DELETE (turn off) handlers shared by /api/clubLikes,
// /api/clubSaves and /api/reviewLikes. Both take { [target]: id } as the body.

import { z } from "zod";
import { getPostHogClient } from "@/app/lib/posthog-server";
import { createUserToggleRepository } from "@/app/lib/server/repositories/userToggles";
import { HttpError, readJson, withUser } from "@/app/lib/server/route";

// Club ids are numeric for regular clubs and strings for club sports.
const targetId = z.union([
  z.number().int().positive(),
  z.string().trim().min(1).max(64),
]);

/**
 * @param {object} options
 * @param {import("@/app/lib/server/repositories/userToggles").UserToggle} options.toggle
 * @param {string} options.resultKey key for the created row in the POST response
 * @param {{ on: string, off: string }} options.events PostHog event names
 * @param {{ on: string, already: string, off: string }} options.messages
 */
export function userToggleHandlers({ toggle, resultKey, events, messages }) {
  async function readTarget(req) {
    const body = await readJson(req);
    const value = body?.[toggle.target];
    if (value === undefined || value === null || value === "") {
      throw new HttpError(400, `Missing ${toggle.target} in request body`);
    }
    const parsed = targetId.safeParse(value);
    if (!parsed.success) throw new HttpError(400, `Invalid ${toggle.target}`);
    return parsed.data;
  }

  function track(userId, event, id) {
    getPostHogClient()?.capture({
      distinctId: userId,
      event,
      properties: { [toggle.target]: id },
    });
  }

  return {
    POST: withUser(async (req, { supabase, user }) => {
      const id = await readTarget(req);
      const { created, row } = await createUserToggleRepository(
        supabase,
        toggle,
      ).add(user.id, id);
      if (!created) return Response.json({ message: messages.already });

      track(user.id, events.on, id);
      return Response.json(
        { message: messages.on, [resultKey]: row },
        { status: 201 },
      );
    }),

    DELETE: withUser(async (req, { supabase, user }) => {
      const id = await readTarget(req);
      await createUserToggleRepository(supabase, toggle).remove(user.id, id);

      track(user.id, events.off, id);
      return Response.json({ message: messages.off });
    }),
  };
}

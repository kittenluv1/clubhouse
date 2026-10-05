import { userToggleHandlers } from "@/app/lib/server/handlers/userToggle";
import { USER_TOGGLES } from "@/app/lib/server/repositories/userToggles";

const handlers = userToggleHandlers({
  toggle: USER_TOGGLES.clubLike,
  resultKey: "like",
  events: { on: "club_liked", off: "club_unliked" },
  messages: { on: "Like added", already: "Already liked", off: "Like removed" },
});

export const POST = handlers.POST;
export const DELETE = handlers.DELETE;

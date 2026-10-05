import { userToggleHandlers } from "@/app/lib/server/handlers/userToggle";
import { USER_TOGGLES } from "@/app/lib/server/repositories/userToggles";

const handlers = userToggleHandlers({
  toggle: USER_TOGGLES.clubSave,
  resultKey: "save",
  events: { on: "club_saved", off: "club_unsaved" },
  messages: { on: "Club saved", already: "Already saved", off: "Save removed" },
});

export const POST = handlers.POST;
export const DELETE = handlers.DELETE;

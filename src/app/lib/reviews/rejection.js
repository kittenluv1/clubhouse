// Shared by the admin page and /api/pendingReviews, which only accepts these.
export const PRESET_REJECTION_REASONS = [
  "The review is too brief, vague, or off-topic",
  "The review names specific individuals or has discriminatory/harassing/hateful language.",
  "The review content is not relevant to the club or organization being reviewed",
];

export const MAX_REJECTION_MESSAGE_LENGTH = 1000;

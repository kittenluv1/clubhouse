// Messages the review routes send to the client.
export const REVIEW_MESSAGES = Object.freeze({
  notFound: "Review not found",
  changed: "Review changed; reload and try again",
  notPending: "Review is no longer pending",
  invalidModeration: "Invalid request: issue with id or approve boolean",
  approved: "Review approved",
  rejected: "Review rejected",
  resubmitted: "Review resubmitted for approval",
  deleted: "Review deleted",
});

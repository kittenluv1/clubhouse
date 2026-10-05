// Postgres `timestamp` columns come back without a zone; they are UTC.
const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;

/** @param {string} timestamp */
function parseUtc(timestamp) {
  return new Date(HAS_ZONE.test(timestamp) ? timestamp : `${timestamp}Z`);
}

/**
 * Number of rejected reviews updated since the user last looked at them.
 * @param {Array<{ updated_at: string | null }>} rejectedReviews
 * @param {string | null | undefined} lastViewedAt
 */
export function countUnreadRejected(rejectedReviews, lastViewedAt) {
  if (!lastViewedAt) return rejectedReviews.length;
  const lastViewed = parseUtc(lastViewedAt);
  return rejectedReviews.filter(
    (review) => !review.updated_at || parseUtc(review.updated_at) > lastViewed,
  ).length;
}

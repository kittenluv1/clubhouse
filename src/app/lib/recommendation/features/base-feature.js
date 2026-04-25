/**
 * Abstract base class for recommendation features.
 * Each feature computes a score between 0.0 and 1.0 for a user-club pair.
 */
export class BaseFeature {
  get name() {
    throw new Error('Feature must implement get name()');
  }

  /**
   * @param {Object} user - User profile data
   * @param {Object} club - Club data
   * @param {Object} context - Additional context (e.g. likedCategories)
   * @returns {number} Score between 0.0 and 1.0
   */
  compute(user, club, context) {
    throw new Error('Feature must implement compute(user, club, context)');
  }
}

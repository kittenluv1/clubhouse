import { BaseFeature } from './base-feature';

/**
 * Scores based on overlap between categories of the user's liked clubs
 * and the candidate club's categories.
 */
export class LikeHistory extends BaseFeature {
  get name() {
    return 'like_history';
  }

  compute(user, club, context) {
    const likedCategories = (context?.likedCategories || []).map(c => c.toLowerCase().trim()).filter(Boolean);
    if (likedCategories.length === 0) return 0.0;

    const clubCategories = [
      club.Category1Name,
      club.Category2Name,
    ].filter(Boolean).map(c => c.toLowerCase().trim());

    if (clubCategories.length === 0) return 0.0;

    const likedSet = new Set(likedCategories);
    let matches = 0;
    for (const cat of clubCategories) {
      if (likedSet.has(cat)) {
        matches++;
      }
    }

    return matches / clubCategories.length;
  }
}

import { BaseFeature } from './base-feature';

/**
 * Scores based on overlap between categories of the user's saved clubs
 * and the candidate club's categories.
 */
export class SaveHistory extends BaseFeature {
  get name() {
    return 'save_history';
  }

  compute(user, club, context) {
    const savedCategories = (context?.savedCategories || []).map(c => c.toLowerCase().trim()).filter(Boolean);
    if (savedCategories.length === 0) return 0.0;

    const clubCategories = [
      club.Category1Name,
      club.Category2Name,
    ].filter(Boolean).map(c => c.toLowerCase().trim());

    if (clubCategories.length === 0) return 0.0;

    const savedSet = new Set(savedCategories);
    let matches = 0;
    for (const cat of clubCategories) {
      if (savedSet.has(cat)) {
        matches++;
      }
    }

    return matches / clubCategories.length;
  }
}

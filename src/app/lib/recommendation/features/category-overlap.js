import { BaseFeature } from './base-feature';

/**
 * Overlap ratio between user's preferred categories and club categories.
 * Score = matching categories / club categories count
 */
export class CategoryOverlap extends BaseFeature {
  get name() {
    return 'category_overlap';
  }

  compute(user, club, context) {
    const userCategories = (user.categories || []).map(c => c.toLowerCase().trim()).filter(Boolean);
    if (userCategories.length === 0) return 0.0;

    const clubCategories = [
      club.Category1Name,
      club.Category2Name,
    ].filter(Boolean).map(c => c.toLowerCase().trim());

    if (clubCategories.length === 0) return 0.0;

    let matches = 0;
    for (const clubCat of clubCategories) {
      if (userCategories.some(uc => uc === clubCat)) {
        matches++;
      }
    }

    return matches / clubCategories.length;
  }
}

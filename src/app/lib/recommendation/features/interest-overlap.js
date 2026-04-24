import { BaseFeature } from './base-feature';

/**
 * Jaccard similarity between user interests and club categories.
 * Score = |intersection| / |union|
 */
export class InterestOverlap extends BaseFeature {
  get name() {
    return 'interest_overlap';
  }

  compute(user, club, context) {
    const interests = (user.interests || []).map(i => i.toLowerCase().trim()).filter(Boolean);
    if (interests.length === 0) return 0.0;

    const clubCategories = [
      club.Category1Name,
      club.Category2Name,
    ].filter(Boolean).map(c => c.toLowerCase().trim());

    if (clubCategories.length === 0) return 0.0;

    const interestSet = new Set(interests);
    const categorySet = new Set(clubCategories);

    let intersectionSize = 0;
    for (const cat of categorySet) {
      for (const interest of interestSet) {
        if (cat.includes(interest) || interest.includes(cat)) {
          intersectionSize++;
          break;
        }
      }
    }

    const unionSize = interestSet.size + categorySet.size - intersectionSize;
    return unionSize === 0 ? 0.0 : intersectionSize / unionSize;
  }
}

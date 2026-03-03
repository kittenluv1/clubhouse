import { BaseFeature } from './base-feature';

/**
 * Scores based on overlap between categories of clubs the user is already
 * a member of and the candidate club's categories. This is the strongest
 * signal — if you're in similar clubs, you'll likely want this one too.
 */
export class MembershipSimilarity extends BaseFeature {
  get name() {
    return 'membership_similarity';
  }

  compute(user, club, context) {
    const memberCategories = (context?.memberCategories || []).map(c => c.toLowerCase().trim()).filter(Boolean);
    if (memberCategories.length === 0) return 0.0;

    const clubCategories = [
      club.Category1Name,
      club.Category2Name,
    ].filter(Boolean).map(c => c.toLowerCase().trim());

    if (clubCategories.length === 0) return 0.0;

    const memberSet = new Set(memberCategories);
    let matches = 0;
    for (const cat of clubCategories) {
      if (memberSet.has(cat)) {
        matches++;
      }
    }

    return matches / clubCategories.length;
  }
}

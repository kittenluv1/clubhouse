import { BaseFeature } from './base-feature';

/**
 * Scores 1.0 if the user's minor matches the club's category or appears in its description.
 */
export class MinorMatch extends BaseFeature {
  get name() {
    return 'minor_match';
  }

  compute(user, club, context) {
    const minors = (user.minors || []).map(m => m.toLowerCase().trim()).filter(Boolean);
    if (minors.length === 0) return 0.0;

    const categories = [
      club.Category1Name,
      club.Category2Name,
    ].filter(Boolean).map(c => c.toLowerCase());

    const description = (club.OrganizationDescription || '').toLowerCase();

    let bestScore = 0.0;
    for (const minor of minors) {
      if (categories.some(cat => cat.includes(minor) || minor.includes(cat))) {
        return 1.0;
      }
      if (description.includes(minor)) {
        bestScore = Math.max(bestScore, 0.5);
      }
    }
    return bestScore;
  }
}

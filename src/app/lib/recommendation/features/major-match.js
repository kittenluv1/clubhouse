import { BaseFeature } from './base-feature';

/**
 * Scores 1.0 if the user's major matches the club's category or appears in its description.
 */
export class MajorMatch extends BaseFeature {
  get name() {
    return 'major_match';
  }

  compute(user, club, context) {
    const majors = (user.majors || []).map(m => m.toLowerCase().trim()).filter(Boolean);
    if (majors.length === 0) return 0.0;

    const categories = [
      club.Category1Name,
      club.Category2Name,
    ].filter(Boolean).map(c => c.toLowerCase());

    const description = (club.OrganizationDescription || '').toLowerCase();

    let bestScore = 0.0;
    for (const major of majors) {
      if (categories.some(cat => cat.includes(major) || major.includes(cat))) {
        return 1.0;
      }
      if (description.includes(major)) {
        bestScore = Math.max(bestScore, 0.5);
      }
    }
    return bestScore;
  }
}

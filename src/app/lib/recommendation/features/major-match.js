import { BaseFeature } from './base-feature';

/**
 * Scores 1.0 if the user's major matches the club's category or appears in its description.
 */
export class MajorMatch extends BaseFeature {
  get name() {
    return 'major_match';
  }

  compute(user, club, context) {
    const major = user.major?.toLowerCase()?.trim();
    if (!major) return 0.0;

    const categories = [
      club.Category1Name,
      club.Category2Name,
    ].filter(Boolean).map(c => c.toLowerCase());

    if (categories.some(cat => cat.includes(major) || major.includes(cat))) {
      return 1.0;
    }

    const description = (club.OrganizationDescription || '').toLowerCase();
    if (description.includes(major)) {
      return 0.5;
    }

    return 0.0;
  }
}

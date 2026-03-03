import { BaseFeature } from './base-feature';

/**
 * Scores 1.0 if the user's minor matches the club's category or appears in its description.
 */
export class MinorMatch extends BaseFeature {
  get name() {
    return 'minor_match';
  }

  compute(user, club, context) {
    const minor = user.minor?.toLowerCase()?.trim();
    if (!minor) return 0.0;

    const categories = [
      club.Category1Name,
      club.Category2Name,
    ].filter(Boolean).map(c => c.toLowerCase());

    if (categories.some(cat => cat.includes(minor) || minor.includes(cat))) {
      return 1.0;
    }

    const description = (club.OrganizationDescription || '').toLowerCase();
    if (description.includes(minor)) {
      return 0.5;
    }

    return 0.0;
  }
}

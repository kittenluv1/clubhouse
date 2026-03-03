import { ScoringEngine } from './scoring-engine';
import { WeightRegistry } from './weight-registry';
import { createDefaultFeatures } from './features';

/**
 * Orchestrator that wires features, weights, and scoring engine.
 * Accepts user + clubs, returns ranked results.
 */
export class RecommendationService {
  /**
   * @param {Object} [options]
   * @param {Object} [options.weights] - Custom weight overrides
   * @param {import('./features/base-feature').BaseFeature[]} [options.features] - Custom features
   */
  constructor(options = {}) {
    const features = options.features || createDefaultFeatures();
    const weightRegistry = new WeightRegistry(options.weights);
    this.engine = new ScoringEngine(features, weightRegistry);
  }

  /**
   * Rank clubs for a user, returning sorted results with scores.
   * @param {Object} user - User profile
   * @param {Object[]} clubs - Candidate clubs
   * @param {Object} [context] - Additional context (e.g. likedCategories)
   * @returns {{ club: Object, score: number, breakdown: Object }[]}
   */
  rankClubs(user, clubs, context = {}) {
    const scored = clubs.map(club => {
      const { score, breakdown } = this.engine.score(user, club, context);
      return { club, score, breakdown };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Stable sort on ties: alphabetical by OrganizationName
      const nameA = a.club.OrganizationName || '';
      const nameB = b.club.OrganizationName || '';
      return nameA.localeCompare(nameB);
    });

    return scored;
  }
}

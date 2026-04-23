/**
 * Computes a weighted score for a user-club pair using registered features.
 */
export class ScoringEngine {
  /**
   * @param {import('./features/base-feature').BaseFeature[]} features
   * @param {import('./weight-registry').WeightRegistry} weightRegistry
   */
  constructor(features, weightRegistry) {
    this.features = features;
    this.weightRegistry = weightRegistry;
  }

  /**
   * Score a single club for a user.
   * @returns {{ score: number, breakdown: Object.<string, number> }}
   */
  score(user, club, context = {}) {
    let totalScore = 0;
    const breakdown = {};

    for (const feature of this.features) {
      const rawScore = feature.compute(user, club, context);
      const weight = this.weightRegistry.getWeight(feature.name);
      const weightedScore = rawScore * weight;

      breakdown[feature.name] = rawScore;
      totalScore += weightedScore;
    }

    return {
      score: Math.round(totalScore * 1000) / 1000,
      breakdown,
    };
  }
}

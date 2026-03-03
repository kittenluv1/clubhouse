const DEFAULT_WEIGHTS = {
  membership_similarity: 0.28,
  major_match: 0.20,
  interest_overlap: 0.16,
  category_overlap: 0.13,
  minor_match: 0.09,
  like_history: 0.08,
  save_history: 0.06,
};

/**
 * Registry mapping feature names to their weights.
 * Weights are mutable at runtime and injectable via constructor.
 */
export class WeightRegistry {
  constructor(weights = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
  }

  getWeight(featureName) {
    return this.weights[featureName] ?? 0;
  }

  setWeight(featureName, weight) {
    this.weights[featureName] = weight;
  }

  getAllWeights() {
    return { ...this.weights };
  }
}

export { DEFAULT_WEIGHTS };

import { WeightRegistry, DEFAULT_WEIGHTS } from '../weight-registry';

describe('WeightRegistry', () => {
  it('uses default weights when none provided', () => {
    const registry = new WeightRegistry();
    expect(registry.getWeight('membership_similarity')).toBe(0.28);
    expect(registry.getWeight('major_match')).toBe(0.20);
    expect(registry.getWeight('interest_overlap')).toBe(0.16);
    expect(registry.getWeight('category_overlap')).toBe(0.13);
    expect(registry.getWeight('minor_match')).toBe(0.09);
    expect(registry.getWeight('like_history')).toBe(0.08);
    expect(registry.getWeight('save_history')).toBe(0.06);
  });

  it('weights membership_similarity highest', () => {
    const registry = new WeightRegistry();
    const all = registry.getAllWeights();
    const maxWeight = Math.max(...Object.values(all));
    expect(registry.getWeight('membership_similarity')).toBe(maxWeight);
  });

  it('weights like_history more than save_history', () => {
    const registry = new WeightRegistry();
    expect(registry.getWeight('like_history')).toBeGreaterThan(registry.getWeight('save_history'));
  });

  it('allows custom weight overrides', () => {
    const registry = new WeightRegistry({ major_match: 0.5 });
    expect(registry.getWeight('major_match')).toBe(0.5);
    // Others remain default
    expect(registry.getWeight('minor_match')).toBe(0.09);
  });

  it('returns 0 for unknown features', () => {
    const registry = new WeightRegistry();
    expect(registry.getWeight('nonexistent')).toBe(0);
  });

  it('allows runtime weight mutation', () => {
    const registry = new WeightRegistry();
    registry.setWeight('major_match', 0.99);
    expect(registry.getWeight('major_match')).toBe(0.99);
  });

  it('default weights sum to 1.0', () => {
    const sum = Object.values(DEFAULT_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0);
  });
});

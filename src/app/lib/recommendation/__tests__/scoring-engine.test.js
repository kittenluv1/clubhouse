import { ScoringEngine } from '../scoring-engine';
import { WeightRegistry } from '../weight-registry';

class StubFeature {
  constructor(name, value) {
    this._name = name;
    this._value = value;
  }
  get name() { return this._name; }
  compute() { return this._value; }
}

describe('ScoringEngine', () => {
  it('computes weighted score from features', () => {
    const features = [
      new StubFeature('a', 1.0),
      new StubFeature('b', 0.5),
    ];
    const registry = new WeightRegistry({ a: 0.6, b: 0.4 });
    const engine = new ScoringEngine(features, registry);

    const result = engine.score({}, {}, {});
    // 1.0*0.6 + 0.5*0.4 = 0.8
    expect(result.score).toBe(0.8);
    expect(result.breakdown).toEqual({ a: 1.0, b: 0.5 });
  });

  it('returns 0 when all features score 0', () => {
    const features = [
      new StubFeature('a', 0.0),
      new StubFeature('b', 0.0),
    ];
    const registry = new WeightRegistry({ a: 0.5, b: 0.5 });
    const engine = new ScoringEngine(features, registry);

    const result = engine.score({}, {}, {});
    expect(result.score).toBe(0);
  });

  it('handles unknown feature weights as 0', () => {
    const features = [new StubFeature('unknown', 1.0)];
    const registry = new WeightRegistry({});
    const engine = new ScoringEngine(features, registry);

    const result = engine.score({}, {}, {});
    expect(result.score).toBe(0);
  });
});

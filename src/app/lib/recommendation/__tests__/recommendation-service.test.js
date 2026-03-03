import { RecommendationService } from '../recommendation-service';

const makeClub = (id, name, cat1, cat2 = null) => ({
  OrganizationID: id,
  OrganizationName: name,
  Category1Name: cat1,
  Category2Name: cat2,
  OrganizationDescription: '',
});

describe('RecommendationService', () => {
  it('ranks clubs by score descending', () => {
    const user = {
      major: 'Computer Science',
      minor: null,
      interests: ['Technology'],
      categories: ['Computer Science'],
    };
    const clubs = [
      makeClub(1, 'Art Club', 'Art', 'Design'),
      makeClub(2, 'CS Club', 'Computer Science', 'Technology'),
      makeClub(3, 'Music Club', 'Music'),
    ];

    const service = new RecommendationService();
    const results = service.rankClubs(user, clubs, {});

    expect(results[0].club.OrganizationName).toBe('CS Club');
    expect(results[0].score).toBeGreaterThan(0);
    expect(results.length).toBe(3);
  });

  it('returns all clubs even with empty profile', () => {
    const user = {};
    const clubs = [
      makeClub(1, 'Alpha Club', 'Sports'),
      makeClub(2, 'Beta Club', 'Music'),
    ];

    const service = new RecommendationService();
    const results = service.rankClubs(user, clubs, {});

    expect(results.length).toBe(2);
    // All scores should be 0 with empty profile
    results.forEach(r => expect(r.score).toBe(0));
  });

  it('sorts alphabetically on tie scores', () => {
    const user = {};
    const clubs = [
      makeClub(1, 'Zebra Club', 'Sports'),
      makeClub(2, 'Alpha Club', 'Sports'),
    ];

    const service = new RecommendationService();
    const results = service.rankClubs(user, clubs, {});

    // Both score 0, so alphabetical
    expect(results[0].club.OrganizationName).toBe('Alpha Club');
    expect(results[1].club.OrganizationName).toBe('Zebra Club');
  });

  it('includes breakdown in results', () => {
    const user = { major: 'Sports' };
    const clubs = [makeClub(1, 'Sports Club', 'Sports')];

    const service = new RecommendationService();
    const results = service.rankClubs(user, clubs, {});

    expect(results[0].breakdown).toBeDefined();
    expect(results[0].breakdown.major_match).toBe(1.0);
  });

  it('accepts custom weights', () => {
    const user = { major: 'Sports' };
    const clubs = [makeClub(1, 'Sports Club', 'Sports')];

    const defaultService = new RecommendationService();
    const customService = new RecommendationService({ weights: { major_match: 1.0 } });

    const defaultResults = defaultService.rankClubs(user, clubs, {});
    const customResults = customService.rankClubs(user, clubs, {});

    expect(customResults[0].score).toBeGreaterThan(defaultResults[0].score);
  });

  it('uses like history context', () => {
    const user = {};
    const clubs = [
      makeClub(1, 'Sports Club', 'Sports'),
      makeClub(2, 'Music Club', 'Music'),
    ];
    const context = { likedCategories: ['Sports'] };

    const service = new RecommendationService();
    const results = service.rankClubs(user, clubs, context);

    expect(results[0].club.OrganizationName).toBe('Sports Club');
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });
});

import { MajorMatch } from '../features/major-match';
import { MinorMatch } from '../features/minor-match';
import { InterestOverlap } from '../features/interest-overlap';
import { CategoryOverlap } from '../features/category-overlap';
import { LikeHistory } from '../features/like-history';
import { SaveHistory } from '../features/save-history';
import { MembershipSimilarity } from '../features/membership-similarity';
import { BaseFeature } from '../features/base-feature';

const makeClub = (cat1, cat2, description = '') => ({
  OrganizationID: 1,
  OrganizationName: 'Test Club',
  Category1Name: cat1,
  Category2Name: cat2,
  OrganizationDescription: description,
});

describe('BaseFeature', () => {
  it('throws on get name()', () => {
    const f = new BaseFeature();
    expect(() => f.name).toThrow('Feature must implement get name()');
  });

  it('throws on compute()', () => {
    const f = new BaseFeature();
    expect(() => f.compute({}, {}, {})).toThrow('Feature must implement compute');
  });
});

describe('MajorMatch', () => {
  const feature = new MajorMatch();

  it('has correct name', () => {
    expect(feature.name).toBe('major_match');
  });

  it('returns 1.0 when major matches category', () => {
    const user = { major: 'Computer Science' };
    const club = makeClub('Computer Science', null);
    expect(feature.compute(user, club, {})).toBe(1.0);
  });

  it('returns 0.5 when major matches description only', () => {
    const user = { major: 'biology' };
    const club = makeClub('Science', null, 'A club for biology enthusiasts');
    expect(feature.compute(user, club, {})).toBe(0.5);
  });

  it('returns 0.0 when no match', () => {
    const user = { major: 'History' };
    const club = makeClub('Computer Science', 'Engineering');
    expect(feature.compute(user, club, {})).toBe(0.0);
  });

  it('returns 0.0 when user has no major', () => {
    expect(feature.compute({}, makeClub('CS', null), {})).toBe(0.0);
    expect(feature.compute({ major: '' }, makeClub('CS', null), {})).toBe(0.0);
  });

  it('is case insensitive', () => {
    const user = { major: 'computer science' };
    const club = makeClub('Computer Science', null);
    expect(feature.compute(user, club, {})).toBe(1.0);
  });
});

describe('MinorMatch', () => {
  const feature = new MinorMatch();

  it('has correct name', () => {
    expect(feature.name).toBe('minor_match');
  });

  it('returns 1.0 when minor matches category', () => {
    const user = { minor: 'Mathematics' };
    const club = makeClub('Mathematics', null);
    expect(feature.compute(user, club, {})).toBe(1.0);
  });

  it('returns 0.0 when user has no minor', () => {
    expect(feature.compute({}, makeClub('Math', null), {})).toBe(0.0);
  });
});

describe('InterestOverlap', () => {
  const feature = new InterestOverlap();

  it('has correct name', () => {
    expect(feature.name).toBe('interest_overlap');
  });

  it('returns Jaccard similarity for matching interests', () => {
    const user = { interests: ['Sports', 'Music'] };
    const club = makeClub('Sports', 'Art');
    // intersection = 1 (Sports), union = 3 (Sports, Music, Art)
    expect(feature.compute(user, club, {})).toBeCloseTo(1 / 3);
  });

  it('returns 0.0 when user has no interests', () => {
    expect(feature.compute({ interests: [] }, makeClub('Sports', null), {})).toBe(0.0);
  });

  it('returns 0.0 when club has no categories', () => {
    expect(feature.compute({ interests: ['Sports'] }, makeClub(null, null), {})).toBe(0.0);
  });

  it('returns 1.0 for perfect overlap', () => {
    const user = { interests: ['Sports'] };
    const club = makeClub('Sports', null);
    expect(feature.compute(user, club, {})).toBe(1.0);
  });
});

describe('CategoryOverlap', () => {
  const feature = new CategoryOverlap();

  it('has correct name', () => {
    expect(feature.name).toBe('category_overlap');
  });

  it('returns 1.0 when all club categories match user preferences', () => {
    const user = { categories: ['Sports', 'Music'] };
    const club = makeClub('Sports', 'Music');
    expect(feature.compute(user, club, {})).toBe(1.0);
  });

  it('returns 0.5 when half match', () => {
    const user = { categories: ['Sports'] };
    const club = makeClub('Sports', 'Music');
    expect(feature.compute(user, club, {})).toBe(0.5);
  });

  it('returns 0.0 when no match', () => {
    const user = { categories: ['Art'] };
    const club = makeClub('Sports', 'Music');
    expect(feature.compute(user, club, {})).toBe(0.0);
  });

  it('returns 0.0 when user has no categories', () => {
    expect(feature.compute({ categories: [] }, makeClub('Sports', null), {})).toBe(0.0);
  });
});

describe('LikeHistory', () => {
  const feature = new LikeHistory();

  it('has correct name', () => {
    expect(feature.name).toBe('like_history');
  });

  it('returns 1.0 when all club categories appear in liked categories', () => {
    const context = { likedCategories: ['Sports', 'Music', 'Art'] };
    const club = makeClub('Sports', 'Music');
    expect(feature.compute({}, club, context)).toBe(1.0);
  });

  it('returns 0.5 when half match', () => {
    const context = { likedCategories: ['Sports'] };
    const club = makeClub('Sports', 'Music');
    expect(feature.compute({}, club, context)).toBe(0.5);
  });

  it('returns 0.0 when no liked categories', () => {
    expect(feature.compute({}, makeClub('Sports', null), {})).toBe(0.0);
    expect(feature.compute({}, makeClub('Sports', null), { likedCategories: [] })).toBe(0.0);
  });
});

describe('SaveHistory', () => {
  const feature = new SaveHistory();

  it('has correct name', () => {
    expect(feature.name).toBe('save_history');
  });

  it('returns 1.0 when all club categories appear in saved categories', () => {
    const context = { savedCategories: ['Sports', 'Music', 'Art'] };
    const club = makeClub('Sports', 'Music');
    expect(feature.compute({}, club, context)).toBe(1.0);
  });

  it('returns 0.5 when half match', () => {
    const context = { savedCategories: ['Sports'] };
    const club = makeClub('Sports', 'Music');
    expect(feature.compute({}, club, context)).toBe(0.5);
  });

  it('returns 0.0 when no saved categories', () => {
    expect(feature.compute({}, makeClub('Sports', null), {})).toBe(0.0);
    expect(feature.compute({}, makeClub('Sports', null), { savedCategories: [] })).toBe(0.0);
  });
});

describe('MembershipSimilarity', () => {
  const feature = new MembershipSimilarity();

  it('has correct name', () => {
    expect(feature.name).toBe('membership_similarity');
  });

  it('returns 1.0 when all club categories appear in member categories', () => {
    const context = { memberCategories: ['Sports', 'Music', 'Art'] };
    const club = makeClub('Sports', 'Music');
    expect(feature.compute({}, club, context)).toBe(1.0);
  });

  it('returns 0.5 when half match', () => {
    const context = { memberCategories: ['Sports'] };
    const club = makeClub('Sports', 'Music');
    expect(feature.compute({}, club, context)).toBe(0.5);
  });

  it('returns 0.0 when no member categories', () => {
    expect(feature.compute({}, makeClub('Sports', null), {})).toBe(0.0);
    expect(feature.compute({}, makeClub('Sports', null), { memberCategories: [] })).toBe(0.0);
  });

  it('returns 0.0 when club has no categories', () => {
    const context = { memberCategories: ['Sports'] };
    expect(feature.compute({}, makeClub(null, null), context)).toBe(0.0);
  });
});

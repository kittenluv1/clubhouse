import { splitUserInterests } from './splitUserInterests';

describe('splitUserInterests', () => {
  test('separates broad categories from subcategories', () => {
    const input = ["Arts & Media", "Dance", "Pre-Law", "Academic & Pre-Professional"];
    const { broadCategories, subcategories } = splitUserInterests(input);
    expect(broadCategories).toEqual(["Arts & Media", "Academic & Pre-Professional"]);
    expect(subcategories).toEqual(["Dance", "Pre-Law"]);
  });

  test('handles empty array', () => {
    const { broadCategories, subcategories } = splitUserInterests([]);
    expect(broadCategories).toEqual([]);
    expect(subcategories).toEqual([]);
  });

  test('handles all broad categories', () => {
    const input = [
      "Academic & Pre-Professional",
      "Cultural & Identity-Based",
      "Community & Advocacy",
      "Arts & Media",
      "Health & Wellness",
      "Spiritual & Religious",
      "Campus Life & Social",
    ];
    const { broadCategories, subcategories } = splitUserInterests(input);
    expect(broadCategories).toHaveLength(7);
    expect(subcategories).toHaveLength(0);
  });

  test('handles all subcategories (nothing matching broad categories)', () => {
    const input = ["Pre-Law", "Dance", "Jewish"];
    const { broadCategories, subcategories } = splitUserInterests(input);
    expect(broadCategories).toHaveLength(0);
    expect(subcategories).toHaveLength(3);
  });
});

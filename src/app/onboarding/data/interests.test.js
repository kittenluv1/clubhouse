/**
 * Structural tests for interests.json.
 *
 * interests.json is the subcategory data for the onboarding Interests step
 * (src/app/onboarding/steps/Interests.js) and the profile PreferencesSection
 * (src/app/profile/components/PreferencesSection.js). Both components import
 * this file directly.
 */
import INTERESTS from './interests.json';

// Must stay in sync with the top-level keys of interests.json
const BROAD_CATEGORIES = [
  "Academic & Pre-Professional",
  "Cultural & Identity-Based",
  "Community & Advocacy",
  "Arts & Media",
  "Health & Wellness",
  "Spiritual & Religious",
  "Campus Life & Social",
];

describe('interests.json', () => {
  test('has exactly the 7 expected broad categories', () => {
    expect(Object.keys(INTERESTS)).toHaveLength(7);
    BROAD_CATEGORIES.forEach(cat => {
      expect(INTERESTS).toHaveProperty(cat);
    });
  });

  test('each category has at least 3 subcategories', () => {
    BROAD_CATEGORIES.forEach(cat => {
      expect(Array.isArray(INTERESTS[cat])).toBe(true);
      expect(INTERESTS[cat].length).toBeGreaterThanOrEqual(3);
    });
  });

  test('all subcategories are non-empty strings', () => {
    Object.values(INTERESTS).flat().forEach(sub => {
      expect(typeof sub).toBe('string');
      expect(sub.trim().length).toBeGreaterThan(0);
    });
  });
});

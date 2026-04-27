import INTERESTS from "../onboarding/data/interests.json";

const BROAD_CATEGORIES = Object.keys(INTERESTS);

export function splitUserInterests(interests, broadCategories = BROAD_CATEGORIES) {
  const broad = interests.filter((i) => broadCategories.includes(i));
  const sub = interests.filter((i) => !broadCategories.includes(i));
  return { broadCategories: broad, subcategories: sub };
}

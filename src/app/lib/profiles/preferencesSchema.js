import { z } from "zod";

const names = (maxItems) =>
  z.array(z.string().trim().min(1).max(200)).max(maxItems).default([]);

// Body sent by onboarding and the profile preferences editor. broadCategories
// is sent too but not stored; subcategories are the user's interests.
const preferencesSchema = z.object({
  majors: names(10),
  minors: names(10),
  currentClubs: names(50),
  subcategories: names(100),
});

/**
 * @typedef {{ majors: string[], minors: string[], currentClubs: string[], interests: string[] }} Preferences
 */

/**
 * @param {unknown} input
 * @returns {{ success: true, data: Preferences } | { success: false, error: string }}
 */
export function parsePreferences(input) {
  const result = preferencesSchema.safeParse(input ?? {});
  if (!result.success) {
    const error = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    return { success: false, error };
  }
  const { subcategories, ...rest } = result.data;
  return { success: true, data: { ...rest, interests: subcategories } };
}

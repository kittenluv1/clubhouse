# Profile Preferences Editor — Design Spec

**Date:** 2026-04-12
**Status:** Approved

## Problem

Once a user exits the onboarding flow, they have no way to update the preferences they set (majors, minors, current clubs, interest categories, interest subcategories). The onboarding copy already tells users they can do this from their profile page, but the feature does not exist.

## Solution

Add a "Preferences" section to the profile page sidebar that renders an editable form in the main content area. The form mirrors the onboarding steps exactly and pre-fills from the user's current saved preferences.

---

## Architecture & Data Flow

### API Changes

**`GET /api/profile`** — Extend the response to include `user_interests` rows for the authenticated user, returned as a flat array of category strings (e.g. `["Arts & Media", "Dance"]`). These pre-fill both the broad categories and subcategories fields in the form.

**`PATCH /api/onboarding`** — New handler alongside the existing `GET` and `POST`. Accepts the same body shape as `POST`:
```json
{
  "majors": [],
  "minors": [],
  "broadCategories": [],
  "subcategories": [],
  "currentClubs": []
}
```
Writes `majors`, `minors`, `current_clubs` to the `profiles` table and replaces all rows in `user_interests` for the user. Does **not** touch `onboarding_completed`. Uses `createAuthenticatedClient` for auth verification and `supabaseServer` for writes, matching the existing pattern in that route.

### Clubs Search Fix

`src/app/onboarding/steps/Clubs.js` currently uses a hardcoded `TEMP_CLUBS` array of 4 entries. Replace with a live debounced search against `GET /api/clubs?name=<query>` (300ms debounce), extracting `OrganizationName` strings from results. The profile preferences form uses the same approach.

### Data File

Create `src/app/onboarding/data/interests.json` — a JSON object mapping each of the 7 broad categories to an array of subcategory strings. Both the onboarding `Interests.js` step and the profile `PreferencesSection` import from this single source.

---

## Subcategory Data (`interests.json`)

```json
{
  "Academic & Pre-Professional": [
    "Pre-Law", "Pre-Med / Pre-Health", "Business & Finance",
    "Engineering & Computer Science", "Research & Science",
    "Education & Tutoring", "Consulting"
  ],
  "Cultural & Identity-Based": [
    "Asian & Pacific Islander", "Black & African American",
    "Latin & Hispanic", "Middle Eastern & North African",
    "South Asian", "LGBTQ+", "Women & Gender"
  ],
  "Community & Advocacy": [
    "Environmental & Sustainability", "Social Justice",
    "Volunteering & Service", "Political & Civic Engagement",
    "Mental Health Awareness", "Housing & Food Security"
  ],
  "Arts & Media": [
    "Visual Arts & Design", "Music & Performance",
    "Film & Photography", "Journalism & Writing",
    "Dance", "Theater & Acting"
  ],
  "Health & Wellness": [
    "Fitness & Sports", "Martial Arts",
    "Outdoors & Adventure", "Mental Health",
    "Nutrition & Cooking"
  ],
  "Spiritual & Religious": [
    "Christian", "Jewish", "Muslim",
    "Hindu & Buddhist", "Interfaith & Secular"
  ],
  "Campus Life & Social": [
    "Greek Life", "Gaming & Esports",
    "Hobby & Interest Groups", "Leadership & Student Government",
    "Networking & Professional", "Cultural Events"
  ]
}
```

---

## UI Components

### Sidebar

Add a third collapsible section "Preferences" to the profile sidebar, below "Clubs". Follows the exact same expand/collapse pattern as "Reviews" and "Clubs" (chevron icon, toggle state). Contains a single sub-item that sets `activeSection` to `"preferences"`.

### `PreferencesSection` (`src/app/profile/components/PreferencesSection.js`)

A scrollable form rendered in the main content area when `activeSection === "preferences"`. Four labeled sections:

1. **Academic**
   - Two `MultiSelectSearch` components side-by-side (same layout as `Majors.js`)
   - Imports `majors.json` and `minors.json` from `src/app/onboarding/data/`
   - Majors field is required (at least 1)

2. **Current Clubs**
   - Single `MultiSelectSearch` with live search
   - Fetches from `GET /api/clubs?name=<query>`, debounced 300ms
   - Displays `OrganizationName` strings as options

3. **Interest Categories**
   - Exact same 7-button toggle grid as `Categories.js`
   - Minimum 2 required to save
   - Selecting/deselecting a category reactively shows/hides its subcategories in section 4

4. **Interest Subcategories**
   - Same visual style as categories grid (rounded tiles, selected = blue ring)
   - Only shows subcategories belonging to the user's currently-selected broad categories
   - If no broad categories are selected: shows a muted prompt — "Select interest categories above to see subcategories"
   - Optional — no minimum

**Save button:** `Button` with `type="CTA"`, label "Save Changes". Disabled when validation fails (missing major or fewer than 2 categories) or while save is in flight (label becomes "Saving…"). On success: inline green message "Preferences saved!" auto-dismisses after 3s. On error: inline red error message persists until next save attempt.

**Pre-fill:** On mount, `PreferencesSection` receives the following props from the parent profile page (no additional fetch needed):
- `majors` — from `data.profile.majors`
- `minors` — from `data.profile.minors`
- `currentClubs` — from `data.profile.current_clubs`
- `userInterests` — from `data.userInterests` (the new flat array added to the profile API response)

`userInterests` is split into broad categories (strings matching any of the 7 known category names from `Categories.js`) and subcategories (everything else).

**Imports:** `PreferencesSection` imports `MultiSelectSearch` from `src/app/onboarding/components/MultiSelectSearch.js`, `majors.json` and `minors.json` from `src/app/onboarding/data/`, and `interests.json` from `src/app/onboarding/data/`.

---

## Finishing `Interests.js`

`src/app/onboarding/steps/Interests.js` is currently placeholder code. Replace with:
- Import `interests.json`
- Filter visible subcategories to those under the selected broad categories from `formData.interests` (passed down from parent `formData`)
- Same tile toggle UI as `Categories.js`
- Optional — `onValidChange(true)` always (no minimum for onboarding either, matching the existing `canAdvance` default)
- On toggle, call `onUpdate({ subcategories: updated })`

---

## Validation Rules

| Field | Rule |
|---|---|
| Majors | At least 1 required |
| Minors | Optional |
| Current Clubs | Optional |
| Interest Categories | At least 2 required |
| Interest Subcategories | Optional |

These rules apply identically in both the onboarding flow and the profile preferences form.

---

## Files Changed / Created

| File | Change |
|---|---|
| `src/app/api/profile/route.js` | Add `user_interests` to GET response |
| `src/app/api/onboarding/route.js` | Add PATCH handler |
| `src/app/onboarding/steps/Clubs.js` | Replace TEMP_CLUBS with live `/api/clubs` search |
| `src/app/onboarding/steps/Interests.js` | Finish implementation using `interests.json` |
| `src/app/onboarding/data/interests.json` | Create subcategory data file |
| `src/app/profile/page.js` | Add Preferences sidebar section; pass profile data to PreferencesSection |
| `src/app/profile/components/PreferencesSection.js` | Create preferences editing form |

# Profile Preferences Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Preferences" section to the profile page sidebar where users can edit the academic info, current clubs, and interest categories they set during onboarding.

**Architecture:** A new `PreferencesSection` component pre-fills from data already loaded by the profile page (extended to include `user_interests`). Saves via a new `PATCH /api/onboarding` handler. The onboarding `Interests.js` step is also finished using a new `interests.json` data file, and `Clubs.js` is updated to search live clubs from the API.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Supabase, Jest + @testing-library/react

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `src/app/onboarding/data/interests.json` | Create | Subcategory data keyed by broad category |
| `src/app/onboarding/components/MultiSelectSearch.js` | Modify | Add `onQueryChange` + `serverSearch` props for live API search |
| `src/app/onboarding/steps/Interests.js` | Replace | Finish WIP step using `interests.json` |
| `src/app/onboarding/steps/Clubs.js` | Replace | Live debounced search against `/api/clubs` |
| `src/app/api/onboarding/route.js` | Modify | Add `PATCH` handler to update preferences |
| `src/app/api/profile/route.js` | Modify | Add `user_interests` flat array to GET response |
| `src/app/profile/components/PreferencesSection.js` | Create | Full preferences editing form |
| `src/app/profile/page.js` | Modify | Add Preferences sidebar section; wire up PreferencesSection |

---

## Task 1: Create interests.json and verify its structure with a test

**Files:**
- Create: `src/app/onboarding/data/interests.json`
- Create: `src/app/onboarding/data/interests.test.js`

- [ ] **Step 1: Write the failing test**

`src/app/onboarding/data/interests.test.js`:
```js
import INTERESTS from './interests.json';

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
```

- [ ] **Step 2: Run the test — confirm it fails because the file doesn't exist yet**

```bash
npx jest src/app/onboarding/data/interests.test.js --no-coverage
```
Expected: FAIL — `Cannot find module './interests.json'`

- [ ] **Step 3: Create the data file**

`src/app/onboarding/data/interests.json`:
```json
{
  "Academic & Pre-Professional": [
    "Pre-Law",
    "Pre-Med / Pre-Health",
    "Business & Finance",
    "Engineering & Computer Science",
    "Research & Science",
    "Education & Tutoring",
    "Consulting"
  ],
  "Cultural & Identity-Based": [
    "Asian & Pacific Islander",
    "Black & African American",
    "Latin & Hispanic",
    "Middle Eastern & North African",
    "South Asian",
    "LGBTQ+",
    "Women & Gender"
  ],
  "Community & Advocacy": [
    "Environmental & Sustainability",
    "Social Justice",
    "Volunteering & Service",
    "Political & Civic Engagement",
    "Mental Health Awareness",
    "Housing & Food Security"
  ],
  "Arts & Media": [
    "Visual Arts & Design",
    "Music & Performance",
    "Film & Photography",
    "Journalism & Writing",
    "Dance",
    "Theater & Acting"
  ],
  "Health & Wellness": [
    "Fitness & Sports",
    "Martial Arts",
    "Outdoors & Adventure",
    "Mental Health",
    "Nutrition & Cooking"
  ],
  "Spiritual & Religious": [
    "Christian",
    "Jewish",
    "Muslim",
    "Hindu & Buddhist",
    "Interfaith & Secular"
  ],
  "Campus Life & Social": [
    "Greek Life",
    "Gaming & Esports",
    "Hobby & Interest Groups",
    "Leadership & Student Government",
    "Networking & Professional",
    "Cultural Events"
  ]
}
```

- [ ] **Step 4: Run the test — confirm it passes**

```bash
npx jest src/app/onboarding/data/interests.test.js --no-coverage
```
Expected: PASS — 3 tests

---

## Task 2: Add server-side search support to MultiSelectSearch

**Files:**
- Modify: `src/app/onboarding/components/MultiSelectSearch.js`

The component needs two new optional props so `Clubs.js` and `PreferencesSection` can drive search via the API rather than filtering a static array client-side:
- `onQueryChange(query)` — called on every keystroke so the parent can debounce + fetch
- `serverSearch` (boolean, default `false`) — when `true`, skips the internal `.filter()` step and uses `options` as-is (the parent provides pre-filtered results)

No new test needed — the existing behavior for all current callers is unchanged (both props are optional and default to the current behavior).

- [ ] **Step 1: Update MultiSelectSearch**

Replace the entire file `src/app/onboarding/components/MultiSelectSearch.js` with:

```js
"use client";

import { useState, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";

export default function MultiSelectSearch({
  label,
  placeholder = "Search...",
  options = [],
  selected = [],
  onSelect,
  onRemove,
  required = false,
  onQueryChange,   // optional: called with the raw query string on every keystroke
  serverSearch = false, // when true, skip client-side filtering (parent provides pre-filtered options)
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const lowerQuery = query.toLowerCase();

  const filtered = serverSearch
    ? options.filter((o) => !selected.includes(o)).slice(0, 8)
    : query.trim() === ""
      ? []
      : options
          .filter((o) => !selected.includes(o))
          .filter((o) => o.toLowerCase().includes(lowerQuery))
          .sort((a, b) => {
            const indexA = a.toLowerCase().indexOf(lowerQuery);
            const indexB = b.toLowerCase().indexOf(lowerQuery);
            if (indexA !== indexB) return indexA - indexB;
            return a.toLowerCase().localeCompare(b.toLowerCase());
          })
          .slice(0, 8);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onSelect(option);
    setQuery("");
    if (onQueryChange) onQueryChange("");
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-[#FFA1CD] ml-0.5">*</span>}
      </label>

      <div className="relative" ref={containerRef}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (onQueryChange) onQueryChange(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-full bg-[#F4F5F6] py-3 pl-5 pr-12 text-sm text-gray-700 hover:bg-[#E5EBF1] focus:bg-[#E5EBF1] focus:outline-none"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {isOpen && filtered.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg">
            {filtered.map((option) => (
              <li
                key={option}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(option)}
                className="cursor-pointer truncate px-4 py-2 hover:bg-[#F4F5F6]"
              >
                {option}
              </li>
            ))}
          </ul>
        )}

        {isOpen && query.trim() && filtered.length === 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-500 shadow-lg">
            No results for &quot;{query}&quot;
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1 rounded-full border border-[#FFA1CD] bg-[#FFCEE5] px-3 py-1 text-sm text-gray-800"
            >
              {item}
              <button
                onClick={() => onRemove(item)}
                className="ml-0.5 text-gray-500 hover:text-gray-700"
                aria-label={`Remove ${item}`}
              >
                <IoClose size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify the app still builds cleanly (no TypeScript/ESLint errors)**

```bash
npm run lint
```
Expected: no errors

---

## Task 3: Finish the Interests.js onboarding step

**Files:**
- Replace: `src/app/onboarding/steps/Interests.js`

The step shows subcategories grouped by whichever broad categories the user selected in the previous step (`formData.interests`). Selecting/deselecting a subcategory calls `onUpdate({ subcategories: updated })`. The step is optional — `onValidChange(true)` always.

- [ ] **Step 1: Replace Interests.js**

`src/app/onboarding/steps/Interests.js`:
```js
"use client";

import { useEffect, useState } from "react";
import INTERESTS from "../data/interests.json";

export default function Interests({ formData, onUpdate, onValidChange }) {
  const [selected, setSelected] = useState(formData.subcategories ?? []);
  const selectedCategories = formData.interests ?? [];

  useEffect(() => {
    onValidChange(true); // optional step — always allow advancing
  }, []);

  const toggle = (subcategory) => {
    const updated = selected.includes(subcategory)
      ? selected.filter((s) => s !== subcategory)
      : [...selected, subcategory];
    setSelected(updated);
    onUpdate({ subcategories: updated });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dive deeper into your interests!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select any specific areas you&apos;re interested in. This step is optional.
        </p>
      </div>

      {selectedCategories.length === 0 ? (
        <p className="text-sm text-gray-400">
          Go back and select interest categories to see subcategories here.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {selectedCategories.map((category) => (
            <div key={category}>
              <h2 className="mb-2 text-sm font-semibold text-gray-600">{category}</h2>
              <div className="flex flex-wrap gap-2">
                {(INTERESTS[category] ?? []).map((sub) => {
                  const isSelected = selected.includes(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() => toggle(sub)}
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        isSelected
                          ? "bg-[#D6EEFF] ring-2 ring-[#7BBFEE]"
                          : "bg-[#F4F5F6] hover:bg-[#E5EBF1]"
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```
Expected: no errors

---

## Task 4: Fix Clubs.js with live API search

**Files:**
- Replace: `src/app/onboarding/steps/Clubs.js`

Replaces the hardcoded `TEMP_CLUBS` array with a debounced search against `GET /api/clubs?name=<query>&page=1&sort=alphabetical`. The API returns `{ orgList: [...] }` where each item has an `OrganizationName` string. The debounce is 300ms, implemented with `useRef` to avoid stale closure issues.

- [ ] **Step 1: Replace Clubs.js**

`src/app/onboarding/steps/Clubs.js`:
```js
"use client";

import { useEffect, useRef, useState } from "react";
import MultiSelectSearch from "../components/MultiSelectSearch";

export default function Clubs({ formData, onUpdate, onValidChange }) {
  const [selectedClubs, setSelectedClubs] = useState(formData.clubs ?? []);
  const [clubOptions, setClubOptions] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    onValidChange(true); // optional step
  }, []);

  const handleQueryChange = (query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setClubOptions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/clubs?name=${encodeURIComponent(query)}&page=1&sort=alphabetical`
        );
        const data = await res.json();
        setClubOptions((data.orgList || []).map((c) => c.OrganizationName));
      } catch {
        setClubOptions([]);
      }
    }, 300);
  };

  const handleSelect = (club) => {
    const updated = [...selectedClubs, club];
    setSelectedClubs(updated);
    onUpdate({ clubs: updated });
  };

  const handleRemove = (club) => {
    const updated = selectedClubs.filter((c) => c !== club);
    setSelectedClubs(updated);
    onUpdate({ clubs: updated });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Which clubs are you in?</h1>
        <p className="mt-1 text-sm text-gray-500">
          We&apos;ll be using this information to personalize club recommendations for you.
        </p>
        <p className="mt-1 text-xs text-[#6E808D]">
          Not now? You can always fill this out later from your profile page.
        </p>
      </div>

      <MultiSelectSearch
        label="Select your club(s)"
        placeholder="Search clubs..."
        options={clubOptions}
        selected={selectedClubs}
        onSelect={handleSelect}
        onRemove={handleRemove}
        onQueryChange={handleQueryChange}
        serverSearch
      />

      {selectedClubs.length === 0 && (
        <p className="-mt-4 text-xs text-gray-400">
          Not in any clubs yet? You can skip this step.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```
Expected: no errors

---

## Task 5: Add PATCH handler to /api/onboarding

**Files:**
- Modify: `src/app/api/onboarding/route.js`

The `PATCH` handler accepts the same body shape as the existing `POST` but does not touch `onboarding_completed`. It updates `majors`, `minors`, `current_clubs` on `profiles` and replaces all `user_interests` rows for the user.

- [ ] **Step 1: Add the PATCH export to the end of the file**

Open `src/app/api/onboarding/route.js` and append after the closing brace of the `POST` export:

```js
// PATCH /api/onboarding
// Updates user preferences without changing onboarding_completed.
// Body: { majors, minors, broadCategories, subcategories, currentClubs }
export async function PATCH(req) {
  try {
    const supabase = await createAuthenticatedClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { majors = [], minors = [], broadCategories = [], subcategories = [], currentClubs = [] } = await req.json();

    const { error: profileError } = await supabaseServer
      .from("profiles")
      .update({
        majors,
        minors,
        current_clubs: currentClubs,
      })
      .eq("id", user.id);

    if (profileError) {
      return Response.json({ error: "Failed to save profile preferences" }, { status: 500 });
    }

    // Always delete existing interests first, then re-insert if any selected.
    await supabaseServer
      .from("user_interests")
      .delete()
      .eq("user_id", user.id);

    const allInterests = [...new Set([...broadCategories, ...subcategories])];

    if (allInterests.length > 0) {
      const { error: interestsError } = await supabaseServer
        .from("user_interests")
        .insert(allInterests.map((category) => ({ user_id: user.id, category })));

      if (interestsError) {
        return Response.json({ error: "Failed to save interest preferences" }, { status: 500 });
      }
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```
Expected: no errors

---

## Task 6: Add user_interests to GET /api/profile

**Files:**
- Modify: `src/app/api/profile/route.js`

Add a `user_interests` query and include a flat array of category strings in the response. The profile page uses this to pre-fill the Preferences form.

- [ ] **Step 1: Add the user_interests fetch**

In `src/app/api/profile/route.js`, add the following query after the `savedClubsData` fetch (around line 76), before the transformation block:

```js
    // Fetch user interests
    const { data: userInterestsData, error: interestsError } = await supabase
      .from('user_interests')
      .select('category')
      .eq('user_id', userId);

    if (interestsError) {
      console.error('Error fetching user interests:', interestsError);
    }
```

- [ ] **Step 2: Add userInterests to the return payload**

In the same file, find the `return new Response(JSON.stringify({...}), ...)` block and add `userInterests` to the object:

```js
    return new Response(
      JSON.stringify({
        profile: profileData,
        approvedReviews: approvedReviews || [],
        pendingReviews: pendingReviews || [],
        rejectedReviews: rejectedReviews || [],
        likedClubs: likedClubsWithCounts,
        savedClubs: savedClubsWithCounts,
        unreadRejectedCount,
        userInterests: (userInterestsData || []).map((row) => row.category),
      }),
      { status: 200 }
    );
```

- [ ] **Step 3: Verify lint passes**

```bash
npm run lint
```
Expected: no errors

---

## Task 7: Create PreferencesSection with splitUserInterests utility and test

**Files:**
- Create: `src/app/profile/components/PreferencesSection.js`
- Create: `src/app/profile/components/PreferencesSection.test.js`

`splitUserInterests` is a pure function exported from `PreferencesSection.js`. It splits a flat `user_interests` array (as returned by the profile API) into `broadCategories` (strings that match any of the 7 category keys in `interests.json`) and `subcategories` (everything else).

- [ ] **Step 1: Write the failing test for splitUserInterests**

`src/app/profile/components/PreferencesSection.test.js`:
```js
import { splitUserInterests } from './PreferencesSection';

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
```

- [ ] **Step 2: Run the test — confirm it fails because the file doesn't exist**

```bash
npx jest src/app/profile/components/PreferencesSection.test.js --no-coverage
```
Expected: FAIL — `Cannot find module './PreferencesSection'`

- [ ] **Step 3: Create PreferencesSection.js**

First, create the directory:
```bash
mkdir -p src/app/profile/components
```

Then create `src/app/profile/components/PreferencesSection.js`:

```js
"use client";

import { useRef, useState } from "react";
import MultiSelectSearch from "../../onboarding/components/MultiSelectSearch";
import MAJORS from "../../onboarding/data/majors.json";
import MINORS from "../../onboarding/data/minors.json";
import INTERESTS from "../../onboarding/data/interests.json";
import Button from "../../components/button";

const BROAD_CATEGORIES = Object.keys(INTERESTS);

/**
 * Splits a flat user_interests array (as returned by GET /api/profile)
 * into broad categories and subcategories.
 *
 * Broad categories are the 7 top-level keys in interests.json.
 * Everything else is treated as a subcategory.
 */
export function splitUserInterests(interests) {
  const broad = interests.filter((i) => BROAD_CATEGORIES.includes(i));
  const sub = interests.filter((i) => !BROAD_CATEGORIES.includes(i));
  return { broadCategories: broad, subcategories: sub };
}

export default function PreferencesSection({
  majors: initialMajors = [],
  minors: initialMinors = [],
  currentClubs: initialClubs = [],
  userInterests = [],
}) {
  const { broadCategories: initialBroad, subcategories: initialSub } =
    splitUserInterests(userInterests);

  const [majors, setMajors] = useState(initialMajors);
  const [minors, setMinors] = useState(initialMinors);
  const [clubs, setClubs] = useState(initialClubs);
  const [broadCategories, setBroadCategories] = useState(initialBroad);
  const [subcategories, setSubcategories] = useState(initialSub);
  const [clubOptions, setClubOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "success" | "error" | null
  const debounceRef = useRef(null);

  const handleClubQuery = (query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setClubOptions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/clubs?name=${encodeURIComponent(query)}&page=1&sort=alphabetical`
        );
        const data = await res.json();
        setClubOptions((data.orgList || []).map((c) => c.OrganizationName));
      } catch {
        setClubOptions([]);
      }
    }, 300);
  };

  const toggleCategory = (category) => {
    const updated = broadCategories.includes(category)
      ? broadCategories.filter((c) => c !== category)
      : [...broadCategories, category];
    setBroadCategories(updated);
    // Drop any subcategories that no longer belong to a selected category
    const validSubs = updated.flatMap((cat) => INTERESTS[cat] ?? []);
    setSubcategories((prev) => prev.filter((s) => validSubs.includes(s)));
  };

  const toggleSubcategory = (sub) => {
    setSubcategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const canSave = majors.length >= 1 && broadCategories.length >= 2;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          majors,
          minors,
          broadCategories,
          subcategories,
          currentClubs: clubs,
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-8">
      <div className="mb-8 text-center">
        <p className="mb-4 text-4xl font-bold text-[#000000]">Preferences</p>
        <p className="text-[20px] text-[#747474]">
          Update your academic info and interests.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Academic */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Academic</h2>
          <div className="grid grid-cols-2 gap-8">
            <MultiSelectSearch
              label="Major(s)"
              placeholder="Search majors..."
              options={MAJORS}
              selected={majors}
              onSelect={(m) => setMajors((prev) => [...prev, m])}
              onRemove={(m) => setMajors((prev) => prev.filter((x) => x !== m))}
              required
            />
            <MultiSelectSearch
              label="Minor(s)"
              placeholder="Search minors..."
              options={MINORS}
              selected={minors}
              onSelect={(m) => setMinors((prev) => [...prev, m])}
              onRemove={(m) => setMinors((prev) => prev.filter((x) => x !== m))}
            />
          </div>
        </section>

        {/* Current Clubs */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Current Clubs</h2>
          <MultiSelectSearch
            label="Club(s) you're in"
            placeholder="Search clubs..."
            options={clubOptions}
            selected={clubs}
            onSelect={(c) => setClubs((prev) => [...prev, c])}
            onRemove={(c) => setClubs((prev) => prev.filter((x) => x !== c))}
            onQueryChange={handleClubQuery}
            serverSearch
          />
        </section>

        {/* Interest Categories */}
        <section>
          <h2 className="mb-1 text-lg font-semibold text-gray-800">
            Interest Categories
          </h2>
          <p className="mb-4 text-sm text-gray-500">Select at least 2.</p>
          <div className="grid grid-cols-8 gap-3">
            {BROAD_CATEGORIES.map((category, i) => {
              const isSelected = broadCategories.includes(category);
              const colSpanClass = "col-span-2";
              const colStartClass =
                i === 4
                  ? "col-start-2"
                  : i === 5
                  ? "col-start-4"
                  : i === 6
                  ? "col-start-6"
                  : "";
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`
                    ${colSpanClass} ${colStartClass}
                    flex h-28 flex-col items-center justify-center gap-2 rounded-xl p-1
                    text-center text-xs font-medium text-gray-900
                    ${
                      isSelected
                        ? "bg-[#D6EEFF] ring-2 ring-[#7BBFEE]"
                        : "bg-[#F4F5F6] hover:bg-[#E5EBF1]"
                    }
                  `}
                >
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gray-300" />
                  {category}
                </button>
              );
            })}
          </div>
        </section>

        {/* Interest Subcategories */}
        <section>
          <h2 className="mb-1 text-lg font-semibold text-gray-800">
            Interest Subcategories
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            Optional — dive deeper into your interests.
          </p>
          {broadCategories.length === 0 ? (
            <p className="text-sm text-gray-400">
              Select interest categories above to see subcategories.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {broadCategories.map((category) => (
                <div key={category}>
                  <h3 className="mb-2 text-sm font-semibold text-gray-600">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(INTERESTS[category] ?? []).map((sub) => {
                      const isSelected = subcategories.includes(sub);
                      return (
                        <button
                          key={sub}
                          onClick={() => toggleSubcategory(sub)}
                          className={`rounded-full px-4 py-2 text-sm font-medium ${
                            isSelected
                              ? "bg-[#D6EEFF] ring-2 ring-[#7BBFEE]"
                              : "bg-[#F4F5F6] hover:bg-[#E5EBF1]"
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Save */}
        <div className="flex flex-col gap-2 pb-8">
          {!canSave && (
            <p className="text-sm text-[#747474]">
              {majors.length === 0
                ? "Please select at least one major."
                : "Please select at least 2 interest categories."}
            </p>
          )}
          {saveStatus === "success" && (
            <p className="text-sm text-green-600">Preferences saved!</p>
          )}
          {saveStatus === "error" && (
            <p className="text-sm text-red-500">
              Failed to save. Please try again.
            </p>
          )}
          <Button type="CTA" onClick={handleSave} disabled={!canSave || saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the splitUserInterests test — confirm it passes**

```bash
npx jest src/app/profile/components/PreferencesSection.test.js --no-coverage
```
Expected: PASS — 4 tests

- [ ] **Step 5: Verify lint passes**

```bash
npm run lint
```
Expected: no errors

---

## Task 8: Wire up the profile page

**Files:**
- Modify: `src/app/profile/page.js`

Four changes:
1. Add a `profilePreferences` state to hold the pre-fill data for `PreferencesSection`
2. Populate `profilePreferences` inside the existing `fetchProfileData` effect
3. Add a collapsible "Preferences" section to the sidebar (same pattern as Reviews/Clubs)
4. Add a `"preferences"` case to `getContentForSection`

- [ ] **Step 1: Add the import and state**

At the top of `src/app/profile/page.js`, add the import after the existing imports:

```js
import PreferencesSection from "./components/PreferencesSection";
```

Inside `ProfilePage`, add two new state variables alongside the existing ones (after `const [unreadRejectedCount, setUnreadRejectedCount] = useState(0);`):

```js
const [preferencesExpanded, setPreferencesExpanded] = useState(false);
const [profilePreferences, setProfilePreferences] = useState(null);
```

- [ ] **Step 2: Populate profilePreferences in fetchProfileData**

Inside the `if (response.ok)` block in `fetchProfileData`, after the line `setUnreadRejectedCount(data.unreadRejectedCount || 0);`, add:

```js
                    setProfilePreferences({
                        majors: data.profile?.majors || [],
                        minors: data.profile?.minors || [],
                        currentClubs: data.profile?.current_clubs || [],
                        userInterests: data.userInterests || [],
                    });
```

- [ ] **Step 3: Add the Preferences sidebar section**

In the sidebar JSX, after the closing `</div>` of the Clubs section (around line 587), add:

```jsx
                        {/* Preferences Section */}
                        <div className="mt-4">
                            <button
                                onClick={() => setPreferencesExpanded(!preferencesExpanded)}
                                className="mb-2 flex w-full items-center justify-between text-left font-semibold"
                            >
                                <div className="flex items-center gap-2">
                                    <img
                                        src="/profile_club.svg"
                                        alt="preferences icon"
                                        className="max-w-[20px]"
                                    />
                                    <span className="text-2xl">Preferences</span>
                                </div>
                                <svg
                                    className={`h-4 w-4 transition-transform ${preferencesExpanded ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {preferencesExpanded && (
                                <div className="relative ml-2 space-y-1">
                                    <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-300"></div>
                                    <button
                                        onClick={() => setActiveSection("preferences")}
                                        className={`ml-3 block w-full text-left text-[#6E808D] font-medium py-2 px-3 rounded-full relative ${activeSection === "preferences" ? "bg-[#F0F2F9]" : "hover:bg-[#F0F2F9]"}`}
                                    >
                                        Edit Preferences
                                    </button>
                                </div>
                            )}
                        </div>
```

- [ ] **Step 4: Add the preferences case to getContentForSection**

In `getContentForSection`, add a new case before the `default` case:

```js
            case "preferences":
                return profilePreferences ? (
                    <PreferencesSection
                        majors={profilePreferences.majors}
                        minors={profilePreferences.minors}
                        currentClubs={profilePreferences.currentClubs}
                        userInterests={profilePreferences.userInterests}
                    />
                ) : (
                    <LoadingScreen />
                );
```

- [ ] **Step 5: Run all tests — confirm everything still passes**

```bash
npm test --no-coverage
```
Expected: PASS — all existing tests plus the 7 new ones (3 in interests.test.js, 4 in PreferencesSection.test.js)

- [ ] **Step 6: Verify lint**

```bash
npm run lint
```
Expected: no errors

- [ ] **Step 7: Start the dev server and manually verify the feature**

```bash
npm run dev
```

Open `http://localhost:3000/profile` while signed in. Check:
- "Preferences" section appears in the sidebar and expands/collapses
- Clicking "Edit Preferences" loads the form in the main content area
- Majors/minors pre-fill from the user's saved data
- Current clubs pre-fill and live search returns real club names
- Interest category tiles match the onboarding UI (7 tiles, blue ring when selected)
- Subcategory pills appear only under selected categories and auto-clear when a category is deselected
- Save button is disabled with a hint message when < 1 major or < 2 categories are selected
- Save button fires the PATCH, shows "Saving…", then shows "Preferences saved!" for 3 seconds
- Navigate to `/onboarding` (while not yet complete) and verify the Interests step now shows real subcategory pills grouped by selected categories
- Verify `Clubs.js` onboarding step now searches real clubs by name

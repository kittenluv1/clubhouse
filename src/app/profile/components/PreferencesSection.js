"use client";

import { useEffect, useRef, useState } from "react";
import MultiSelectSearch from "../../onboarding/components/MultiSelectSearch";
import MAJORS from "../../onboarding/data/majors.json";
import MINORS from "../../onboarding/data/minors.json";
import INTERESTS from "../../onboarding/data/interests.json";
import Button from "../../components/button";
import { supabase } from "../../lib/db";
import { splitUserInterests } from "../../utils/splitUserInterests";

const BROAD_CATEGORIES = Object.keys(INTERESTS);

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
  const saveTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchClubNames = async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("OrganizationName");
      if (!error && data) {
        setClubOptions(data.map((c) => c.OrganizationName));
      }
    };
    fetchClubNames();
  }, []);

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
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => setSaveStatus(null), 3000);
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
            onSelect={(c) => setClubs((prev) => prev.includes(c) ? prev : [...prev, c])}
            onRemove={(c) => setClubs((prev) => prev.filter((x) => x !== c))}
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
        <div className="flex flex-col items-center gap-2 pb-8">
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

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MultiSelectSearch from "../../onboarding/components/MultiSelectSearch";
import MAJORS from "../../onboarding/data/majors.json";
import MINORS from "../../onboarding/data/minors.json";
import INTERESTS from "../../onboarding/data/interests.json";
import Button from "../../components/button";
import { supabase } from "../../lib/db";
import { splitUserInterests } from "../../utils/splitUserInterests";

const BROAD_CATEGORIES = Object.keys(INTERESTS);

const ICONS = {
  "Academic & Pre-Professional": "/academic-and-pre-professional.svg",
  "Arts & Media": "/arts-and-media.svg",
  "Community & Advocacy": "/community-and-advocacy.svg",
  "Health & Wellness": "/health-and-wellness.svg",
  "Spiritual & Religious": "/spiritual-and-religious.svg",
  "Cultural & Identity-Based": "/cultural-and-identity-based.svg",
  "Campus Life & Social": "/campus-and-social.svg",
};

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

  const [savedState, setSavedState] = useState({
    majors: initialMajors,
    minors: initialMinors,
    clubs: initialClubs,
    broadCategories: initialBroad,
    subcategories: initialSub,
  });

  const arraysMatch = (a, b) =>
    a.length === b.length && [...a].sort().join("\0") === [...b].sort().join("\0");

  const hasUnsavedChanges =
    !arraysMatch(majors, savedState.majors) ||
    !arraysMatch(minors, savedState.minors) ||
    !arraysMatch(clubs, savedState.clubs) ||
    !arraysMatch(broadCategories, savedState.broadCategories) ||
    !arraysMatch(subcategories, savedState.subcategories);

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

  const handleDiscard = () => {
    setMajors(savedState.majors);
    setMinors(savedState.minors);
    setClubs(savedState.clubs);
    setBroadCategories(savedState.broadCategories);
    setSubcategories(savedState.subcategories);
  };

  const canSave = majors.length >= 1 && broadCategories.length >= 2 && subcategories.length >= 2;
  const validationMessage = !canSave
    ? majors.length === 0
      ? "Please select at least one major."
      : broadCategories.length < 2
      ? "Please select at least 2 interest categories."
      : "Please select at least 2 interest subcategories."
    : null;

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
        setSavedState({ majors, minors, clubs, broadCategories, subcategories });
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
          <p className="mb-4 text-sm text-gray-500">To help us get better club recommendations, tell us what you’re interested in. Please select at least 2 categories to continue.</p>
          <div className="flex flex-col items-center gap-4">
            {[BROAD_CATEGORIES.slice(0, 4), BROAD_CATEGORIES.slice(4)].map((row, ri) => (
              <div key={ri} className="flex gap-10">
                {row.map((category) => {
                  const isSelected = broadCategories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`
                        w-[140px] h-[140px] flex flex-col items-center justify-center gap-2 rounded-xl p-1
                        text-center text-xs font-medium text-gray-900
                        ${
                          isSelected
                            ? "bg-[#D6EEFF] ring-2 ring-[#7BBFEE]"
                            : "bg-[#F4F5F6] hover:bg-[#E5EBF1]"
                        }
                      `}
                    >
                      <img src={ICONS[category]} alt={category} className="w-12 h-12 shrink-0" />
                      {category}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* Interest Subcategories */}
        <section>
          <h2 className="mb-1 text-lg font-semibold text-gray-800">
            Interest Subcategories
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            Please select at least 2 categories to continue.
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

      </div>

      <AnimatePresence>
        {(hasUnsavedChanges || saveStatus) && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-gray-200 bg-white px-8 py-4 shadow-lg"
          >
            {saveStatus === "success" ? (
              <p className="text-sm font-medium text-green-600">Preferences saved!</p>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700">You have unsaved changes</p>
                {validationMessage && (
                  <p className="text-xs text-[#747474] mt-0.5">{validationMessage}</p>
                )}
                {saveStatus === "error" && (
                  <p className="text-xs text-red-500 mt-0.5">Failed to save. Please try again.</p>
                )}
              </div>
            )}
            {saveStatus !== "success" && (
              <div className="flex gap-3">
                <Button type="gray" onClick={handleDiscard} disabled={saving}>
                  Discard changes
                </Button>
                <Button type="CTA" onClick={handleSave} disabled={!canSave || saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

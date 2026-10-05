// Data access for a user's profile row and interests.

import { HttpError } from "@/app/lib/server/errors";

/**
 * @param {any} supabase client acting as the user (RLS applies)
 */
export function createProfilesRepository(supabase) {
  async function update(userId, fields) {
    const { error } = await supabase.from("profiles").update(fields).eq("id", userId);
    if (error) throw error;
  }

  return {
    /**
     * @param {string} userId
     * @param {string} [columns]
     * @returns {Promise<object | null>} null when the user has no profile row
     */
    async getProfile(userId, columns = "*") {
      const { data, error } = await supabase.from("profiles").select(columns).eq("id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },

    /** @param {string} userId */
    async getOnboardingStatus(userId) {
      const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_completed, onboarding_started")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return {
        onboarding_completed: data?.onboarding_completed ?? false,
        onboarding_started: data?.onboarding_started ?? false,
      };
    },

    /** @param {string} userId */
    async markOnboardingStarted(userId) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ onboarding_started: true })
        .eq("id", userId)
        .select("id");
      if (error) throw error;
      if (!data?.length) throw new HttpError(404, "Profile not found");
    },

    /**
     * @param {string} userId
     * @param {{ majors: string[], minors: string[], currentClubs: string[] }} preferences
     * @param {{ completeOnboarding?: boolean }} [options]
     */
    async updatePreferences(userId, { majors, minors, currentClubs }, { completeOnboarding = false } = {}) {
      await update(userId, {
        ...(completeOnboarding && { onboarding_completed: true }),
        majors,
        minors,
        current_clubs: currentClubs,
      });
    },

    /**
     * Replace the user's interests. Not atomic: if the insert fails after the
     * delete, the user has no interests until they save again.
     * @param {string} userId
     * @param {string[]} interests
     */
    async replaceInterests(userId, interests) {
      const { error: deleteError } = await supabase.from("user_interests").delete().eq("user_id", userId);
      if (deleteError) throw deleteError;

      const unique = [...new Set(interests)];
      if (unique.length === 0) return;

      const { error } = await supabase
        .from("user_interests")
        .insert(unique.map((category) => ({ user_id: userId, category })));
      if (error) throw error;
    },

    /** @param {string} userId */
    async listInterests(userId) {
      const { data, error } = await supabase.from("user_interests").select("category").eq("user_id", userId);
      if (error) throw error;
      return (data ?? []).map((row) => row.category);
    },

    /** @param {string} userId */
    async markRejectedViewed(userId) {
      await update(userId, { last_viewed_rejected_at: new Date().toISOString() });
    },
  };
}

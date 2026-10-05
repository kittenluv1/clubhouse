/**
 * @jest-environment node
 */
import { createProfilesRepository } from "@/app/lib/server/repositories/profiles";
import { createSupabaseMock } from "../helpers/supabaseMock";

const WRITES = ["insert", "update", "delete"];
const op = (q) => q.calls.find((c) => WRITES.includes(c.method))?.method ?? "select";

function setup(respond = () => ({ data: null })) {
  const db = createSupabaseMock({ respond });
  return { db, repo: createProfilesRepository(db) };
}

describe("profiles repository", () => {
  it("reads onboarding status, defaulting missing flags to false", async () => {
    const { repo } = setup(() => ({ data: { onboarding_completed: true } }));

    await expect(repo.getOnboardingStatus("u1")).resolves.toEqual({
      onboarding_completed: true,
      onboarding_started: false,
    });
  });

  it("throws 404 when marking onboarding started for a user with no profile row", async () => {
    const { repo } = setup(() => ({ data: [] }));

    await expect(repo.markOnboardingStarted("u1")).rejects.toMatchObject({ status: 404 });
  });

  it("marks onboarding started on the user's own row", async () => {
    const { db, repo } = setup(() => ({ data: [{ id: "u1" }] }));

    await repo.markOnboardingStarted("u1");

    expect(db.callsTo("update")[0][0]).toEqual({ onboarding_started: true });
    expect(db.callsTo("eq")).toContainEqual(["id", "u1"]);
  });

  it("updates only the given preference fields", async () => {
    const { db, repo } = setup();

    await repo.updatePreferences("u1", { majors: ["Biology"], minors: [], currentClubs: ["Chess"] });

    expect(db.callsTo("update")[0][0]).toEqual({ majors: ["Biology"], minors: [], current_clubs: ["Chess"] });
  });

  it("can complete onboarding while updating preferences", async () => {
    const { db, repo } = setup();

    await repo.updatePreferences("u1", { majors: [], minors: [], currentClubs: [] }, { completeOnboarding: true });

    expect(db.callsTo("update")[0][0]).toMatchObject({ onboarding_completed: true });
  });

  it("replaces interests: deletes the old rows, then inserts unique new ones", async () => {
    const { db, repo } = setup();

    await repo.replaceInterests("u1", ["Dance", "Chess", "Dance"]);

    expect(db.queries.map(op)).toEqual(["delete", "insert"]);
    expect(db.callsTo("insert")[0][0]).toEqual([
      { user_id: "u1", category: "Dance" },
      { user_id: "u1", category: "Chess" },
    ]);
  });

  it("clears interests without inserting when given none", async () => {
    const { db, repo } = setup();

    await repo.replaceInterests("u1", []);

    expect(db.queries.map(op)).toEqual(["delete"]);
  });

  it("stops before inserting when clearing old interests fails", async () => {
    const { db, repo } = setup(() => ({ error: { message: "rls" } }));

    await expect(repo.replaceInterests("u1", ["Dance"])).rejects.toBeDefined();
    expect(db.queries.map(op)).toEqual(["delete"]);
  });

  it("records when the user last viewed rejected reviews", async () => {
    const { db, repo } = setup();

    await repo.markRejectedViewed("u1");

    expect(db.callsTo("update")[0][0]).toEqual({ last_viewed_rejected_at: expect.any(String) });
  });
});

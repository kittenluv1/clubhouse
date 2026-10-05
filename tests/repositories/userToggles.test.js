/**
 * @jest-environment node
 */
import { createUserToggleRepository, USER_TOGGLES } from "@/app/lib/server/repositories/userToggles";
import { createSupabaseMock } from "../helpers/supabaseMock";

const setup = (result) => {
  const db = createSupabaseMock({ respond: () => result });
  return { db, repo: createUserToggleRepository(db, USER_TOGGLES.reviewLike) };
};

describe("user toggle repository", () => {
  it("adds a row for the user and target", async () => {
    const { db, repo } = setup({ data: [{ id: 1 }] });

    await expect(repo.add("u1", 42)).resolves.toEqual({ created: true, row: { id: 1 } });
    expect(db.queries[0].table).toBe("review_likes");
    expect(db.callsTo("insert")[0][0]).toEqual([{ review_id: 42, user_id: "u1" }]);
  });

  it("treats a unique violation as already added", async () => {
    const { repo } = setup({ data: null, error: { code: "23505", message: "anything" } });

    await expect(repo.add("u1", 42)).resolves.toEqual({ created: false, row: null });
  });

  it("throws other insert errors", async () => {
    const { repo } = setup({ data: null, error: { code: "23503", message: "fk violation" } });

    await expect(repo.add("u1", 42)).rejects.toMatchObject({ code: "23503" });
  });

  it("removes only the user's own row", async () => {
    const { db, repo } = setup({ data: null });

    await repo.remove("u1", 42);

    const filters = db.callsTo("eq");
    expect(filters).toEqual(expect.arrayContaining([["review_id", 42], ["user_id", "u1"]]));
  });
});

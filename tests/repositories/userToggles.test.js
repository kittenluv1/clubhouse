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

  it("counts rows per target, including targets with none", async () => {
    const { repo } = setup({ data: [{ review_id: 1 }, { review_id: 1 }, { review_id: 3 }] });

    const counts = await repo.countByTarget([1, 2, 3]);

    expect(Object.fromEntries(counts)).toEqual({ 1: 2, 2: 0, 3: 1 });
  });

  it("skips the query when counting no targets", async () => {
    const { db, repo } = setup({ data: [] });

    expect((await repo.countByTarget([])).size).toBe(0);
    expect(db.queries).toHaveLength(0);
  });

  it("lists which targets the user has marked", async () => {
    const { db, repo } = setup({ data: [{ review_id: 3 }] });

    const marked = await repo.listMarked("u1", [1, 3]);

    expect([...marked]).toEqual([3]);
    expect(db.callsTo("eq")).toContainEqual(["user_id", "u1"]);
    expect(db.callsTo("in")).toContainEqual(["review_id", [1, 3]]);
  });
});

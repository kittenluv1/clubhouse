/**
 * @jest-environment node
 */
import { DELETE } from "@/app/api/rejectedReviews/[id]/route";
import { createSupabaseMock, makeRequest } from "../helpers/supabaseMock";

let db;
jest.mock("@/app/lib/server-db", () => ({
  createAuthenticatedClient: jest.fn(async () => db),
}));

const params = { params: Promise.resolve({ id: "10" }) };

function setup({ user = { id: "u1" }, review = { id: 10, user_id: "u1" } } = {}) {
  db = createSupabaseMock({
    user,
    respond: ({ calls }) => {
      const isDelete = calls.some((c) => c.method === "delete");
      if (isDelete) return { error: null };
      return review ? { data: review } : { data: null, error: { message: "not found" } };
    },
  });
}

const deleteQueries = () => db.queries.filter((q) => q.calls.some((c) => c.method === "delete"));

describe("DELETE /api/rejectedReviews/[id]", () => {
  it("401 when unauthenticated, without deleting anything", async () => {
    setup({ user: null });

    expect((await DELETE(makeRequest(), params)).status).toBe(401);
    expect(deleteQueries()).toHaveLength(0);
  });

  it("404 when the review does not exist", async () => {
    setup({ review: null });

    expect((await DELETE(makeRequest(), params)).status).toBe(404);
    expect(deleteQueries()).toHaveLength(0);
  });

  it("403 when the review belongs to another user, without deleting it", async () => {
    setup({ review: { id: 10, user_id: "someone-else" } });

    expect((await DELETE(makeRequest(), params)).status).toBe(403);
    expect(deleteQueries()).toHaveLength(0);
  });

  it("deletes the owner's review, scoped to their user id", async () => {
    setup();

    expect((await DELETE(makeRequest(), params)).status).toBe(200);
    const [query] = deleteQueries();
    expect(query.table).toBe("rejected_reviews");
    const filters = query.calls.filter((c) => c.method === "eq").map((c) => c.args);
    expect(filters).toEqual(expect.arrayContaining([["id", "10"], ["user_id", "u1"]]));
  });
});

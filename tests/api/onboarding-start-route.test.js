/**
 * @jest-environment node
 */
import { POST } from "@/app/api/onboarding/start/route";
import { createSupabaseMock, makeRequest } from "../helpers/supabaseMock";

let db;
jest.mock("@/app/lib/server-db", () => ({
  createAuthenticatedClient: jest.fn(async () => db),
}));

const setup = ({ user = { id: "u1" }, rows = [{ id: "u1" }] } = {}) => {
  db = createSupabaseMock({ user, respond: () => ({ data: rows }) });
};

describe("POST /api/onboarding/start", () => {
  it("401 when nobody is signed in", async () => {
    setup({ user: null });
    expect((await POST(makeRequest())).status).toBe(401);
  });

  it("marks onboarding started", async () => {
    setup();
    const res = await POST(makeRequest());

    expect(res.status).toBe(200);
    expect(db.callsTo("update")[0][0]).toEqual({ onboarding_started: true });
  });

  it("404 when the user has no profile row", async () => {
    setup({ rows: [] });
    expect((await POST(makeRequest())).status).toBe(404);
  });
});

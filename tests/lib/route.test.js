/**
 * @jest-environment node
 */
import {
  HttpError,
  readJson,
  withAdmin,
  withUser,
} from "@/app/lib/server/route";
import { createSupabaseMock, makeRequest } from "../helpers/supabaseMock";

let db;
jest.mock("@/app/lib/server-db", () => ({
  createAuthenticatedClient: jest.fn(async () => db),
}));

const ADMIN = "admin@ucla.edu";
beforeEach(() => {
  process.env.NEXT_PUBLIC_ADMIN_EMAIL = ADMIN;
  db = createSupabaseMock({ user: { id: "u1", email: "student@ucla.edu" } });
});

describe("withUser", () => {
  it("responds 401 without calling the handler when nobody is signed in", async () => {
    db = createSupabaseMock({ user: null });
    const handler = jest.fn();

    const res = await withUser(handler)(makeRequest());

    expect(res.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("passes the user, client and awaited params to the handler", async () => {
    const handler = jest.fn(async () => Response.json({ ok: true }));

    await withUser(handler)(makeRequest(), {
      params: Promise.resolve({ id: "5" }),
    });

    expect(handler).toHaveBeenCalledWith(expect.anything(), {
      user: expect.objectContaining({ id: "u1" }),
      supabase: db,
      params: { id: "5" },
    });
  });

  it("turns an HttpError into a JSON response with its status", async () => {
    const res = await withUser(async () => {
      throw new HttpError(404, "Review not found");
    })(makeRequest());

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Review not found" });
  });

  it("hides unexpected error details behind a generic 500", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    const res = await withUser(async () => {
      throw new Error('relation "secret_table" does not exist');
    })(makeRequest());

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
    console.error.mockRestore();
  });
});

describe("withAdmin", () => {
  it("responds 403 for signed-in users who are not the admin", async () => {
    const handler = jest.fn();

    const res = await withAdmin(handler)(makeRequest());

    expect(res.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it("calls the handler for the admin", async () => {
    db = createSupabaseMock({ user: { id: "a1", email: ADMIN } });
    const handler = jest.fn(async () => Response.json({}));

    expect((await withAdmin(handler)(makeRequest())).status).toBe(200);
  });
});

describe("readJson", () => {
  it("rejects a malformed body with a 400 HttpError", async () => {
    await expect(readJson(makeRequest())).rejects.toMatchObject({
      status: 400,
    });
  });

  it("returns the parsed body", async () => {
    expect(await readJson(makeRequest({ body: { a: 1 } }))).toEqual({ a: 1 });
  });
});

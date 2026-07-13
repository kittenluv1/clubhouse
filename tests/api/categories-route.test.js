/**
 * @jest-environment node
 */
import { GET } from "@/app/api/categories/route";
import { supabase } from "@/app/lib/db";

jest.mock("@/app/lib/db", () => ({
  supabase: { from: jest.fn() },
}));

// Wire supabase.from("clubs").select(...).limit(...) to resolve `result`
function mockClubs(result) {
  const limit = jest.fn().mockResolvedValue(result);
  const select = jest.fn(() => ({ limit }));
  supabase.from.mockReturnValue({ select });
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/categories", () => {
  it("returns a deduped, non-empty list of {id,name} categories", async () => {
    mockClubs({
      data: [
        { Category1Name: "Academic", Category2Name: "Sports" },
        { Category1Name: "Academic", Category2Name: null },
        { Category1Name: "", Category2Name: "Arts" },
      ],
      error: null,
    });
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    const names = body.map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(["Academic", "Sports", "Arts"]));
    expect(names.filter((n) => n === "Academic")).toHaveLength(1);
    expect(names).not.toContain("");
    expect(body[0]).toHaveProperty("id");
    expect(body[0]).toHaveProperty("name");
  });

  it("caps the result at 16 categories", async () => {
    const data = Array.from({ length: 40 }, (_, i) => ({
      Category1Name: `Cat${i}`,
      Category2Name: null,
    }));
    mockClubs({ data, error: null });
    const body = await (await GET()).json();
    expect(body.length).toBeLessThanOrEqual(16);
  });

  it("returns 500 when Supabase returns an error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockClubs({ data: null, error: { message: "db down" } });
    expect((await GET()).status).toBe(500);
    console.error.mockRestore();
  });

  it("returns 500 on an unexpected thrown error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    supabase.from.mockImplementation(() => {
      throw new Error("boom");
    });
    expect((await GET()).status).toBe(500);
    console.error.mockRestore();
  });
});

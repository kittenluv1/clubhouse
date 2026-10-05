import { parsePreferences } from "@/app/lib/profiles/preferencesSchema";

describe("parsePreferences", () => {
  it("defaults missing lists to empty", () => {
    expect(parsePreferences({})).toEqual({
      success: true,
      data: { majors: [], minors: [], currentClubs: [], interests: [] },
    });
  });

  it("reads interests from subcategories and ignores broad categories", () => {
    const result = parsePreferences({ subcategories: ["Dance"], broadCategories: ["Arts & Media"] });
    expect(result.data.interests).toEqual(["Dance"]);
  });

  it.each([
    [{ majors: "Biology" }, "majors"],
    [{ minors: [42] }, "minors"],
    [{ currentClubs: ["x".repeat(201)] }, "currentClubs"],
    [{ subcategories: Array(101).fill("a") }, "subcategories"],
  ])("rejects %p", (input, field) => {
    const result = parsePreferences(input);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(field);
  });
});

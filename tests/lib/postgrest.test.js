import { escapeLike, ilikeAnyFilter } from "@/app/lib/server/postgrest";

describe("escapeLike", () => {
  it("leaves plain text unchanged", () => {
    expect(escapeLike("Chess Club")).toBe("Chess Club");
  });

  it("escapes LIKE wildcards so they match literally", () => {
    expect(escapeLike("100%_done\\")).toBe("100\\%\\_done\\\\");
  });

  it("drops PostgREST's * wildcard alias", () => {
    expect(escapeLike("a*b")).toBe("ab");
  });
});

describe("ilikeAnyFilter", () => {
  it("builds one quoted substring condition per column and term", () => {
    expect(ilikeAnyFilter(["Category1Name", "Category2Name"], ["Arts"])).toBe(
      'Category1Name.ilike."%Arts%",Category2Name.ilike."%Arts%"',
    );
  });

  it("keeps reserved characters inside the quoted value", () => {
    // Unquoted, the comma would start a second condition that the caller controls.
    const filter = ilikeAnyFilter(["Category1Name"], ["x%,OrganizationID.gt.0"]);
    expect(filter).toBe('Category1Name.ilike."%x\\\\%,OrganizationID.gt.0%"');
  });

  it("escapes double quotes so a term cannot close the quoted value", () => {
    expect(ilikeAnyFilter(["Category1Name"], ['a"),or(b'])).toBe('Category1Name.ilike."%a\\"),or(b%"');
  });

  it("skips empty terms", () => {
    expect(ilikeAnyFilter(["Category1Name"], ["", "  ", "Arts"])).toBe('Category1Name.ilike."%Arts%"');
  });
});

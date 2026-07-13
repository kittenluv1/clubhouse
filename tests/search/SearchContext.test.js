import { render, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SearchProvider, useSearch } from "@/app/context/SearchContext";

// --- next/navigation mocks ---
const mockPush = jest.fn();
let mockPathname = "/clubs";
let searchParamValues = {};

// Stable searchParams reference so the provider's [searchParams] effect
// does not re-run on every render (a new object each call would loop forever).
const stableSearchParams = {
  get: (key) => searchParamValues[key] ?? null,
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
  useSearchParams: () => stableSearchParams,
}));

// Capture the context value from within a provider
function renderSearch() {
  const captured = {};
  function Consumer() {
    Object.assign(captured, useSearch());
    return null;
  }
  render(
    <SearchProvider>
      <Consumer />
    </SearchProvider>
  );
  return captured;
}

beforeEach(() => {
  mockPush.mockClear();
  mockPathname = "/clubs";
  searchParamValues = {};
});

describe("useSearch", () => {
  it("throws when used outside of a SearchProvider", () => {
    function Orphan() {
      useSearch();
      return null;
    }
    // Silence the expected React error boundary logging
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow(
      "useSearch must be used within a SearchProvider"
    );
    spy.mockRestore();
  });
});

describe("SearchProvider URL initialization", () => {
  it("hydrates searchTerm from the ?name= param", () => {
    searchParamValues = { name: "robotics" };
    const ctx = renderSearch();
    expect(ctx.searchTerm).toBe("robotics");
  });

  it("hydrates singleCategory from the ?category= param", () => {
    searchParamValues = { category: "Academic" };
    const ctx = renderSearch();
    expect(ctx.singleCategory).toBe("Academic");
  });

  it("parses the ?categories= param into an array", () => {
    searchParamValues = { categories: "Academic,Sports" };
    const ctx = renderSearch();
    expect(ctx.selectedCategories).toEqual(["Academic", "Sports"]);
  });

  it("reflects a hydrated name search via getCurrentSearchState", () => {
    searchParamValues = { name: "debate" };
    const ctx = renderSearch();
    expect(ctx.getCurrentSearchState()).toEqual({
      type: "name",
      value: "debate",
    });
  });
});

describe("SearchProvider search actions", () => {
  it("starts with empty search state", () => {
    const ctx = renderSearch();
    expect(ctx.searchTerm).toBe("");
    expect(ctx.singleCategory).toBe("");
    expect(ctx.selectedCategories).toEqual([]);
  });

  it("searchByName pushes an encoded name query", () => {
    const ctx = renderSearch();
    act(() => ctx.searchByName("chess club"));
    expect(mockPush).toHaveBeenCalledWith("/clubs?name=chess%20club");
  });

  it("searchByName routes to /clubs when the term is empty", () => {
    const ctx = renderSearch();
    act(() => ctx.searchByName("   "));
    expect(mockPush).toHaveBeenCalledWith("/clubs");
  });

  it("searchBySingleCategory pushes an encoded category query", () => {
    const ctx = renderSearch();
    act(() => ctx.searchBySingleCategory("Arts & Music"));
    expect(mockPush).toHaveBeenCalledWith(
      "/clubs?category=Arts%20%26%20Music"
    );
  });

  it("searchByCategories pushes a comma-joined encoded query", () => {
    const ctx = renderSearch();
    act(() => ctx.searchByCategories(["Academic", "Sports"]));
    expect(mockPush).toHaveBeenCalledWith(
      `/clubs?categories=${encodeURIComponent("Academic,Sports")}`
    );
  });

  it("searchByCategories routes to /clubs when the list is empty", () => {
    const ctx = renderSearch();
    act(() => ctx.searchByCategories([]));
    expect(mockPush).toHaveBeenCalledWith("/clubs");
  });

  it("exposes isOnClubsPage based on the pathname", () => {
    mockPathname = "/clubs";
    expect(renderSearch().isOnClubsPage).toBe(true);
    mockPathname = "/profile";
    expect(renderSearch().isOnClubsPage).toBe(false);
  });
});

describe("getCurrentSearchState", () => {
  it("reports a name search after searchByName", () => {
    const ctx = renderSearch();
    act(() => ctx.searchByName("debate"));
    expect(ctx.getCurrentSearchState()).toEqual({
      type: "name",
      value: "debate",
    });
  });

  it("reports a single category search after searchBySingleCategory", () => {
    const ctx = renderSearch();
    act(() => ctx.searchBySingleCategory("Academic"));
    expect(ctx.getCurrentSearchState()).toEqual({
      type: "category",
      value: "Academic",
    });
  });

  it("reports a multi-category search after searchByCategories", () => {
    const ctx = renderSearch();
    act(() => ctx.searchByCategories(["Academic", "Sports"]));
    expect(ctx.getCurrentSearchState()).toEqual({
      type: "categories",
      value: ["Academic", "Sports"],
    });
  });

  it("clearAllSearch resets back to no active search", () => {
    const ctx = renderSearch();
    act(() => ctx.searchByName("debate"));
    act(() => ctx.clearAllSearch());
    expect(ctx.getCurrentSearchState()).toEqual({ type: "none", value: null });
  });

  it("reports no active search by default", () => {
    const ctx = renderSearch();
    expect(ctx.getCurrentSearchState()).toEqual({ type: "none", value: null });
  });
});

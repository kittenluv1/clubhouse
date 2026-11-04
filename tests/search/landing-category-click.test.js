import { render, fireEvent, act, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SearchProvider, useSearch } from "@/app/context/SearchContext";
import Home from "@/app/page";

// --- next/navigation mocks ---
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/",
  useSearchParams: () => ({ get: () => null, has: () => false }),
}));

// The landing page's search bar and carousel fetch data; they are not under test.
jest.mock("@/app/components/search-bar", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/app/components/ClubCarousel", () => ({
  __esModule: true,
  default: () => null,
}));

beforeEach(() => {
  mockPush.mockClear();
});

describe("landing page category buttons", () => {
  it("replaces any previous search with only the clicked category", () => {
    const captured = {};
    function Consumer() {
      Object.assign(captured, useSearch());
      return null;
    }
    render(
      <SearchProvider>
        <Consumer />
        <Home />
      </SearchProvider>,
    );

    // Leave a stale search in place, as if the user had searched on /clubs first.
    act(() => {
      captured.setSearchTerm("chess club");
      captured.setSelectedCategories(["Stale Category"]);
    });

    const categoryButton = screen
      .getAllByRole("button")
      .find((button) => button.textContent !== "More Categories >");
    const category = categoryButton.textContent;

    fireEvent.click(categoryButton);

    expect(captured.searchTerm).toBe("");
    expect(captured.singleCategory).toBe("");
    expect(captured.selectedCategories).toEqual([category]);
    expect(mockPush).toHaveBeenCalledWith(
      `/clubs?categories=${encodeURIComponent(category)}`,
    );
  });
});

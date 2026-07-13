import { handleCategoryClick, renderRatingStars } from "@/app/lib/utils/clubCardHelpers";

// Helper to pull the `src` prop out of each rendered <img> React element
const srcs = (stars) => stars.map((el) => el.props.src);

describe("handleCategoryClick", () => {
  it("prevents default and stops propagation on the event", () => {
    const router = { push: jest.fn() };
    const e = { preventDefault: jest.fn(), stopPropagation: jest.fn() };

    handleCategoryClick(router, e, "Academic");

    expect(e.preventDefault).toHaveBeenCalledTimes(1);
    expect(e.stopPropagation).toHaveBeenCalledTimes(1);
  });

  it("pushes to the clubs route with the encoded category and discover anchor", () => {
    const router = { push: jest.fn() };
    const e = { preventDefault: jest.fn(), stopPropagation: jest.fn() };

    handleCategoryClick(router, e, "Arts & Music");

    expect(router.push).toHaveBeenCalledWith(
      "/clubs?categories=Arts%20%26%20Music#discover"
    );
  });

  it("encodes special characters so the URL stays valid", () => {
    const router = { push: jest.fn() };
    const e = { preventDefault: jest.fn(), stopPropagation: jest.fn() };

    handleCategoryClick(router, e, "A/B?C");

    expect(router.push).toHaveBeenCalledWith(
      `/clubs?categories=${encodeURIComponent("A/B?C")}#discover`
    );
  });
});

describe("renderRatingStars", () => {
  it("always returns exactly 5 star elements", () => {
    expect(renderRatingStars(0)).toHaveLength(5);
    expect(renderRatingStars(3)).toHaveLength(5);
    expect(renderRatingStars(5)).toHaveLength(5);
  });

  it("renders all unfilled stars for a zero rating", () => {
    const stars = renderRatingStars(0);
    expect(srcs(stars)).toEqual(
      Array(5).fill("interactions/reviewStarUnfilled.svg")
    );
  });

  it("renders all filled stars for a perfect rating", () => {
    const stars = renderRatingStars(5);
    expect(srcs(stars)).toEqual(
      Array(5).fill("interactions/reviewStarFilled.svg")
    );
  });

  it("renders the correct number of filled stars for a whole rating", () => {
    const stars = renderRatingStars(3);
    const values = srcs(stars);
    expect(values.filter((s) => s === "interactions/reviewStarFilled.svg")).toHaveLength(3);
    expect(values.filter((s) => s === "interactions/reviewStarUnfilled.svg")).toHaveLength(2);
  });

  it("renders a half star when the decimal falls between 0.2 and 0.8", () => {
    const stars = renderRatingStars(3.5);
    const values = srcs(stars);
    expect(values).toContain("interactions/reviewStarHalf.svg");
    expect(values.filter((s) => s === "interactions/reviewStarHalf.svg")).toHaveLength(1);
  });

  it("does not render a half star when the decimal is below 0.2", () => {
    const values = srcs(renderRatingStars(3.1));
    expect(values).not.toContain("interactions/reviewStarHalf.svg");
  });

  it("treats a null/undefined rating as zero", () => {
    expect(srcs(renderRatingStars(null))).toEqual(
      Array(5).fill("interactions/reviewStarUnfilled.svg")
    );
    expect(srcs(renderRatingStars(undefined))).toEqual(
      Array(5).fill("interactions/reviewStarUnfilled.svg")
    );
  });

  it("gives every star a unique key", () => {
    const keys = renderRatingStars(4).map((el) => el.key);
    expect(new Set(keys).size).toBe(5);
  });
});

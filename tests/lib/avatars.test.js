import { getAvatarUrl, AVATAR_COUNT } from "@/app/lib/avatars";

describe("avatars", () => {
  it("exposes an avatar count of 7", () => {
    expect(AVATAR_COUNT).toBe(7);
  });

  it("returns the matching svg path for each valid id", () => {
    for (let id = 1; id <= AVATAR_COUNT; id++) {
      expect(getAvatarUrl(id)).toBe(`/avatars/${id}.svg`);
    }
  });

  it("falls back to avatar 1 for ids below the valid range", () => {
    expect(getAvatarUrl(0)).toBe("/avatars/1.svg");
    expect(getAvatarUrl(-3)).toBe("/avatars/1.svg");
  });

  it("falls back to avatar 1 for ids above the valid range", () => {
    expect(getAvatarUrl(8)).toBe("/avatars/1.svg");
    expect(getAvatarUrl(100)).toBe("/avatars/1.svg");
  });

  it("falls back to avatar 1 for non-integer or missing values", () => {
    expect(getAvatarUrl(2.5)).toBe("/avatars/1.svg");
    expect(getAvatarUrl("3")).toBe("/avatars/1.svg");
    expect(getAvatarUrl(null)).toBe("/avatars/1.svg");
    expect(getAvatarUrl(undefined)).toBe("/avatars/1.svg");
    expect(getAvatarUrl(NaN)).toBe("/avatars/1.svg");
  });
});

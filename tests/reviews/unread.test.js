import { countUnreadRejected } from "@/app/lib/reviews/unread";

const rejected = (updated_at) => ({ updated_at });

describe("countUnreadRejected", () => {
  it("counts every rejection when the user never looked", () => {
    expect(countUnreadRejected([rejected("2026-01-01T00:00:00Z"), rejected("2026-01-02T00:00:00Z")], null)).toBe(2);
  });

  it("counts only rejections after the last view", () => {
    const reviews = [rejected("2026-01-01T00:00:00Z"), rejected("2026-01-03T00:00:00Z")];
    expect(countUnreadRejected(reviews, "2026-01-02T00:00:00Z")).toBe(1);
  });

  it("reads timestamps without a zone as UTC", () => {
    // 10:00 UTC is after 09:00Z; parsed as local time it could land either side.
    expect(countUnreadRejected([rejected("2026-01-02T10:00:00")], "2026-01-02T09:00:00Z")).toBe(1);
    expect(countUnreadRejected([rejected("2026-01-02T08:00:00")], "2026-01-02T09:00:00Z")).toBe(0);
  });

  it("respects explicit offsets", () => {
    expect(countUnreadRejected([rejected("2026-01-02T10:00:00+02:00")], "2026-01-02T09:00:00Z")).toBe(0);
    expect(countUnreadRejected([rejected("2026-01-02T10:00:00-02:00")], "2026-01-02T09:00:00Z")).toBe(1);
  });

  it("counts rejections with no timestamp as unread", () => {
    expect(countUnreadRejected([rejected(null)], "2026-01-02T09:00:00Z")).toBe(1);
  });
});

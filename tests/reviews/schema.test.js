import { parseReviewInput } from "@/app/lib/reviews/schema";

const valid = {
  club_id: 7,
  club_name: "Chess Club",
  review_text: "  Great people.  ",
  membership_start_quarter: "Fall",
  membership_start_year: 2024,
  membership_end_quarter: "Spring",
  membership_end_year: 2025,
  time_commitment_rating: 3,
  inclusivity_rating: 4.5,
  social_community_rating: 5,
  competitiveness_rating: 1,
  overall_satisfaction: 0.5,
  is_current_member: true,
};

const errorFor = (input) => {
  const result = parseReviewInput(input);
  expect(result.success).toBe(false);
  return result.error;
};

describe("parseReviewInput", () => {
  it("accepts a complete review and trims the text", () => {
    const result = parseReviewInput(valid);
    expect(result.success).toBe(true);
    expect(result.data.review_text).toBe("Great people.");
  });

  it("drops fields that are not part of a review", () => {
    const result = parseReviewInput({
      ...valid,
      user_id: "victim",
      user_alias: "@Admin",
      id: 1,
    });
    expect(result.data).not.toHaveProperty("user_id");
    expect(result.data).not.toHaveProperty("user_alias");
    expect(result.data).not.toHaveProperty("id");
  });

  it("drops is_current_member, which the review tables do not store", () => {
    expect(parseReviewInput(valid).data).not.toHaveProperty(
      "is_current_member",
    );
  });

  it.each([
    ["overall_satisfaction", 0],
    ["overall_satisfaction", 5.5],
    ["overall_satisfaction", 3.3],
    ["inclusivity_rating", 0.5],
    ["time_commitment_rating", "3"],
  ])("rejects %s = %p", (field, value) => {
    expect(errorFor({ ...valid, [field]: value })).toMatch(field);
  });

  it("rejects blank review text", () => {
    expect(errorFor({ ...valid, review_text: "   " })).toMatch("review_text");
  });

  it("rejects review text over 5000 characters", () => {
    expect(errorFor({ ...valid, review_text: "a".repeat(5001) })).toMatch(
      "review_text",
    );
  });

  it("rejects an unknown quarter", () => {
    expect(errorFor({ ...valid, membership_start_quarter: "Autumn" })).toMatch(
      "membership_start_quarter",
    );
  });

  it("rejects a membership that ends before it starts", () => {
    expect(
      errorFor({
        ...valid,
        membership_start_year: 2025,
        membership_end_quarter: "Winter",
        membership_end_year: 2025,
      }),
    ).toMatch(/end/i);
  });

  it("accepts a membership that starts and ends in the same quarter", () => {
    const sameQuarter = {
      ...valid,
      membership_end_quarter: "Fall",
      membership_end_year: 2024,
    };
    expect(parseReviewInput(sameQuarter).success).toBe(true);
  });

  it("rejects a missing club", () => {
    const { club_id, ...rest } = valid;
    expect(errorFor(rest)).toMatch("club_id");
  });
});

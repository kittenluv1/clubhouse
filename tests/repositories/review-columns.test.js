/**
 * @jest-environment node
 */
// Guards against the review code drifting from the review tables' columns:
// writing or selecting a column that does not exist fails every request.
import { parseReviewInput } from "@/app/lib/reviews/schema";
import {
  PUBLIC_REVIEW_FIELDS,
  REVIEW_TABLE_COLUMNS,
} from "@/app/lib/server/repositories/reviews";

const fullInput = {
  club_id: "V3Q2-L6L95",
  club_name: "Chess Club",
  review_text: "Great",
  membership_start_quarter: "Fall",
  membership_start_year: 2024,
  membership_end_quarter: "Spring",
  membership_end_year: 2025,
  time_commitment_rating: 3,
  inclusivity_rating: 4,
  social_community_rating: 5,
  competitiveness_rating: 2,
  overall_satisfaction: 4,
  is_current_member: true,
};

describe("review columns", () => {
  it("validated review input only contains stored columns", () => {
    const { success, data } = parseReviewInput(fullInput);
    expect(success).toBe(true);
    for (const key of Object.keys(data))
      expect(REVIEW_TABLE_COLUMNS).toContain(key);
  });

  it("public review fields are stored columns (plus the avatar join)", () => {
    for (const field of PUBLIC_REVIEW_FIELDS.filter((f) => f !== "profiles")) {
      expect(REVIEW_TABLE_COLUMNS).toContain(field);
    }
  });
});

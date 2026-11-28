/**
 * @jest-environment node
 */
import { sendEmail } from "@/app/lib/server/email/send";
import {
  escapeHtml,
  sendReviewApprovedEmail,
  sendReviewRejectedEmail,
  sendReviewSubmittedEmail,
  siteUrl,
} from "@/app/lib/server/email/reviewEmails";

jest.mock("@/app/lib/server/email/send", () => ({
  sendEmail: jest.fn(async () => true),
}));

const review = {
  club_name: `<b>Chess</b> & "Go"`,
  review_text: "<script>alert(1)</script>\nSecond line",
  overall_satisfaction: 4,
  user_email: "student@ucla.edu",
  membership_start_quarter: "Fall",
  membership_start_year: 2025,
  membership_end_quarter: "Spring",
  membership_end_year: 2026,
  time_commitment_rating: 3,
  inclusivity_rating: 5,
  social_community_rating: 4,
  competitiveness_rating: 2,
};

const sent = () => sendEmail.mock.calls[0][0];

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NEXT_PUBLIC_ADMIN_EMAIL = "admin@ucla.edu";
  delete process.env.SITE_URL;
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  process.env.VERCEL_ENV = "production";
});

describe("siteUrl", () => {
  it("prefers SITE_URL without a trailing slash", () => {
    process.env.SITE_URL = "https://clubs.example.com/";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "www.example.com";
    expect(siteUrl()).toBe("https://clubs.example.com");
  });

  it("falls back to the Vercel production domain, then localhost", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "www.example.com";
    expect(siteUrl()).toBe("https://www.example.com");

    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("is used for the links in the emails", async () => {
    process.env.SITE_URL = "https://clubs.example.com";
    await sendReviewApprovedEmail(review);
    expect(sent().html).toContain(
      'href="https://clubs.example.com/clubs/%3Cb%3EChess%3C%2Fb%3E%20%26%20%22Go%22"',
    );
  });
});

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;",
    );
  });
});

describe("review emails", () => {
  it("sends the submitted emails to the admin and to the reviewer", async () => {
    await sendReviewSubmittedEmail(review);
    const [admin, reviewer] = sendEmail.mock.calls.map(([e]) => e);
    expect(admin.to).toBe("admin@ucla.edu");
    expect(admin.subject).toBe("New Review Pending Approval");
    expect(admin.html).not.toContain("student@ucla.edu");
    expect(reviewer.to).toBe("student@ucla.edu");
    expect(reviewer.subject).toBe(
      `Thanks for submitting your review for ${review.club_name}`,
    );
  });

  it("reports the submitted emails as sent only if both were", async () => {
    sendEmail.mockResolvedValueOnce(false);
    expect(await sendReviewSubmittedEmail(review)).toBe(false);
  });

  it("sends approved and rejected emails to the reviewer on the row", async () => {
    await sendReviewApprovedEmail(review);
    await sendReviewRejectedEmail(review, { reasons: [], message: "" });
    expect(sendEmail.mock.calls.map(([e]) => [e.to, e.subject])).toEqual([
      ["student@ucla.edu", `Review for ${review.club_name} Approved!`],
      ["student@ucla.edu", `Your review for ${review.club_name} was rejected`],
    ]);
  });

  it("marks subjects outside production", async () => {
    process.env.VERCEL_ENV = "preview";
    await sendReviewApprovedEmail(review);
    expect(sent().subject).toMatch(/^\[DEV\] Review for/);
  });

  it.each([
    ["submitted", () => sendReviewSubmittedEmail(review)],
    [
      "rejected",
      () =>
        sendReviewRejectedEmail(review, {
          reasons: ["<i>reason</i>"],
          message: "<img src=x onerror=alert(1)>",
        }),
    ],
  ])("escapes user content in the %s email", async (_name, send) => {
    await send();
    const { html } = sent();
    expect(html).not.toMatch(/<script|<b>Chess|<i>reason|<img/);
    expect(html).toContain("&lt;b&gt;Chess&lt;/b&gt; &amp; &quot;Go&quot;");
  });

  it("escapes user content in the approved email", async () => {
    await sendReviewApprovedEmail(review);
    expect(sent().html).not.toMatch(/<b>|"Go"/);
    expect(sent().html).toContain(
      "&lt;b&gt;Chess&lt;/b&gt; &amp; &quot;Go&quot;",
    );
  });

  it("shows the admin link without the protocol", async () => {
    process.env.SITE_URL = "https://www.clubhouseucla.com";
    await sendReviewSubmittedEmail(review);
    expect(sent().html).toContain(
      '<a href="https://www.clubhouseucla.com/admin">www.clubhouseucla.com/admin</a>',
    );
  });

  it("includes the reasons, the moderator note and the full review", async () => {
    await sendReviewRejectedEmail(review, {
      reasons: ["Too brief"],
      message: "Please add detail",
    });
    const { html } = sent();
    expect(html).toContain("<li>Too brief</li>");
    expect(html).toContain("Please add detail");
    expect(html).toContain("Fall 2025 – Spring 2026");
    expect(html).toContain("<strong>Diversity Rating:</strong> 5");
  });

  it("returns whether the email was sent", async () => {
    sendEmail.mockResolvedValueOnce(false);
    expect(await sendReviewApprovedEmail(review)).toBe(false);
  });
});

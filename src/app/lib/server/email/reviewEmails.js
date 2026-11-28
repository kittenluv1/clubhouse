import { sendEmail } from "@/app/lib/server/email/send";

export function siteUrl() {
  const { SITE_URL, VERCEL_PROJECT_PRODUCTION_URL } = process.env;
  if (SITE_URL) return SITE_URL.replace(/\/+$/, "");
  if (VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * @typedef {{
 *   club_name: string, review_text: string, overall_satisfaction: number,
 *   user_email?: string | null,
 *   membership_start_quarter?: string, membership_start_year?: number,
 *   membership_end_quarter?: string, membership_end_year?: number,
 *   time_commitment_rating?: number, inclusivity_rating?: number,
 *   social_community_rating?: number, competitiveness_rating?: number,
 * }} EmailReview
 */

/** @param {unknown} value */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** @param {string} text */
const paragraphs = (text) =>
  escapeHtml(text)
    .split(/\r?\n/)
    .map((line) => `<p>${line}</p>`)
    .join("");

/** @param {string} subject */
const withEnv = (subject) =>
  process.env.VERCEL_ENV === "production" ? subject : `[DEV] ${subject}`;

/** @param {EmailReview} review */
export async function sendReviewSubmittedEmail(review) {
  const site = siteUrl();
  const club = escapeHtml(review.club_name);
  const results = await Promise.all([
    sendEmail({
      to: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      subject: withEnv("New Review Pending Approval"),
      html: [
        `<p>A new club review has been received!</p>`,
        `<p>Please proceed to <a href="${site}/admin">${site.replace(/^https?:\/\//, "")}/admin</a> and sign in with the official Clubhouse email to approve or disapprove pending reviews.</p>`,
        `<p><strong>Club:</strong> ${club}</p>`,
        `<p><strong>Overall Rating:</strong> ${escapeHtml(review.overall_satisfaction)}</p>`,
        `<p><strong>Review:</strong> ${escapeHtml(review.review_text).replace(/\r?\n/g, "<br>")}</p>`,
      ].join(""),
    }),
    sendEmail({
      to: review.user_email,
      subject: withEnv(
        `Thanks for submitting your review for ${review.club_name}`,
      ),
      html: [
        `<p>Thank you for submitting your review to ClubHouse.</p>`,
        `<p>All submissions are reviewed by our team to ensure it meets our <a href="${site}/community-guidelines">Community Guidelines</a>.</p>`,
        `<p>We've received yours and will review it shortly.</p>`,
      ].join(""),
    }),
  ]);
  return results.every(Boolean);
}

/** @param {EmailReview} review */
export function sendReviewApprovedEmail(review) {
  const clubUrl = `${siteUrl()}/clubs/${encodeURIComponent(review.club_name)}`;
  return sendEmail({
    to: review.user_email,
    subject: withEnv(`Review for ${review.club_name} Approved!`),
    html: [
      `<p>Congratulations! your review for ${escapeHtml(review.club_name)} has been approved.</p>`,
      `<p>Click <a href="${escapeHtml(clubUrl)}">here</a> to see your review!</p>`,
      `<p>Thank you for contributing to the ClubHouse community.</p>`,
    ].join(""),
  });
}

/**
 * @param {EmailReview} review
 * @param {{ reasons: string[], message: string }} feedback
 */
export function sendReviewRejectedEmail(review, { reasons, message }) {
  const e = escapeHtml;
  const issues = reasons.length
    ? `<p>In particular, we believe that your review had the following issue(s):</p><ul>${reasons.map((r) => `<li>${e(r)}</li>`).join("")}</ul>`
    : "";
  const note = message
    ? `<p><strong>Additional note from the moderation team:</strong></p>${paragraphs(message)}`
    : "";

  return sendEmail({
    to: review.user_email,
    subject: withEnv(`Your review for ${review.club_name} was rejected`),
    html: [
      `<p>Thank you for sharing your feedback on ClubHouse! Unfortunately, your review wasn’t approved because it didn’t meet one or more of our community or content guidelines:</p>`,
      `<h3>Clubhouse Community Guidelines</h3>`,
      `<p>To ensure ClubHouse remains a safe, respectful, and helpful space for everyone, please follow these guidelines when posting or interacting on the platform:</p>`,
      `<ul>`,
      `<li><strong>Be Specific and Relevant</strong>: Share clear, helpful insights about your experience with the club. Reviews that are too brief, vague, or off-topic may be rejected to keep feedback meaningful for all students.</li>`,
      `<li><strong>Respect Others</strong>: Do not name or identify individuals, including club leaders or members. Discriminatory, harassing, or hateful language of any kind is strictly prohibited.</li>`,
      `<li><strong>Stay On Topic</strong>: Ensure that all content is relevant to the club or organization being reviewed. Irrelevant or repetitive posts may be removed to maintain clarity and usefulness.</li>`,
      `</ul>`,
      issues,
      note,
      `<p><strong>Your review:</strong></p>`,
      `<p><strong>Club:</strong> ${e(review.club_name)}</p>`,
      `<p><strong>Start & End Quarter:</strong> ${e(review.membership_start_quarter)} ${e(review.membership_start_year)} – ${e(review.membership_end_quarter)} ${e(review.membership_end_year)}</p>`,
      `<p><strong>Time Commitment Rating:</strong> ${e(review.time_commitment_rating)}</p>`,
      `<p><strong>Diversity Rating:</strong> ${e(review.inclusivity_rating)}</p>`,
      `<p><strong>Social Community Rating:</strong> ${e(review.social_community_rating)}</p>`,
      `<p><strong>Competitiveness Rating:</strong> ${e(review.competitiveness_rating)}</p>`,
      `<p><strong>Overall Satisfaction:</strong> ${e(review.overall_satisfaction)}</p>`,
      paragraphs(review.review_text),
      `<div style="margin-top: 20px;"><p><strong>Click <a href="${siteUrl()}/profile">here</a> to edit and resubmit your review.</strong></p></div>`,
    ].join(""),
  });
}

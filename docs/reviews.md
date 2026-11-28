# Reviews

## Club Ratings

Only **approved** reviews count. The trigger `update_club_review_stats()` on `reviews` keeps the totals on `clubs` in step with them, so approvals, edits, rejections and deletes all update the ratings.

### Database Columns on `clubs` Table

| Column                                                                                                      | Type              | Description                                                           |
| ----------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------- |
| `total_num_reviews`                                                                                         | integer           | Number of approved reviews                                            |
| `satisfaction_sum`, `time_commitment_sum`, `inclusivity_sum`, `social_community_sum`, `competitiveness_sum` | float (unrounded) | Sums of the approved reviews' ratings                                 |
| `average_*`                                                                                                 | generated column  | `sum / total_num_reviews`, rounded; null when the club has no reviews |

## Moderation

Every review is one row in `reviews`. Its `status` is `pending`, `approved` or `rejected`, and each change of state is one update to that row, so a review keeps its id, alias, `created_at` and likes for its whole life.

| Action  | Route                                                              | Change                                                                                                              |
| ------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Submit  | `POST /api/reviews`                                                | Insert with `status = 'pending'`                                                                                    |
| Approve | `POST /api/pendingReviews` (`approve: true`)                       | `pending → approved`                                                                                                |
| Reject  | `POST /api/pendingReviews` (`approve: false`)                      | `pending → rejected`, sets `updated_at`                                                                             |
| Edit    | `POST /api/approvedReviews/[id]`, `POST /api/rejectedReviews/[id]` | New content, `approved/rejected → pending`. The review leaves the club page and ratings until it is approved again. |
| Delete  | `DELETE /api/rejectedReviews/[id]`                                 | Owners can delete rejected reviews only                                                                             |

Moderating a review that is no longer pending returns 409. The admin panel (`/admin`) lists pending reviews by when they were last submitted. Only `NEXT_PUBLIC_ADMIN_EMAIL` can use it: `withAdmin` checks the user on the server, and the admin routes use the admin's own session, so RLS checks again.

### Emails

The API routes send emails through the **Resend API** after the database write succeeds. The browser never sends email, and recipients come from the database, never the request. No database trigger sends email.

| When           | Route                                          | Recipient          |
| -------------- | ---------------------------------------------- | ------------------ |
| Submit or edit | `POST /api/reviews`, `POST /api/*Reviews/[id]` | Admin and reviewer |
| Approve        | `POST /api/pendingReviews`                     | Reviewer           |
| Reject         | `POST /api/pendingReviews` (with reasons)      | Reviewer           |

Code lives in `src/app/lib/server/email/`. Without `RESEND_API_KEY` and `EMAIL_FROM` (local dev, tests) emails are skipped. Links use `SITE_URL`, falling back to the Vercel production domain. Outside production (`VERCEL_ENV`), subjects start with `[DEV]`. A failed email never fails the request; `/api/pendingReviews` returns `emailSent: false` and the admin page warns the moderator.

Rejection reasons must be one of `PRESET_REJECTION_REASONS` (`src/app/lib/reviews/rejection.js`). They are only emailed, not stored. A rejected review counts as unread on the profile page while its `updated_at` is later than `profiles.last_viewed_rejected_at`.

### Row Level Security (RLS)

On `reviews`, signed-in users can:

- read their own reviews in any status
- insert their own reviews as `pending`
- update their own `approved` or `rejected` reviews, only to `pending`
- delete their own `rejected` reviews

The admin account can also read every review and change a `pending` review to `approved` or `rejected`.

A trigger stops users changing a review's id, author or `created_at`, and sets the timestamps on the server. Anonymous visitors cannot read `reviews` at all. The public club page reads approved reviews through the service role and returns only `PUBLIC_REVIEW_FIELDS`, never `user_email` or `user_id`. A review can only be liked while it is approved.

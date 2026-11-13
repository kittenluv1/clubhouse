# Reviews

## Rating Calculation

### User Flow

1. User creates a club review
2. Update count of total reviews for the club
3. Calculate overall satisfaction as `sum of all ratings / total number of reviews`

### Implementation

The trigger function `update_club_review_stats()` (AFTER INSERT, UPDATE and DELETE on `reviews`) keeps the totals on `clubs` in step with the **approved** reviews. On every change it subtracts the old row if it was approved and adds the new row if it is approved, so approvals, edits that send a review back to pending, rating edits, club changes and deletes all keep the totals right. The function is defined in `supabase/migrations/20261104_1_review_status_expand.sql`.

### Database Columns on `clubs` Table

| Column                                                                                                      | Type              | Description                                                           |
| ----------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------- |
| `total_num_reviews`                                                                                         | integer           | Number of approved reviews                                            |
| `satisfaction_sum`, `time_commitment_sum`, `inclusivity_sum`, `social_community_sum`, `competitiveness_sum` | float (unrounded) | Sums of the approved reviews' ratings                                 |
| `average_*`                                                                                                 | generated column  | `sum / total_num_reviews`, rounded; null when the club has no reviews |

## Sorting Reviews

### Frontend (State Management)

- `useState` tracks the user-selected `sortType`, defaulting to `"Highest Rating"`
- A dropdown menu provides 3 options: **Highest Rating**, **Most Reviewed**, **A-Z**
- Changing the dropdown updates state, which re-renders search results and resets to page 1
- State tracking happens in `page.js` under `/clubs`
- The `sortType` is passed to the clubs API as a search param

### Backend (API)

The clubs API retrieves `sortType` from the URL (default: `"Highest Rating"`):

| Sort Type      | Column                 | Order      | Notes                                                                                          |
| -------------- | ---------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| Highest Rating | `average_satisfaction` | Descending | Uses `nullsFirst: false` so clubs with no reviews appear last (nulls default to showing first) |
| Most Reviewed  | `total_num_reviews`    | Descending |                                                                                                |
| A-Z            | `OrganizationName`     | Ascending  |                                                                                                |

The sort conditions are passed into the Supabase query request.

## Moderation

Every review is one row in `reviews`. Its `status` is `pending`, `approved` or `rejected`, and each change of state is one update to that row, so a review keeps its id, alias, `created_at` and likes for its whole life.

| Action  | Route                                                              | Change                                                                                                              |
| ------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Submit  | `POST /api/reviews`                                                | Insert with `status = 'pending'`                                                                                    |
| Approve | `POST /api/pendingReviews` (`approve: true`)                       | `pending → approved`                                                                                                |
| Reject  | `POST /api/pendingReviews` (`approve: false`)                      | `pending → rejected`, sets `updated_at`                                                                             |
| Edit    | `POST /api/approvedReviews/[id]`, `POST /api/rejectedReviews/[id]` | New content, `approved/rejected → pending`. The review leaves the club page and ratings until it is approved again. |
| Delete  | `DELETE /api/rejectedReviews/[id]`                                 | Owners can delete rejected reviews only                                                                             |

Moderating a review that is no longer pending returns 409.

### Admin Panel

- **URL:** `www.clubhouseucla.com/admin`
- **Access:** only `NEXT_PUBLIC_ADMIN_EMAIL`. `withAdmin` checks the signed-in user on the server, and the admin routes then use the admin's own session, so RLS checks it again.
- Lists pending reviews ordered by `updated_at`, which is when the review was last submitted.

### Emails

Emails are sent from the browser after the API call succeeds, through Supabase edge functions that use the **Resend API** (free plan: 100 emails a day). No database trigger sends email.

| When           | Page                                  | Edge function                |
| -------------- | ------------------------------------- | ---------------------------- |
| Submit or edit | `/review`, `/review/edit/[id]`        | `send-review-email`          |
| Approve        | `/admin`                              | `send-user-approval-email`   |
| Reject         | `/admin` (with the rejection reasons) | `send-user-disapprove-email` |

Rejection reasons are only emailed, not stored. A rejected review counts as unread on the profile page while its `updated_at` is later than `profiles.last_viewed_rejected_at`.

### Row Level Security (RLS)

On `reviews`, signed-in users can:

- read their own reviews in any status
- insert their own reviews as `pending`
- update their own `approved` or `rejected` reviews, only to `pending`
- delete their own `rejected` reviews

The admin (`clubhouseucla@gmail.com`) can also read every review and change a `pending` review to `approved` or `rejected`.

A trigger stops users changing `id`, `user_id`, `user_email`, `user_alias` or `created_at`, and sets `updated_at` (and `created_at` on insert) on the server. Anonymous visitors cannot read `reviews` at all. The public club page reads approved reviews through the service role and returns only `PUBLIC_REVIEW_FIELDS`, never `user_email` or `user_id`. A review can only be liked while it is approved.

The old `pending_reviews` and `rejected_reviews` tables are read-only after the import and are dropped two weeks later.

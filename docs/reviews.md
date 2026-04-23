# Reviews

## Rating Calculation

### User Flow

1. User creates a club review
2. Update count of total reviews for the club
3. Calculate overall satisfaction as `sum of all ratings / total number of reviews`

### Implementation

A **private SQL function** `update_club_review_stats()` handles the rating logic (defined under "Update Club Overall Ratings" in Supabase).

**Why a SQL function?** Ensures all updates to the `clubs` table happen only when a review is successfully posted, reducing the need to manually update in the repo.

### Database Columns on `clubs` Table

| Column | Type | Description |
|--------|------|-------------|
| `satisfaction_sum` | float (unrounded) | Sum of all overall satisfaction ratings. Kept unrounded to preserve accuracy. |
| `total_num_reviews` | integer | Number of reviews the club has |
| `average_satisfaction` | float (rounded to nearest tenth) | Calculated average satisfaction rating |

### SQL Function Logic (`update_club_review_stats`)

1. When a user submits a review, takes the associated `club_id`
2. Finds the corresponding `OrganizationID` in the `clubs` table
3. `satisfaction_sum += overall_satisfaction` (from the user review)
4. `total_num_reviews += 1`
5. `average_satisfaction` is automatically recalculated whenever `satisfaction_sum` or `total_num_reviews` changes

This function is **triggered after successful insertion** in the `reviews` table.

## Sorting Reviews

### Frontend (State Management)

- `useState` tracks the user-selected `sortType`, defaulting to `"Highest Rating"`
- A dropdown menu provides 3 options: **Highest Rating**, **Most Reviewed**, **A-Z**
- Changing the dropdown updates state, which re-renders search results and resets to page 1
- State tracking happens in `page.js` under `/clubs`
- The `sortType` is passed to the clubs API as a search param

### Backend (API)

The clubs API retrieves `sortType` from the URL (default: `"Highest Rating"`):

| Sort Type | Column | Order | Notes |
|-----------|--------|-------|-------|
| Highest Rating | `average_satisfaction` | Descending | Uses `nullsFirst: false` so clubs with no reviews appear last (nulls default to showing first) |
| Most Reviewed | `total_num_reviews` | Descending | |
| A-Z | `OrganizationName` | Ascending | |

The sort conditions are passed into the Supabase query request.

## Pending Reviews & Approval (Emails)

### Submission Flow

1. Upon review creation, insert into the `pending_reviews` table (has the same fields and data types as the `reviews` table)
2. **Trigger:** Upon insertion into `pending_reviews`, calls the Supabase edge function `send-review-email`
   - Sends `clubhouseucla@gmail.com` an email that a new review has been added
   - Sends the user an email about successful review submission

### Admin Panel

- **URL:** `www.clubhouseucla.com/admin`
- **Access:** Only accessible to `clubhouseucla@gmail.com` (kicks others to the log-in page)
- Displays all pending reviews from the `pending_reviews` table
- Supports sorting by ascending or descending date

### Approval / Denial

| Action | What Happens |
|--------|-------------|
| **Approve** | Insert into `reviews` table (triggers rating update), then delete from `pending_reviews`. Triggers `send-user-approval-email` edge function, which notifies the user their review was approved with a link to the club page. |
| **Deny** | Delete from `pending_reviews`. Triggers `send-user-disapproval-email` edge function, which notifies the user their review was removed, includes the review content, and links to submit a new review. |

### Email Service

- Uses the **Resend API**
- **Free plan limit:** Max 100 emails per day

### Row Level Security (RLS)

RLS is configured on the relevant tables to secure access.

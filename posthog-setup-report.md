# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Clubhouse (Next.js 16 App Router). The following changes were made:

- **`instrumentation-client.js`** (new) — Initializes PostHog client-side using the Next.js 15.3+ instrumentation pattern with exception capture and reverse-proxy ingestion via `/ingest`.
- **`src/app/lib/posthog-server.js`** (new) — Singleton server-side PostHog client (`posthog-node`) used by API routes.
- **`next.config.mjs`** — Added `/ingest` reverse-proxy rewrites so analytics requests are routed through your own domain, improving ad-blocker resilience.
- **`.env.local`** — Added `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`.
- **`src/app/components/google-sign-in.js`** — Added `posthog.identify()` and `user_signed_in` capture on successful Google OAuth.
- **`src/app/review/page.js`** — Added `review_submitted` capture after successful review insert.
- **`src/app/review/edit/[id]/page.js`** — Added `review_edit_submitted` capture after successful edit resubmission.
- **`src/app/clubs/[id]/page.js`** — Added `write_review_clicked` capture in `attemptReview` and `posthog.captureException` in the like error handler.
- **`src/app/profile/page.js`** — Added `review_deleted` capture after a rejected review is deleted.
- **`src/app/api/clubLikes/route.js`** — Added server-side `club_liked` / `club_unliked` events via `posthog-node`.
- **`src/app/api/clubSaves/route.js`** — Added server-side `club_saved` / `club_unsaved` events via `posthog-node`.
- **`src/app/api/reviewLikes/route.js`** — Added server-side `review_liked` event via `posthog-node`.

## Events

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully signed in via Google OAuth | `src/app/components/google-sign-in.js` |
| `write_review_clicked` | User clicked "Write a Review" on a club detail page — top of review funnel | `src/app/clubs/[id]/page.js` |
| `review_submitted` | User successfully submitted a new club review | `src/app/review/page.js` |
| `review_edit_submitted` | User successfully resubmitted an edited (previously rejected) review | `src/app/review/edit/[id]/page.js` |
| `review_deleted` | User deleted a rejected review from their profile | `src/app/profile/page.js` |
| `club_liked` | User liked a club (server-side) | `src/app/api/clubLikes/route.js` |
| `club_unliked` | User unliked a club (server-side) | `src/app/api/clubLikes/route.js` |
| `club_saved` | User saved a club (server-side) | `src/app/api/clubSaves/route.js` |
| `club_unsaved` | User removed a club from saved list (server-side) | `src/app/api/clubSaves/route.js` |
| `review_liked` | User liked a club review (server-side) | `src/app/api/reviewLikes/route.js` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/374473/dashboard/1445534
- **Review submission funnel** (conversion: write_review_clicked → review_submitted): https://us.posthog.com/project/374473/insights/f1kQeA2q
- **Daily sign-ins** (unique users per day): https://us.posthog.com/project/374473/insights/8ukYO74F
- **Club engagement — likes and saves** (weekly totals): https://us.posthog.com/project/374473/insights/2ZmBlCvw
- **Review activity — submissions and likes** (weekly totals): https://us.posthog.com/project/374473/insights/Hd6IgNId
- **Review deletions (churn signal)** (weekly rejected review deletes): https://us.posthog.com/project/374473/insights/PYjWOaZj

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

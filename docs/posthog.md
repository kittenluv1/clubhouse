# PostHog

## What it is

PostHog is a product analytics service that tracks and captures user activity in the form of analytics and screen recordings.

PostHog is initialized only in production. Local development and tests do not
send events from this app.

## How it works

- The browser SDK is initialized in `instrumentation.js`.
- API routes use `posthog-node` for server-side events.
- Google sign-in connects anonymous activity to the user's Supabase ID and
  email.
- Exception capture is enabled for diagnosing failures.
- Session recording is not explicitly enabled in the app code; its availability
  depends on PostHog project settings.

## What is captured

PostHog uses several types of data. They answer different questions:

| Type                         | What it tells us                                            | Example                                               |
| ---------------------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| Page and interaction capture | Which pages people visit and how they move through the site | A visit to `/clubs` or a navigation to a club page    |
| Product events               | Which meaningful Clubhouse actions people take              | `club_viewed` or `review_submitted`                   |
| Server-side events           | Whether an authenticated action actually succeeded          | `club_liked` after the API saves a like               |
| Errors and exceptions        | What failed during a user interaction                       | `captureException(error)` after a failed like request |

### Pages and general interactions

The browser SDK can capture pageviews and standard interactions across all pages.

Page capture is broad and SDK-driven. It is different from a product event,
which captures a specific meaningful action defined by us.

### Product events

Product events are intentional signals for actions that matter to Clubhouse.
They are called with `posthog.capture()` and can include context properties.

Examples:

- Searching for a club: `club_searched` with the search query.
- Opening a club: `club_viewed` with the club ID and name.
- Choosing a club recommendation: `recommendation_clicked` with the club and its
  position in the carousel.
- Submitting a review: `review_submitted` with the club, satisfaction rating,
  and membership status.

**Short comparison:** a pageview tells us that someone opened a club page;
`write_review_clicked` tells us that they took a specific next step.

### Identity

Identity distinguishes an anonymous browser from a known user:

- Before sign-in: activity uses an anonymous PostHog identity.
- After Google sign-in: Clubhouse calls `posthog.identify()` with the Supabase
  user ID and email, then records `user_signed_in`.

This connects relevant activity to the signed-in account without adding a user
ID to every browser event.

### Server-side events

API routes use `posthog-node` and the authenticated Supabase user ID as
`distinctId`. Server-side events record the result of an operation, not merely
the user's click or intention.

Examples:

- A successful club like: `club_liked`
- A successful club save: `club_saved`
- A successful review like or unlike: `review_liked` or `review_unliked`

These events are emitted only after the API operation succeeds in production.

### Errors and exceptions

Error capture diagnoses broken behavior rather than measuring a successful
product action. The initializer enables exception capture, and the browser can
call `posthog.captureException(error)` when a club like or unlike operation
fails.

**Short comparison:** an exception answers "what went wrong?" A product event
answers "what did the person do?"

## Privacy and scope

The app sends PostHog product context rather than the contents of a review. The
main properties are identifiers, search terms, categories, ratings, and
membership status. The sign-in event includes the user's email to associate the
activity with the authenticated account.

The browser and server integrations both use the production PostHog project;
the browser sends through the `/ingest` proxy and the server uses the configured
PostHog host. PostHog settings can affect automatic capture and recordings, so
those settings are part of the overall behavior of this integration.

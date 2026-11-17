# PostHog

## What it is

PostHog is a product analytics service that tracks and captures user activity in the form of analytics and screen recordings.

PostHog is initialized only in production. Local development and tests do not
send events from this app.

## How it works

- The browser SDK is initialized in `instrumentation-client.js`.
- API routes use `posthog-node` for server-side events.
- Google sign-in connects anonymous activity to the user's Supabase ID only.
  No email or name is sent.
- Signing out calls `posthog.reset()`, so the next person on the same browser
  starts a new anonymous identity.
- Exception capture is enabled for diagnosing failures.
- Session recording is turned on in PostHog project settings. The masking rules
  are set in code (see [Privacy and scope](#privacy-and-scope)).

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
  user ID only, then records `user_signed_in`.
- After sign-out: `posthog.reset()` clears the identity.

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
membership status. Users are identified by their Supabase user ID. Their email
and name are never sent.

The browser SDK limits collection in `instrumentation-client.js`:

| Setting                               | Effect                                                                |
| ------------------------------------- | --------------------------------------------------------------------- |
| `mask_all_text`                       | Autocapture records which element was clicked, but not its text       |
| `mask_personal_data_properties`       | Ad click IDs such as `gclid` and `fbclid` are masked in captured URLs |
| `enable_recording_console_log: false` | Session replay does not record browser console output                 |
| `session_recording.maskTextSelector`  | Session replay masks text inside elements marked `data-ph-mask`       |
| `session_recording.maskAllInputs`     | Session replay masks everything typed into form fields                |

Public content such as club pages stays readable in replays. Personal data is
hidden by marking the element or page that shows it:

| Where                     | Marker                      | Effect                              |
| ------------------------- | --------------------------- | ----------------------------------- |
| Header profile menu email | `data-ph-mask`              | Text masked                         |
| `/profile` page           | `data-ph-mask` on the page  | All text on the page masked         |
| `/onboarding` page        | `data-ph-mask` on the page  | All text on the page masked         |
| `/admin` page             | `ph-no-capture` on the page | Not recorded at all, no autocapture |

Masking applies to everything inside a marked element. When a new page or
component shows a name, email, review the user hasn't published, or onboarding
answer, mark it with `data-ph-mask`.

These settings override the "Privacy and masking" options in PostHog project
settings, so changing those dashboard toggles has no effect.

Some protections can only be set in the PostHog dashboard:

- **Discard client IP data** (Project settings). The SDK's `ip` option no longer
  does anything.
- **Data retention** for events and recordings.

The browser and server integrations both use the production PostHog project;
the browser sends through the `/ingest` proxy and the server uses the configured
PostHog host. PostHog settings can affect automatic capture and recordings, so
those settings are part of the overall behavior of this integration.

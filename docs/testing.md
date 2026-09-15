# Testing

## Philosophy

The core idea of testing is to make sure the application can be used as intended. The more the tests resemble the way the application is used, the more confidence the tests can give. **Focus on the outcomes, not the internals.**

## Packages

| Package               | Purpose                      |
| --------------------- | ---------------------------- |
| Jest                  | Test runner                  |
| React Testing Library | Renders and tests components |

## What to Test

- UI logic (conditional rendering)
- Event handling (clicks and input)
- Component state behavior
- Edge cases and security

**Avoid** testing internal states directly.

## Flows

- **Search and filtering** - Users can search by name, filter by one or more categories, sort results, paginate through results, and see appropriate empty states. Name search and category filtering are mutually exclusive through `SearchContext`.
- **Anonymous users** - Visitors can browse clubs and public reviews. Actions that require an account, such as liking, saving, writing a review, viewing a profile, or receiving recommendations, redirect to sign-in and preserve the intended destination.
- **Sign in/out** - Users can sign in with a valid UCLA email. Invalid email attempts are rejected and are not inserted into the database. Signing out clears user-specific UI state and prevents authenticated actions until the user signs in again.
- **Authentication** - Protected pages and actions redirect unauthenticated users to sign-in, then return them to the original destination after authentication. Authenticated users can access only the features allowed for their account.
- **Club interactions** - Signed-in users can like and save clubs, undo those actions, like and unlike reviews, and see the updated state when navigating away and back.
- **Write and edit reviews** - Signed-in users can submit a review for a club. New reviews enter the pending state. Authors can edit their own approved or rejected reviews, while users cannot edit another user’s review.
- **Review moderation** - Pending reviews are not public until approved. Approved reviews appear publicly, while rejected reviews are visible to the author in their profile with appropriate unread/read notification behavior.
- **Admin access** - The configured admin user can access moderation tools and approve or reject pending reviews. Regular users and anonymous visitors cannot perform admin actions.
- **User profiles** - Signed-in users can load their profile, view saved clubs and reviews, see unread rejected-review notifications, and update profile preferences. Profile editing follows the required onboarding/profile completion rules.
- **Onboarding and recommendations** - Users can start onboarding from the recommendations prompt.
  - First time users or users who have started but not completed onboarding are prompted to start the flow rather than being treated as fully onboarded.
  - We do not save partial onboarding states - either the user is fully onboarded, or not
  - Users who complete onboarding have their preferences saved, see personalized recommendations on the clubs page, and see the relevant profile information populated.
  - Users who have completed onboarding cannot re-enter the setup flow as if they were new users.
- **Error and empty states** - Failed requests, missing clubs, no search results, no reviews, unavailable recommendations, unauthorized access, and incomplete profile data show an appropriate fallback without breaking the surrounding page.
- **Desktop and mobile** - Navigation, filters, sorting controls, review cards, sliders, club details, recommendations, profiles, and onboarding remain usable across desktop and mobile layouts.

## Commands

| Command                 | Description                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `npm run test`          | Runs all tests once                                                                  |
| `npm run test:watch`    | Watches for file changes and runs relevant tests. Use during development/debugging.  |
| `npm run test:coverage` | Runs tests and measures coverage (which lines ran, how much of each file was tested) |
| `npm run lint`          | Runs ESLint (`eslint-config-next`) across the project for static analysis            |

## Directory Structure

All tests live in a top-level **`tests/`** directory, organized by feature so it's easy to find what covers a given part of the app. Each test imports the code under test through the `@/` path alias (which maps to `src/`), so tests stay location-independent.

```
tests/
├── api/              # API route handlers (clubs-route, onboarding-route)
├── authentication/   # AuthContext provider
├── components/       # shared UI: button, footer, confirmationModal, screens, gradient
├── lib/              # pure helpers: avatars, clubCardHelpers, redirect
├── middleware/       # proxy / middleware
├── onboarding/       # OnboardingGuard, splitUserInterests
├── profile/          # profile UI (SectionToggle)
├── recommendation/   # scoring engine, weight registry, service, feature extractors
└── search/           # SearchContext provider
```

Jest discovers these automatically via its `testMatch` glob (`**/?(*.)+(spec|test).[jt]s?(x)`) — no per-folder configuration is required. When adding a test, place it in the folder matching its feature and import via `@/...`.

## What Uses Jest

Everything in the suite runs on **Jest** (with React Testing Library for components). Choose the right environment/approach per feature:

| Feature type                                     | Approach                                                              |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| Pure functions / helpers (`lib/`)                | Plain Jest unit tests — assert inputs → outputs and edge cases        |
| React components (`components/`, `profile/`)     | React Testing Library — render, query by role/text, fire events       |
| Context providers (`authentication/`, `search/`) | RTL with a test consumer; mock `next/navigation` and data layer       |
| API route handlers (`api/`)                      | `@jest-environment node`; mock the DB layer (`server-db`) and `fetch` |
| Middleware (`middleware/`)                       | Jest with `next/server` and `@supabase/ssr` mocked                    |
| Recommendation engine (`recommendation/`)        | Plain Jest unit tests over deterministic scoring logic                |

## Linting

ESLint runs against a flat config (`eslint.config.mjs`) extending `next/core-web-vitals`.

> **Note:** `next lint` was removed in Next.js 16, so the `lint` script calls the ESLint CLI directly (`eslint .`). Errors fail the build; warnings (e.g. `@next/next/no-img-element`) do not.

## Conventions

- Place tests under `tests/<feature>/` — **not** co-located next to source
- Import the code under test via the `@/` alias (e.g. `@/app/components/button`)
- Use **1 file** to test one module/component
- Use `describe` to group different tests; nest them if necessary
- Test names describe **high-level behavior**, not actual code
- Test **edge cases** and for **security**

## Template

```jsx
import { render, screen, fireEvent } from "@testing-library/react";
import Component from "@/app/components/Component";

describe("Component", () => {
  test("renders expected text", () => {
    render(<Component />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  test("handles user interaction", () => {
    render(<Component />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Clicked")).toBeInTheDocument();
  });
});
```

## Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yaml`) runs on every push and pull request. It installs dependencies with `npm ci` (Node.js version pinned in `.nvmrc`) and runs three jobs in parallel:

- **lint** — `npm run lint` (ESLint, `--max-warnings=0` so warnings fail the build)
- **test** — `npm run test:coverage` (Jest with an enforced coverage gate)
- **build** — `npm run build` (Next.js production build; uses dummy env vars since it never contacts a real service)

All three must pass before code is merged, so run them locally before pushing. See [`github.md`](./github.md) for the branch/PR workflow.

## Coverage Gate

`jest.config.js` defines a `coverageThreshold` that `npm run test:coverage` enforces. The build fails if global coverage drops below:

| Metric     | Floor |
| ---------- | ----- |
| Statements | 22%   |
| Branches   | 20%   |
| Functions  | 18%   |
| Lines      | 22%   |

These are set just under the current levels to act as a **regression guard** — coverage can't silently erode. When you add tests and raise coverage, ratchet these numbers up so the floor keeps rising.

## Useful Links and Tutorials

- **Jest:** [Getting Started](https://jestjs.io/docs/getting-started)
- **React Testing Library:** [Example Intro](https://testing-library.com/docs/react-testing-library/example-intro)
- [What Is React Testing Library?](https://testing-library.com/)
- [Testing In React Tutorial - Jest and React Testing Library](https://www.youtube.com/results?search_query=Testing+In+React+Tutorial+Jest+and+React+Testing+Library)

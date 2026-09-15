# Authentication (OAuth & Sign In)

## Overview

Authentication state is managed centrally by `AuthContext`. The provider loads the current Supabase session, listens for auth changes, and exposes the current `user`, `session`, `profile`, and `loading` state through `useAuth()`.

Pages that require authentication use `useRequireAuth()`. If the session check finishes without a user, the hook redirects to `/sign-in` and preserves the current path in `returnUrl`.

The header uses the same context to show the sign-in or sign-out action. Actions such as reviewing a club also redirect unauthenticated users to `/sign-in`.

## Supabase Auth

- **Pricing:** Free up to 50,000 unique users/month ([docs](https://supabase.com/docs/guides/platform/manage-your-usage/monthly-active-users-third-party))
- **Setup guide:** [Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)

## Sign In Flow

1. The user selects the Google Sign-In button.
2. Google returns an ID token to the client.
3. The client passes the token to `supabase.auth.signInWithIdToken()`.
4. Supabase creates or retrieves the user in `auth.users` and emits an auth state change.
5. The database creates the corresponding `profiles` row through the existing auth trigger and validates the email domain.
6. After a successful sign-in, the component redirects the user:

- to the validated `returnUrl`, when one was supplied;
- to the relevant club or review page for legacy `club` and `clubId` parameters; or
- to `/profile` by default.

If the email is not valid, the sign-in is rolled back, the partial session is signed out, and the component shows the invalid-email message.

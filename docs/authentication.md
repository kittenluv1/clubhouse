# Authentication (OAuth & Sign In)

## Overview

Sign-in logic checks for a user session in **3 places**:

1. **Google Sign In component** - Displays the Google Sign In button or user email depending on session state
2. **Login button** - Switches between "Sign In" / "Log Out" depending on session state
3. **Review club page** - Redirects to sign in page if user is not signed in

## Supabase Auth

- **Pricing:** Free up to 50,000 unique users/month ([docs](https://supabase.com/docs/guides/platform/manage-your-usage/monthly-active-users-third-party))
- **Setup guide:** [Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)

## Sign In Flow

1. User signs in, inserting into `auth.users` and receiving a JWT token
2. `auth.users` is managed by Supabase and **does not allow `BEGIN INSERT` triggers**, so email validation must be handled **AFTER INSERT**
3. An `AFTER INSERT` trigger on `auth.users` runs `handle_new_user()`, which attempts to insert into `profiles`
4. `profiles` checks the email constraint:
   - **Invalid email** (non-UCLA): Returns a database error and **rolls back the entire transaction** (including the insert into `auth.users`)
   - **Valid email**: Adds user to `profiles` table (user also stays in `auth.users`)
5. If the database sign-in returned with no error, the user is signed in

## Google Sign In Button (GSI) - User Flow

The component alternates between **4 UI states**:

### 1. Google Sign In Button

- Displayed when navigating to the page while signed out
- Displayed after pressing the sign out button on the page
- Supabase auth state change event listener updates `userEmail`, triggering a re-render

### 2. Google Sign In Button with "Invalid Email" Message

- Displayed when a user tries to sign in with a non-UCLA email
- `userEmail` is set to `"INVALID"`

### 3. "You are signed in as \_\_"

Displayed when:
- Signing in using the Google Sign In Button (auth state change listener updates `userEmail`, triggering re-render)
- Navigating to the page when already signed in
  - This can only be done by manually adding `/sign-in` to the URL, because the sign in/out button directly signs you out instead of redirecting to the page
  - Supabase auth event listener detects the initial session and updates `userEmail`, triggering a re-render

### 4. Loading

- Waiting for Supabase to authenticate the UCLA email
- If the email is **valid**, transition to UI #3
- If the email is **invalid**, **DELETE** the user from Supabase and display UI #2

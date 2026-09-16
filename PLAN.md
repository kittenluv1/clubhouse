Goal: Display an "invalid email" message when a user attempts to sign in with a non-UCLA email.

Approach:
1.  Verify that the `userEmail` state in `src/app/components/google-sign-in.js` correctly changes to "INVALID" when a non-UCLA email is used.
2.  Investigate why the `p` tag with the message "Please sign in with a valid UCLA email." is not visible when `userEmail` is "INVALID". This will likely involve checking CSS or parent element styling.
3.  Ensure the message is clearly visible to the user.
4.  Add a test for the sign-in button component to check for the error message display.

Files to touch:
-   `src/app/components/google-sign-in.js` (for potential style adjustments or wrapper changes)
-   `tests/authentication/google-sign-in.test.js` (or similar, to add a new test case)

Test command: `npm test`
Lint command: `npm run lint`

Acceptance criteria:
-   When an invalid email is used for sign-in, the message "Please sign in with a valid UCLA email." is displayed on the page.
-   Existing sign-in functionality remains unchanged for valid emails.
-   New test case covers the invalid email scenario.
Risk: Low. The fix is confined to a specific component and should not affect other parts of the application.
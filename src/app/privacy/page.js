export const metadata = {
  title: "Privacy Policy | Clubhouse",
  description:
    "Learn about the data Clubhouse collects, how student privacy is protected, and how review anonymity is maintained.",
};

function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl p-10 md:mb-20 md:p-20 md:pt-12">
      <h1 className="my-6 text-4xl font-bold">Clubhouse Privacy Policy</h1>
      <p className="text-gray-600">
        Last updated: November 2026
      </p>
      <p className="my-4">
        Clubhouse is an independent discovery and review directory built for UCLA
        students. We believe in transparency and student privacy: public reviews
        remain anonymous, and your personal browsing activity is never sold or
        shared with third-party advertisers.
      </p>

      <h2 className="my-4 text-2xl font-bold">1. When You Browse</h2>
      <p className="my-2">
        You can browse clubs, read reviews, and explore categories without
        creating an account.
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Anonymous Analytics:</strong> In production, we use PostHog to
          record general pageviews, club views, and interactions to understand
          which pages are most helpful. These events are not connected to your
          identity when you are not signed in.
        </li>
        <li>
          <strong>Club Searches:</strong> When you search for clubs, your search
          terms are processed to find matching clubs. Search terms may be
          analyzed in aggregate to identify missing clubs or broken search terms.
        </li>
      </ul>

      <h2 className="my-4 text-2xl font-bold">2. When You Sign In</h2>
      <p className="my-2">
        Signing in requires an official UCLA Google account (via Google OAuth and
        Supabase Auth). When you sign in, we collect:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Your UCLA Email Address:</strong> Used to confirm active UCLA
          affiliation, prevent spam, and deliver status updates regarding reviews
          you submit.
        </li>
        <li>
          <strong>Account Identifier:</strong> A unique user ID is generated to
          link your saved clubs, liked clubs, profile preferences, and reviews.
        </li>
        <li>
          <strong>Authentication Cookies:</strong> Secure session cookies keep
          you signed in across visits and protect authenticated routes.
        </li>
      </ul>

      <h2 className="my-4 text-2xl font-bold">3. Profile &amp; Preferences</h2>
      <p className="my-2">
        During onboarding or in your profile settings, you may choose to provide:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Academic Info:</strong> Majors and minors you are pursuing.
        </li>
        <li>
          <strong>Club Interests &amp; Involvements:</strong> Organizations you
          currently belong to and category interests you want to explore.
        </li>
        <li>
          <strong>Bear Avatar:</strong> A randomly assigned bear illustration
          associated with your account.
        </li>
      </ul>
      <p className="my-2">
        This information is private to you and is used exclusively to power the
        club recommendation algorithm. It is never displayed publicly.
      </p>

      <h2 className="my-4 text-2xl font-bold">4. Anonymous Reviews</h2>
      <p className="my-2">
        Student reviews help Bruins make informed decisions about campus life. To
        protect reviewers:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Public Display:</strong> Approved reviews only display the
          review text, rating criteria, membership date range, a randomly
          generated animal alias (e.g. &ldquo;Curious Bear&rdquo;), and your assigned
          bear avatar.
        </li>
        <li>
          <strong>Identity Protection:</strong> Your real name and email address
          are <strong>never</strong> displayed to the public or to other users.
        </li>
        <li>
          <strong>Moderation:</strong> Submitted reviews are reviewed by the
          admin team for compliance with our Community Guidelines prior to
          publication.
        </li>
      </ul>

      <h2 className="my-4 text-2xl font-bold">5. Saved Clubs &amp; Likes</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Saved Clubs:</strong> Bookmarks are strictly private and visible
          only to you on your profile.
        </li>
        <li>
          <strong>Club &amp; Review Likes:</strong> Public users only see total like
          counts. Who liked which club or review is not visible to other users.
        </li>
      </ul>

      <h2 className="my-4 text-2xl font-bold">6. Third-Party Services</h2>
      <p className="my-2">
        Clubhouse relies on trusted third-party service providers to deliver the
        platform:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Supabase:</strong> Cloud database and authentication.
        </li>
        <li>
          <strong>Google Identity Services:</strong> Secure Google account sign-in.
        </li>
        <li>
          <strong>PostHog:</strong> Usage analytics and error capture.
        </li>
        <li>
          <strong>Resend:</strong> Automated notification emails regarding your reviews.
        </li>
        <li>
          <strong>Vercel:</strong> Web hosting and server execution.
        </li>
      </ul>

      <h2 className="my-4 text-2xl font-bold">7. Your Choices &amp; Data Rights</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Manage Content:</strong> You can edit or delete your approved
          reviews directly from your profile page.
        </li>
        <li>
          <strong>Update Preferences:</strong> You can modify or remove your
          majors, minors, and interests in your profile at any time.
        </li>
        <li>
          <strong>Account Deletion:</strong> If you wish to delete your account or
          request a copy of your stored data, contact us at{" "}
          <a
            href="mailto:clubhouseucla@gmail.com"
            className="text-blue-600 underline"
          >
            clubhouseucla@gmail.com
          </a>
          .
        </li>
      </ul>
    </div>
  );
}

export default PrivacyPolicyPage;

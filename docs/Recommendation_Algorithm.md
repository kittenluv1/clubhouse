# Club Recommendation Algorithm

## Endpoint

```
GET /api/recommendations?limit=20
```

Requires authentication (user must be signed in with a Supabase session cookie). Returns up to `limit` clubs (max 100, default 20) ranked by relevance to the user.

## How It Works

1. Fetches the user's profile (`major`, `minor`, `interests`, `categories`)
2. Fetches their liked clubs, saved clubs, and club memberships from the existing tables
3. Fetches all clubs
4. **Excludes** clubs the user already liked or is a member of
5. Scores every remaining club using 7 weighted features
6. Returns them sorted by score (descending), with alphabetical tiebreaking

## Scoring Formula

Each club gets a score from 0.0 to 1.0:

```
score = (membership_similarity × 0.28)
      + (major_match           × 0.20)
      + (interest_overlap      × 0.16)
      + (category_overlap      × 0.13)
      + (minor_match           × 0.09)
      + (like_history          × 0.08)
      + (save_history          × 0.06)
```

### Features

Each feature returns a raw score between 0.0 and 1.0:

| Feature | What it checks | How it scores |
|---|---|---|
| `membership_similarity` | Categories of clubs user is **in** vs candidate's categories | Fraction of candidate's categories that match |
| `major_match` | User's major vs club category/description | 1.0 = category match, 0.5 = description mention, 0.0 = no match |
| `interest_overlap` | User's interests array vs club categories | Jaccard similarity (`\|intersection\| / \|union\|`) |
| `category_overlap` | User's preferred categories vs club categories | Fraction of club categories that match |
| `minor_match` | Same as major_match but for minor | Same logic |
| `like_history` | Categories from user's **liked** clubs vs candidate | Fraction of candidate's categories that match |
| `save_history` | Categories from user's **saved** clubs vs candidate | Fraction of candidate's categories that match |

## Response Shape

```json
{
  "recommendations": [
    {
      "OrganizationID": 42,
      "OrganizationName": "ACM at UCLA",
      "Category1Name": "Computer Science",
      "Category2Name": "Technology",
      "OrganizationDescription": "...",
      "average_satisfaction": 4.5,
      "recommendation_score": 0.72,
      "recommendation_breakdown": {
        "membership_similarity": 1.0,
        "major_match": 1.0,
        "interest_overlap": 0.5,
        "category_overlap": 1.0,
        "minor_match": 0.0,
        "like_history": 0.5,
        "save_history": 0.0
      }
    }
  ],
  "profileComplete": true,
  "total": 150,
  "limit": 20
}
```

### Response Fields

- **`recommendation_score`** — the final weighted score
- **`recommendation_breakdown`** — raw 0–1 score per feature (before weighting)
- **`profileComplete`** — `false` if the user has no major/minor/interests/categories set (useful for prompting them to complete their profile)
- **`total`** — how many candidate clubs were scored (after exclusions)

## Database Requirements

Run the migration (`supabase/migrations/002_add_profile_recommendation_fields.sql`) which:

- Adds `major`, `minor`, `interests`, `categories` columns to `profiles`
- Creates the `club_memberships` table (same pattern as `club_likes`/`club_saves`)

## Frontend Usage

```js
// Fetch recommendations (auth cookie is sent automatically)
const res = await fetch('/api/recommendations?limit=20');
const { recommendations, profileComplete } = await res.json();

if (!profileComplete) {
  // Show "complete your profile for better recommendations" prompt
}

// recommendations is an array of club objects with scores attached
recommendations.forEach(club => {
  console.log(club.OrganizationName, club.recommendation_score);
});
```

## Exclusion Rules

Clubs are **never** recommended if the user:

- Already **liked** them (in `club_likes`)
- Is already a **member** (in `club_memberships`)

Saved clubs **are** still recommended — saving is more like bookmarking, they haven't committed yet.

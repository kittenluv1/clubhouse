# Clubs Data

## Data Source

Club data is fetched from the SOLE API: https://sa.ucla.edu/RCO/public/search

### Fetching Strategy

- A **cron job** fetches club data on a schedule to update the database (see [cron-jobs.md](./cron-jobs.md))
- This approach avoids overwhelming the SOLE API with direct requests
- You can also **manually update** clubs data by visiting `clubhouseucla.com/api`
- Data is stored in the `clubs` table in Supabase
- All searches, requests, and queries pull from the database (not the API directly)

## API Routes

| Route | Purpose |
|-------|---------|
| `/api/route.js` | Fetches regular student organization clubs |
| `/api/clubsports/route.js` | Fetches official club sports |

## Club Sports vs. Sports Clubs

- **Sports clubs** are student organizations related to sports (fetched from `/api/route.js`) - these are *not* club sports
- **Club sports** are official UCLA club sports (fetched from `/api/clubsports/route.js`)

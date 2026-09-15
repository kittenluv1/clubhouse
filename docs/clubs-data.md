# Clubs Data

## Data Source

Club data is fetched from the SOLE API: https://sa.ucla.edu/RCO/public/search

### Fetching Strategy

- A **cron job** fetches club data on a schedule to update our database (see [cron-jobs.md](./cron-jobs.md))
- You can also **manually pull** and view the most recent version of clubs data by visiting `clubhouseucla.com/api`
- Data is stored in the `clubs` table in Supabase
- All clubhouse searches, requests, and queries pull from the supabase (not the SOLE API directly). This approach avoids overwhelming the SOLE API with direct hits

## API Routes

| Route                      | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `/api/route.js`            | Fetches regular student organization clubs |
| `/api/clubsports/route.js` | Fetches official club sports               |

## Club Sports vs. Sports Clubs

- **Sports clubs** are student organizations related to sports (fetched from `/api/route.js`) - these are _not_ club sports
- **Club sports** are official UCLA club sports (fetched from `/api/clubsports/route.js`)

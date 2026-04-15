# Cron Jobs

## Vercel Cron Jobs

- Managed in `vercel.json`
- Hits `/api` and runs on the **first of the month**
- Updates the list of clubs using the UCLA API
- **Runs only on production**

Reference: [Vercel Cron Jobs Docs](https://vercel.com/docs/cron-jobs)

## GitHub Actions

Managed in `.github/workflows/`.

### Ping Dev Supabase

Pings the dev Supabase project to **prevent it from pausing every 7 days** (Supabase free tier pauses inactive projects).

### Weekly Prod Backup

Uploads a dump of the production database as a **GitHub artifact** every week.

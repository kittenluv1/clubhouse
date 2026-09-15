# Cron Jobs

## Vercel Cron Jobs

Managed in `vercel.json`

### Monthly SOLE api update

- Hits `/api` and runs on the **first of the month**
- Updates the list of clubs using the UCLA API
- **Runs only on production**

Reference: [Vercel Cron Jobs Docs](https://vercel.com/docs/cron-jobs)

## GitHub Actions

Managed in `.github/workflows/`.

### Weekly Prod Backup

Uploads a dump of the production database as a **GitHub artifact** every week.

> The `.github/workflows/` directory also contains a **CI workflow** (`ci.yaml`) that runs lint + tests on every push/PR. It is not a scheduled job — see [`testing.md`](./testing.md) and [`github.md`](./github.md).

# Cron Jobs

## Vercel Cron Jobs

Managed in `vercel.json`

### Monthly SOLE api update

- Hits `/api` and runs on the **first of the month**
- Updates the list of clubs using the UCLA API
- **Runs only on production**
- Requires the `CRON_SECRET` environment variable. Vercel sends it as
  `Authorization: Bearer $CRON_SECRET`; requests without it get `401`, and the
  route returns `500` without syncing if `CRON_SECRET` is unset.
- To trigger a sync by hand:
  `curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api`

Reference: [Vercel Cron Jobs Docs](https://vercel.com/docs/cron-jobs)

## GitHub Actions

Managed in `.github/workflows/`.

### Weekly Prod Backup

Uploads a dump of the production database as a **GitHub artifact** every week.

> The `.github/workflows/` directory also contains a **CI workflow** (`ci.yaml`) that runs lint + tests on every push/PR. It is not a scheduled job — see [`testing.md`](./testing.md) and [`github.md`](./github.md).

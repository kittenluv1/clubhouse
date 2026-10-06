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

Uploads an **encrypted** dump of the production database as a **GitHub artifact** every week (kept 90 days).

- The dump contains user emails and reviews, so it is encrypted with AES-256
  (`gpg --symmetric`) before upload and the plaintext is shredded.
- Requires the `BACKUP_PASSPHRASE` repository secret (plus `PROD_DB_URL` and
  `PROD_DB_PASSWORD`). The job fails without it rather than upload plaintext.
  Store the passphrase somewhere outside GitHub (e.g. the team password manager).
- To restore, download the artifact, then:

  ```bash
  gpg --decrypt prod_backup_YYYY-MM-DD.sql.gpg > prod_backup.sql   # prompts for the passphrase
  psql "$DATABASE_URL" -f prod_backup.sql
  ```

> The `.github/workflows/` directory also contains a **CI workflow** (`ci.yaml`) that runs lint + tests on every push/PR. It is not a scheduled job — see [`testing.md`](./testing.md) and [`github.md`](./github.md).

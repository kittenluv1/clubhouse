# GitHub Workflow

## Branches

There are 2 special branches: `dev` and `main`.

### `dev` (Staging)

- Long-lived branch for a fully testable preview environment
- You *can* develop directly on `dev`, but it's **not recommended** - best to make a branch and PR/merge
- Preview link: https://clubhouse-git-dev-clubhouse-ucla.vercel.app/
- Use the Vercel dev preview to test sign-in related features (registered as an authorized JavaScript origin for GSO)

### `main` (Production)

- Deploys to production
- Merging to main **requires a PR**
- Don't develop directly on main - you won't be able to push

### Should I push to `dev` or `main`?

| Scenario | Target Branch |
|----------|--------------|
| Developing an ongoing feature/project | Merge/PR to `dev` |
| Urgent or small fixes | PR to `main` |

**Important:** Wherever you push to, make sure to merge that branch into yours before pushing!

## Continuous Integration (GitHub Actions)

A CI workflow (`.github/workflows/ci.yaml`) runs automatically on **every push and pull request**. It uses `npm ci` on the Node.js version pinned in `.nvmrc` (kept in sync with local development) and runs three jobs in parallel:

| Job | Command | Purpose |
|-----|---------|---------|
| **lint** | `npm run lint` | ESLint (`--max-warnings=0`, so warnings fail) |
| **test** | `npm run test:coverage` | Jest suite with an enforced coverage threshold |
| **build** | `npm run build` | Next.js production build (dummy env vars) |

All three jobs must pass before a PR can be safely merged. Run them locally before pushing to catch failures early. See [`testing.md`](./testing.md) for details on the test suite and coverage gate.

## Issues

- **Projects** = groups of issues related to a specific goal/feature
- If a PR directly addresses an issue, include `Fixes #__` (with the issue number) in the PR comment to link the PR to the issue
- Mark your current issues as "in progress"

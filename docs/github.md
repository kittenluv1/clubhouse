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

## Issues

- **Projects** = groups of issues related to a specific goal/feature
- If a PR directly addresses an issue, include `Fixes #__` (with the issue number) in the PR comment to link the PR to the issue
- Mark your current issues as "in progress"

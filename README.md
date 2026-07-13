This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

This project requires environment variables to be set up for local development.

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

## Testing & Linting

This project uses [Jest](https://jestjs.io) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for its test suite, and [ESLint](https://eslint.org) (with `eslint-config-next`) for static analysis.

```bash
npm test              # run the full test suite once
npm run test:watch    # re-run tests on file changes
npm run test:coverage # run tests and generate a coverage report
npm run lint          # run ESLint across the project
```

All tests live in the top-level `tests/` directory, organized by feature (`api/`, `authentication/`, `components/`, `lib/`, `middleware/`, `onboarding/`, `profile/`, `recommendation/`, `search/`) and import source via the `@/` alias. The suite covers pure helpers (`clubCardHelpers`, `avatars`, `splitUserInterests`, the recommendation engine and its features), API route handlers, React components (`Button`, `Footer`, `ConfirmationModal`, `LoadingScreen`/`ErrorScreen`, `SectionToggle`, `Gradient`, `OnboardingGuard`), and the `AuthContext` / `SearchContext` providers. See [`docs/testing.md`](docs/testing.md) for conventions.

## Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yaml`) runs automatically on every push and pull request. It installs dependencies with `npm ci` (Node.js version pinned in `.nvmrc`) and runs three jobs in parallel:

- **lint** — `npm run lint` (ESLint, warnings fail the build)
- **test** — `npm run test:coverage` (Jest with an enforced coverage threshold)
- **build** — `npm run build` (Next.js production build)

Make sure all three pass locally before pushing. Coverage thresholds are defined in `jest.config.js`; see [`docs/testing.md`](docs/testing.md).

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

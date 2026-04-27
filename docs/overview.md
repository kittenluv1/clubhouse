# Project Overview

## Purpose of Documentation

- Explain any tricky or confusing code
- Explain decisions behind implementation choices
- Document how features *should* work
- Help others (and future you) find where things are
- Provide instructions on how to navigate to specific parts of the codebase, UI, or tools (file paths, UI steps, component names, etc.)
- Include enough information so that others would be able to maintain the code
- Keep things clear without overloading with unnecessary detail

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js | Full-stack React framework |
| Frontend | File-based routing | Located in `/src/app` |
| Backend | Next.js API routes | Located in `/src/app/api` |
| Database | Supabase (PostgreSQL) | Free, open source |
| Auth | Supabase Auth | Handles Google OAuth |
| Hosting | Vercel | Works well with Next.js & Supabase |

### Vercel Free Plan Limitations

- Only 1 person allowed on the account/team
- Can't deploy to an org GitHub account
- Access with clubhouse email

## Environments

There are **2 environments**: development and production.

### Development

- **Branch:** `dev` on GitHub
- **Supabase project:** development
- All changes are tested in dev before pushing to main
- Similar to a staging environment, but shares dev data

### Production

- **Branch:** `main` on GitHub
- **Supabase project:** production

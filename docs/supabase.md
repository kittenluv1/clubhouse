# Supabase

## Projects

There are two separate Supabase projects: **development** and **production**.

- Configured in `.env` files - **important not to mess with these!**
- Develop on the remote development project, then apply migrations to deploy changes to production
- Both projects must be manually updated
- Similar to git version control with multiple remotes, but with PostgreSQL

## Workflow

1. Make changes against the **development** Supabase project
2. Test thoroughly in the dev environment
3. Apply migrations to deploy changes to the **production** project

## Supabase CLI

Reference: [Supabase CLI Introduction](https://supabase.com/docs/reference/cli/introduction)

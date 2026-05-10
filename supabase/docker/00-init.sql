-- Public schema permissions for PostgREST + RLS.
-- The supabase/postgres image already creates: anon, authenticated, service_role, authenticator.

grant usage on schema public to anon, authenticated, service_role;

-- Restrict anon to safe DML only (no TRUNCATE, which bypasses RLS)
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to authenticated, service_role;

-- Default privileges for objects created by the postgres role (migration runner)
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges for role postgres in schema public
  grant all on tables to service_role;
alter default privileges for role postgres in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  grant all on functions to authenticated, service_role;

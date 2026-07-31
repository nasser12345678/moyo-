# Moyo TB Companion

The deployed patient application is served from `legacy/` and uses Netlify Functions with Supabase for authenticated patient data.

## Production configuration

The deployed functions fall back to the same public Supabase URL and publishable key used by the patient app. To move the project or rotate that key, set these Netlify environment variables for the **Production** deploy context, then redeploy:

- `SUPABASE_URL` — the Supabase project URL
- `SUPABASE_ANON_KEY` — the Supabase anonymous/publishable key

The functions `get-user-dashboard`, `save-medication-log`, and `save-checkin` use these values when present.

## Database migration

Apply `supabase_migration_v2.sql` in the Supabase SQL editor before using medication or check-in persistence. Alternatively, set a local-only `SUPABASE_DB_URL` and run:

```powershell
node execute_sql.cjs
```

Copy `.env.example` to `.env` for local configuration. Do not commit `.env` or database credentials.

# Supabase setup

1. Create a Supabase project and run `supabase/migrations/202606190001_initial_schema.sql` through the SQL editor or Supabase CLI.
2. Copy `.env.example` to `.env.local` and set the project URL and anon key.
3. Configure the Site URL and redirect URLs for localhost and production in Authentication settings.
4. Keep the service-role key server-side only. The browser uses only the anon key; RLS protects all couple data.

Media paths must begin with the couple UUID: `<couple-id>/<memory-id>/<filename>`. Storage policies use this first path segment for membership checks.

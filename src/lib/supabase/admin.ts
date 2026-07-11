import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using the SERVICE_ROLE key.
 * This bypasses RLS - use ONLY in server actions / API routes.
 * NEVER import this in client components or expose it to the browser.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

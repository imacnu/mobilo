import { createClient } from '@supabase/supabase-js';

export function createServiceClient() {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    const missing = [
      !url ? 'SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL' : null,
      !key ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
    ]
      .filter(Boolean)
      .join(', ');
    throw new Error(`Missing Supabase server environment variables: ${missing}`);
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createAnonServerClient() {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

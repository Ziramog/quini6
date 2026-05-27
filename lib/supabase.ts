import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function getUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
}

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
}

function getAdminKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      const url = getUrl();
      const key = getAnonKey();
      if (!url || !key) return () => ({ data: [], error: { message: 'Supabase not configured' } });
      _supabase = createClient(url, key);
    }
    return (_supabase as any)[prop];
  },
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabaseAdmin) {
      const url = getUrl();
      const key = getAdminKey();
      if (!url || !key) return () => ({ data: [], error: { message: 'Supabase not configured' } });
      _supabaseAdmin = createClient(url, key, { auth: { persistSession: false } });
    }
    return (_supabaseAdmin as any)[prop];
  },
});

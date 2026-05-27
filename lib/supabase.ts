import { createClient, SupabaseClient, QueryData, QueryError } from '@supabase/supabase-js';

function createMockQuery() {
  const chain: any = () => chain;
  chain.select = () => chain;
  chain.insert = () => chain;
  chain.update = () => chain;
  chain.delete = () => chain;
  chain.eq = () => chain;
  chain.neq = () => chain;
  chain.order = () => chain;
  chain.limit = () => chain;
  chain.range = () => chain;
  chain.single = () => Promise.resolve({ data: null, error: null } as any);
  chain.then = (resolve: any, reject: any) => Promise.resolve({ data: [], error: null }).then(resolve, reject);
  chain.throw = () => { throw new Error('Supabase not configured'); };
  return chain;
}

let _supabase: SupabaseClient | undefined;
let _supabaseAdmin: SupabaseClient | undefined;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) {
        const mock: any = createMockQuery();
        return mock[prop] ?? mock;
      }
      _supabase = createClient(url, key);
    }
    return (_supabase as any)[prop];
  },
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabaseAdmin) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) {
        const mock: any = createMockQuery();
        return mock[prop] ?? mock;
      }
      _supabaseAdmin = createClient(url, key, { auth: { persistSession: false } });
    }
    return (_supabaseAdmin as any)[prop];
  },
});

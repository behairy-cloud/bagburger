import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';

const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const supabaseEnabled = Boolean(supabaseUrl && supabaseKey);

export const supabase = supabaseEnabled
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  : null;

export const ORDERS_TABLE       = 'orders';
export const ORDER_BUCKET       = 'order-screenshots';
export const MENU_IMAGE_BUCKET  = 'menu-item-images';
export const STAFF_IMAGE_BUCKET = 'staff-images';

/**
 * All admin-only RLS policies (orders, menu writes) require the `authenticated`
 * Postgres role + is_admin_user(). The data client above is created with
 * persistSession/autoRefreshToken disabled, so it never carries the admin's
 * auth token on its own — it always talks to Postgres as `anon`. Call this
 * whenever the admin session (from supabase-auth.js) changes so admin data
 * requests actually authenticate.
 */
export async function syncSupabaseAuthSession(session) {
  if (!supabase) return;
  if (session?.access_token && session?.refresh_token) {
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  } else {
    await supabase.auth.signOut({ scope: 'local' });
  }
}

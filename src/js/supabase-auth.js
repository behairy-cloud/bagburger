/**
 * supabase-auth.js
 * A dedicated Supabase client using the anon (publishable) key,
 * with full session persistence enabled for admin auth.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || '';

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'bagburger-admin-session',
  },
});

/**
 * Sign in with email + password.
 * Returns { session, error }.
 */
export async function adminSignIn(email, password) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { session: null, error: error.message };
  return { session: data.session, error: null };
}

/**
 * Sign out the current admin session.
 */
export async function adminSignOut() {
  await supabaseAuth.auth.signOut();
}

/**
 * Get the current session from local storage (for page refresh persistence).
 */
export async function getAdminSession() {
  const { data } = await supabaseAuth.auth.getSession();
  return data?.session || null;
}

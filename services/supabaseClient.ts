import { createClient } from '@supabase/supabase-js';

// Self-hosted Supabase deployment URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Public anon key (safe for browser usage with RLS policies)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;



/**
 * The provided anon key from the self-hosted deployment does not decode as a JWT, so
 * Supabase's JS client fails whenever it sends the token as an Authorization header.
 * Stripping that header ensures the API relies solely on the apikey header, which works.
 */
const stripAuthorizationFetch: typeof fetch = (input, init?: RequestInit) => {
  const headers = new Headers(init?.headers || {});
  headers.delete('Authorization');
  return fetch(input, { ...init, headers });
};

// Resolve relative proxy URL to absolute URL
const resolvedUrl = supabaseUrl.startsWith('/')
  ? `${window.location.origin}${supabaseUrl}`
  : supabaseUrl;

export const supabase = createClient(resolvedUrl, supabaseAnonKey, {
  global: {
    fetch: stripAuthorizationFetch,
  },
});


import { createClient } from '@supabase/supabase-js';

// Self-hosted Supabase deployment URL
const SUPABASE_URL = 'http://bjk.ai:8000';

// Public anon key (safe for browser usage with RLS policies)
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTcxMTI0MDAwMCwiZXhwIjoxOTQ2MjQ4MDAwfQ.EVZPEgGdk20KlUoQjQ2T9USW5gF5VjvcM8jng2u9H6w';

/**
 * The provided anon key from the self-hosted deployment does not decode as a JWT, so
 * Supabase's JS client fails whenever it sends the token as an Authorization header.
 * Stripping that header ensures the API relies solely on the apikey header, which works.
 */
const stripAuthorizationFetch: typeof fetch = (input, init = {}) => {
  const headers = new Headers(init.headers || {});
  headers.delete('Authorization');
  return fetch(input, { ...init, headers });
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  global: {
    fetch: stripAuthorizationFetch,
  },
});

import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a supabase server client
 * @param {Request} request - The incoming request object
 * @returns {Object} The supabase server client and headers
 * @returns {SupabaseClient<any, 'public', any>} return.supabase - The supabase server client
 * @returns {Headers} return.headers - The headers
 */
export function createSupabaseServerClient(request: Request): {
  supabase: SupabaseClient<any, 'public', any>;
  headers: Headers;
} {
  const cookies = request.headers.get('Cookie');
  const headers = new Headers();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(cookies || '');
        },
        setAll(cookies) {
          try {
            cookies.forEach(({ name, value, options }) => {
              const serializedCookie = serializeCookieHeader(
                name,
                value,
                options
              );

              headers.append('Set-Cookie', serializedCookie);
            });
          } catch (error) {
            console.error('Error setting cookies:', error);
          }
        },
      },
    }
  );

  return { supabase, headers };
}

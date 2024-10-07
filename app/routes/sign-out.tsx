import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { createSupabaseServerClient } from '~/supabase/server';

/**
 * Action function
 */
export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = createSupabaseServerClient(request);

  await supabase.auth.signOut();

  return redirect('/sign-in', { headers });
}

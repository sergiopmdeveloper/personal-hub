import { ActionFunctionArgs, json } from '@remix-run/node';
import { redirect } from '@remix-run/react';
import { createSupabaseServerClient } from '~/supabase/server';

/**
 * Action function
 */
export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return redirect('/sign-in?unauthorized=true');
  }

  const body = await request.formData();

  const linkGroup = body.get('link-group');

  await supabase
    .from('links')
    .delete()
    .eq('user_email', data.user.email)
    .eq('link_group', linkGroup);

  await supabase
    .from('link_templates')
    .delete()
    .eq('user_email', data.user.email)
    .eq('link_group', linkGroup);

  return json({}, { status: 200 });
}

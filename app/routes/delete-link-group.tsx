import { ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { createSupabaseServerClient } from '~/supabase/server';

/**
 * Action function
 */
export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();

  const linkGroup = body.get('link-group');

  const { supabase } = createSupabaseServerClient(request);

  await supabase.from('links').delete().eq('link_group', linkGroup);

  return json({}, { status: 200 });
}

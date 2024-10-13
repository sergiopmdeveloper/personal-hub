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

  if (!linkGroup) {
    return json(
      { createLinkGroupError: 'Link group is required.' },
      { status: 400 }
    );
  }

  const { data: linkGroups } = await supabase
    .from('links')
    .select('user_email, link_group')
    .eq('user_email', data.user.email)
    .eq('link_group', linkGroup);

  if (linkGroups && linkGroups.length > 0) {
    return json(
      { createLinkGroupError: 'Link group already exists.' },
      { status: 400 }
    );
  }

  await supabase.from('links').insert([
    {
      user_email: data.user.email,
      link_group: linkGroup,
      link: 'https://your-link.com',
    },
  ]);

  await supabase.from('link_templates').insert([
    {
      user_email: data.user.email,
      link_group: linkGroup,
      template: 'basic',
    },
  ]);

  return redirect(`/user/links/${linkGroup}`);
}

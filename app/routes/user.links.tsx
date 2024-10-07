import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect, useLoaderData } from '@remix-run/react';
import { Section } from '~/layouts/section';
import { createSupabaseServerClient } from '~/supabase/server';

/**
 * Loader function
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return redirect('/sign-in?unauthorized=true');
  }

  const { data: links } = await supabase
    .from('links')
    .select('id, link_group')
    .eq('user_email', auth.user.email);

  const linkGroups = Array.from(new Set(links?.map(link => link.link_group)));

  return json({ linkGroups }, { status: 200 });
}

/**
 * User links component
 */
export default function UserLinks() {
  const data = useLoaderData<typeof loader>();

  return (
    <main>
      <Section className="mt-10">
        <h1 className="text-2xl font-bold">Links</h1>

        {data.linkGroups.map((linkGroup, index) => (
          <span key={index}>{linkGroup}</span>
        ))}
      </Section>
    </main>
  );
}

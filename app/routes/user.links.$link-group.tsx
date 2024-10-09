import { type LoaderFunctionArgs } from '@remix-run/node';
import {
  Form,
  json,
  redirect,
  useLoaderData,
  useParams,
} from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Section } from '~/layouts/section';
import { createSupabaseServerClient } from '~/supabase/server';

/**
 * Loader function
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  const linkGroup = params['link-group'];

  const { supabase } = createSupabaseServerClient(request);

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return redirect('/sign-in?unauthorized=true');
  }

  const { data: links } = await supabase
    .from('links')
    .select('id, link')
    .eq('user_email', auth.user.email)
    .eq('link_group', linkGroup);

  return json(links, { status: 200 });
}

/**
 * Link group component
 */
export default function LinkGroup() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();

  const linkGroup = params['link-group'];

  return (
    <main>
      <Section className="mt-10">
        <h1 className="text-2xl font-bold">{linkGroup}</h1>

        <Form className="mt-8" method="post">
          <div className="flex flex-col gap-2">
            <input
              id="link-group"
              name="link-group"
              defaultValue={linkGroup}
              hidden
            />

            {data?.map(link => (
              <Input
                id={link.id}
                name={link.id}
                defaultValue={link.link}
                key={link.id}
              />
            ))}
          </div>

          <Button className="mt-8" disabled>
            Save
          </Button>
        </Form>
      </Section>
    </main>
  );
}

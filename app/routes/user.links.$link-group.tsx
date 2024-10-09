import { type LoaderFunctionArgs } from '@remix-run/node';
import {
  Form,
  json,
  redirect,
  useLoaderData,
  useParams,
} from '@remix-run/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
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
  const [links, setLinks] = useState(data || []);

  /**
   * Add new empty link
   */
  const addNewEmptyLink = () => {
    const newLink = {
      id: `new-${Date.now()}`,
      link: '',
    };

    setLinks([...links, newLink]);
  };

  return (
    <main>
      <Section className="mt-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{linkGroup}</h1>

          <div
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-primary transition-colors hover:bg-primary/90"
            onClick={addNewEmptyLink}
          >
            <Plus className="text-primary-foreground" size={15} />
          </div>
        </div>

        <Form className="mt-8" method="post">
          <div className="flex flex-col gap-2">
            <input
              id="link-group"
              name="link-group"
              defaultValue={linkGroup}
              hidden
            />

            {links.map(link => (
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

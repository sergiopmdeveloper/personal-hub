import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useParams,
} from '@remix-run/react';
import { Loader, Plus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormError } from '~/components/global/form-error';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Section } from '~/layouts/section';
import { createSupabaseServerClient } from '~/supabase/server';

/**
 * Loader function
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return redirect('/sign-in?unauthorized=true');
  }

  const linkGroup = params['link-group'];

  const { data: links } = await supabase
    .from('links')
    .select('id, link')
    .eq('user_email', auth.user.email)
    .eq('link_group', linkGroup);

  return json(links, { status: 200 });
}

/**
 * Action function
 */
export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return redirect('/sign-in?unauthorized=true');
  }

  const body = await request.formData();
  const linkGroup = params['link-group'];

  const atLeastOneEmptyLink = Array.from(body.values()).some(
    value => value === ''
  );

  if (atLeastOneEmptyLink) {
    return json(
      { error: 'At least one link is empty.', success: false },
      { status: 400 }
    );
  }

  await supabase.from('links').delete().eq('link_group', linkGroup);

  body.forEach(async value => {
    await supabase.from('links').insert([
      {
        user_email: data.user.email,
        link_group: linkGroup,
        link: value,
      },
    ]);
  });

  return json({ error: null, success: true }, { status: 200 });
}

/**
 * Link group component
 */
export default function LinkGroup() {
  const params = useParams();
  const data = useLoaderData<typeof loader>();
  const { state } = useNavigation();
  let actionData = useActionData<typeof action>();

  const linkGroup = params['link-group'];
  const [initialLinks, setInitialLinks] = useState(data || []);
  const [links, setLinks] = useState(data || []);
  const [changed, setChanged] = useState(false);
  const sending = state === 'submitting';

  useEffect(() => {
    if (actionData?.success) {
      setChanged(false);
      setInitialLinks(links);
      actionData.success = false;
      return;
    }

    checkForLinkChanges();
  }, [links, actionData]);

  /**
   * Adds a new empty link
   */
  const addNewEmptyLink = () => {
    const newLink = {
      id: `new-link-${Date.now()}`,
      link: '',
    };

    setLinks([...links, newLink]);
  };

  /**
   * Deletes a link
   * @param {string} id - The link id
   */
  const deleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  /**
   * Handles the link change
   * @param {string} id - The link id
   * @param {string} value - The link value
   */
  const handleLinkChange = (id: string, value: string) => {
    setLinks(
      links.map(link => (link.id === id ? { ...link, link: value } : link))
    );
  };

  /**
   * Checks if there are changes in the links
   */
  const checkForLinkChanges = () => {
    if (links.length !== initialLinks.length) {
      setChanged(true);
      return;
    }

    const linksHaveChanged = links.some((link, index) => {
      return link.link !== initialLinks[index].link;
    });

    setChanged(linksHaveChanged);
  };

  return (
    <main>
      <Section className="mt-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/user/links">Links</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>{linkGroup}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-10 flex items-center justify-between">
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
            {links.map(link => (
              <div key={link.id} className="flex items-center gap-2">
                <Input
                  id={link.id}
                  name={link.id}
                  value={link.link}
                  onChange={e => handleLinkChange(link.id, e.target.value)}
                  className="flex-grow"
                />

                <div
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md bg-destructive transition-colors hover:bg-destructive/90"
                  onClick={() => deleteLink(link.id)}
                >
                  <Trash className="text-primary-foreground" size={16} />
                </div>
              </div>
            ))}
          </div>

          {actionData?.error && (
            <FormError className="mt-8">{actionData.error}</FormError>
          )}

          <Button className="mt-8" disabled={!changed || sending}>
            Save
            {sending && <Loader className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </Form>
      </Section>
    </main>
  );
}

import type { LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  Link,
  redirect,
  useFetcher,
  useLoaderData,
} from '@remix-run/react';
import { Loader } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
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
  let fetcher = useFetcher();

  const sending = fetcher.state === 'submitting';

  return (
    <main>
      <Section className="mt-10">
        <h1 className="text-2xl font-bold">Links</h1>

        <Table className="mt-8">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Link group</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.linkGroups.map((linkGroup, index) => (
              <TableRow key={index}>
                <TableCell>{linkGroup}</TableCell>

                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Link to={`/user/links/${linkGroup}`}>
                      <Button>Edit</Button>
                    </Link>

                    <fetcher.Form method="post" action="/delete-link-group">
                      <input
                        type="hidden"
                        name="link-group"
                        value={linkGroup}
                      />

                      <Button variant="destructive" disabled={sending}>
                        Delete
                        {sending && (
                          <Loader className="ml-2 h-4 w-4 animate-spin" />
                        )}
                      </Button>
                    </fetcher.Form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
    </main>
  );
}

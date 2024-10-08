import type { LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  Link,
  redirect,
  useFetcher,
  useLoaderData,
} from '@remix-run/react';
import { Edit, Loader, Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
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

  const linkGroupCounts = links?.reduce(
    (acc, link) => {
      acc[link.link_group] = (acc[link.link_group] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const linkGroups = Object.entries(linkGroupCounts || {}).map(
    ([group, count]) => ({
      group,
      count,
    })
  );

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
                <TableCell>
                  <h3 className="relative w-fit">
                    {linkGroup.group}{' '}
                    <span className="absolute -right-7 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {linkGroup.count}
                    </span>
                  </h3>
                </TableCell>

                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Link to={`/user/links/${linkGroup}`}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary transition-colors hover:bg-primary/90">
                        <Edit className="text-primary-foreground" size={16} />
                      </div>
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger>
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-destructive transition-colors hover:bg-destructive/90">
                          <Trash
                            className="text-primary-foreground"
                            size={16}
                          />
                        </div>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Warning</AlertDialogTitle>

                          <AlertDialogDescription>
                            You are going to delete the link group{' '}
                            <strong>{linkGroup.group}</strong>. This action
                            cannot be undone. Are you sure you want to proceed?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>

                          <fetcher.Form
                            method="post"
                            action="/delete-link-group"
                          >
                            <input
                              type="hidden"
                              name="link-group"
                              value={linkGroup.group}
                            />

                            <Button variant="destructive" disabled={sending}>
                              Delete
                              {sending && (
                                <Loader className="ml-2 h-4 w-4 animate-spin" />
                              )}
                            </Button>
                          </fetcher.Form>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

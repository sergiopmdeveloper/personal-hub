import type { LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  Link,
  redirect,
  useFetcher,
  useLoaderData,
} from '@remix-run/react';
import { Edit, Loader, Plus, Trash } from 'lucide-react';
import { FormError } from '~/components/global/form-error';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Section } from '~/layouts/section';
import { cn } from '~/lib/utils';
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
    .select('link_group')
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
  let fetcher = useFetcher<FetcherData>();

  const deletingLinkGroup =
    fetcher.state === 'submitting' &&
    fetcher.formAction === '/delete-link-group';

  const creatingLinkGroup =
    fetcher.state === 'submitting' &&
    fetcher.formAction === '/create-link-group';

  return (
    <main>
      <Section className="mt-10">
        <div className="mt-10 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Links</h1>

          <Dialog>
            <DialogTrigger>
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-primary transition-colors hover:bg-primary/90">
                <Plus className="text-primary-foreground" size={15} />
              </div>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>New link group</DialogTitle>

                <DialogDescription>
                  Create a new link group and start adding links to it
                </DialogDescription>

                <fetcher.Form
                  className="!mt-4"
                  method="post"
                  action="/create-link-group"
                >
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="link-group">Name</Label>

                    <Input
                      className={cn({
                        'border-red-500 focus-visible:ring-0':
                          fetcher.data?.createLinkGroupError,
                      })}
                      id="link-group"
                      name="link-group"
                      placeholder="The link group name..."
                    />

                    {fetcher.data?.createLinkGroupError && (
                      <FormError>{fetcher.data.createLinkGroupError}</FormError>
                    )}
                  </div>

                  <Button className="mt-4" disabled={creatingLinkGroup}>
                    Delete
                    {creatingLinkGroup && (
                      <Loader className="ml-2 h-4 w-4 animate-spin" />
                    )}
                  </Button>
                </fetcher.Form>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <Table className="mt-8">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Link group</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.linkGroups.length > 0 ? (
              data.linkGroups.map((linkGroup, index) => (
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
                      <Link to={`/user/links/${linkGroup.group}`}>
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
                              cannot be undone. Are you sure you want to
                              proceed?
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

                              <Button
                                variant="destructive"
                                disabled={deletingLinkGroup}
                              >
                                Delete
                                {deletingLinkGroup && (
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
              ))
            ) : (
              <TableRow>
                <TableCell className="pt-4" colSpan={2}>
                  <p className="text-center text-gray-500">
                    No link groups found
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Section>
    </main>
  );
}

/**
 * Fetcher data type
 */
type FetcherData = {
  createLinkGroupError?: string;
};

import type { LoaderFunctionArgs } from '@remix-run/node';
import { Form, json, redirect, useLoaderData } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
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

  const { data: user } = await supabase
    .from('users')
    .select('id, email, first_name, last_name')
    .eq('email', auth.user.email)
    .single();

  return json(user, { status: 200 });
}

/**
 * User page
 */
export default function User() {
  const user = useLoaderData<typeof loader>();

  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';

  return (
    <main>
      <Section>
        <h1 className="text-2xl font-bold">Account details</h1>

        <Form className="mt-8 flex flex-col gap-6" method="POST">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="first-name">First name</Label>

            <Input
              id="first-name"
              name="first-name"
              defaultValue={firstName}
              placeholder="First name..."
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="last-name">Last name</Label>

            <Input
              id="last-name"
              name="last-name"
              defaultValue={lastName}
              placeholder="Last name..."
              autoComplete="off"
            />
          </div>

          <Button>Save</Button>
        </Form>
      </Section>
    </main>
  );
}

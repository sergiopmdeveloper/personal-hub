import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useToast } from '~/hooks/use-toast';
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
 * Action function
 */
export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return redirect('/sign-in?unauthorized=true');
  }

  const body = await request.formData();

  const firstName = body.get('first-name') as string;
  const lastName = body.get('last-name') as string;

  const { error } = await supabase
    .from('users')
    .update({ first_name: firstName, last_name: lastName })
    .eq('email', data.user.email);

  if (error) {
    return json(
      {
        unknownError: true,
        updatedUser: null,
      },
      { status: 520 }
    );
  }

  return json(
    {
      unknownError: false,
      updatedUser: { firstName: firstName, lastName: lastName },
    },
    { status: 200 }
  );
}

/**
 * User page
 */
export default function User() {
  const user = useLoaderData<typeof loader>();
  const updateUserResponse = useActionData<typeof action>();
  const { state } = useNavigation();
  const { toast } = useToast();

  let initialFirstName = user?.first_name || '';
  let initialLastName = user?.last_name || '';

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [unchanged, setUnchanged] = useState(true);
  const sending = state === 'submitting';

  useEffect(() => {
    if (updateUserResponse?.updatedUser) {
      setUnchanged(true);
      initialFirstName = updateUserResponse.updatedUser.firstName;
      initialLastName = updateUserResponse.updatedUser.lastName;

      toast({
        title: 'Updated',
        description: 'The details of your account have been updated',
      });
    }
  }, [updateUserResponse]);

  useEffect(() => {
    if (firstName === initialFirstName && lastName === initialLastName) {
      setUnchanged(true);
    } else {
      setUnchanged(false);
    }
  }, [firstName, lastName]);

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
              value={firstName}
              placeholder="First name..."
              autoComplete="off"
              onChange={event => setFirstName(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="last-name">Last name</Label>

            <Input
              id="last-name"
              name="last-name"
              value={lastName}
              placeholder="Last name..."
              autoComplete="off"
              onChange={event => setLastName(event.target.value)}
            />
          </div>

          <Button disabled={unchanged || sending}>
            Save {sending && <Loader className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </Form>
      </Section>
    </main>
  );
}

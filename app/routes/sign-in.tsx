import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import {
  Form,
  json,
  Link,
  redirect,
  useActionData,
  useNavigation,
} from '@remix-run/react';
import { Loader } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';
import { createSupabaseServerClient } from '~/supabase/server';
import { SignInSchema } from '~/validation/sign-in';

/**
 * Meta function
 */
export const meta: MetaFunction = () => {
  return [
    { title: 'personal-hub | Sign in' },
    {
      name: 'description',
      content: 'Sign in page',
    },
  ];
};

/**
 * Action function
 */
export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();

  const email = body.get('email') as string;
  const password = body.get('password') as string;

  const result = SignInSchema.safeParse({ email, password });

  if (!result.success) {
    return json(
      {
        errors: result.error.flatten().fieldErrors,
        invalidCredentials: false,
        unknownError: false,
      },
      { status: 400 }
    );
  }

  const { supabase, headers } = createSupabaseServerClient(request);

  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    if (error.code === 'invalid_credentials') {
      return json(
        { errors: null, invalidCredentials: true, unknownError: false },
        { status: 403 }
      );
    }

    return json(
      { errors: null, invalidCredentials: false, unknownError: true },
      { status: 520 }
    );
  }

  return redirect('/user', { headers });
}

/**
 * Sign in page
 */
export default function SignIn() {
  const { state } = useNavigation();
  const actionData = useActionData<typeof action>();

  const sending = state === 'submitting';
  const emailErrors = actionData?.errors?.email;
  const passwordErrors = actionData?.errors?.password;
  const invalidCredentials = actionData?.invalidCredentials;
  const unknownError = actionData?.unknownError;

  return (
    <main className="flex h-screen w-screen items-center justify-center">
      <div className="w-[30rem] rounded-md bg-secondary p-6">
        <h2 className="text-3xl font-bold">Sign in</h2>

        <Form className="mt-8 flex flex-col gap-6" method="POST">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>

            <Input
              className={cn({
                'border-red-500 focus-visible:ring-0': emailErrors,
              })}
              id="email"
              name="email"
              autoComplete="email"
            />

            {emailErrors && (
              <p className="text-xs text-red-500">{emailErrors[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>

            <Input
              className={cn({
                'border-red-500 focus-visible:ring-0': passwordErrors,
              })}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
            />

            {passwordErrors && (
              <p className="text-xs text-red-500">{passwordErrors[0]}</p>
            )}
          </div>

          <p className="text-xs">
            Don't have an account?{' '}
            <Link className="text-blue-600 underline" to="/sign-up">
              Sign up
            </Link>
          </p>

          {invalidCredentials && (
            <p className="text-xs text-red-500">
              Invalid email or password. Please try again.
            </p>
          )}

          {unknownError && (
            <p className="text-xs text-red-500">
              An unknown error occurred. Please try again later.
            </p>
          )}

          <Button type="submit" disabled={sending}>
            {sending ? 'Sending...' : 'Send'}
            {sending && <Loader className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </Form>
      </div>
    </main>
  );
}

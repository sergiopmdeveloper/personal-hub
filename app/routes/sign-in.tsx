import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import {
  Form,
  json,
  Link,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormError } from '~/components/global/form-error';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useToast } from '~/hooks/use-toast';
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
 * Loader function
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);

  const { data } = await supabase.auth.getSession();

  if (data.session) {
    return redirect('/user');
  }

  return null;
}

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
        fieldErrors: result.error.flatten().fieldErrors,
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
        { fieldErrors: null, invalidCredentials: true, unknownError: false },
        { status: 403 }
      );
    }

    return json(
      { fieldErrors: null, invalidCredentials: false, unknownError: true },
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
  const [mounted, setMounted] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const sending = state === 'submitting';
  const emailErrors = actionData?.fieldErrors?.email;
  const passwordErrors = actionData?.fieldErrors?.password;
  const invalidCredentials = actionData?.invalidCredentials;
  const unknownError = actionData?.unknownError;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && searchParams.get('unauthorized')) {
      toast({
        title: 'Forbidden',
        description: 'Sign in first to access your account',
        variant: 'destructive',
      });

      setSearchParams(searchParams => {
        searchParams.delete('unauthorized');
        return searchParams;
      });
    }
  }, [mounted, searchParams]);

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

            {emailErrors && <FormError>{emailErrors[0]}</FormError>}
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

            {passwordErrors && <FormError>{passwordErrors[0]}</FormError>}
          </div>

          {invalidCredentials && (
            <FormError>Invalid email or password. Please try again.</FormError>
          )}

          {unknownError && (
            <FormError>
              An unknown error occurred. Please try again later.
            </FormError>
          )}

          <p className="text-xs">
            Don't have an account?{' '}
            <Link className="text-blue-500 underline" to="/sign-up">
              Sign up
            </Link>
          </p>

          <Button type="submit" disabled={sending}>
            {sending ? 'Sending...' : 'Send'}
            {sending && <Loader className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </Form>
      </div>
    </main>
  );
}

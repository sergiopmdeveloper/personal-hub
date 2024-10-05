import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, Link } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

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
 * @param {Object} params - The parameters object
 * @param {Request} params.request - The incoming request object
 * @returns {Promise<boolean>} A promise that resolves to true
 */
export async function action({
  request,
}: ActionFunctionArgs): Promise<boolean> {
  const body = await request.formData();
  console.log(body);
  return true;
}

/**
 * Sign in page
 */
export default function SignIn() {
  return (
    <main className="flex h-screen w-screen items-center justify-center">
      <div className="w-[30rem] rounded-md bg-secondary p-6">
        <h2 className="text-3xl font-bold">Sign in</h2>

        <Form className="mt-8 flex flex-col gap-6" method="POST">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" autoComplete="email" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
            />
          </div>

          <p className="text-xs">
            Don't have an account?{' '}
            <Link className="text-blue-600 underline" to="/sign-up">
              Sign up
            </Link>
          </p>

          <Button type="submit">Send</Button>
        </Form>
      </div>
    </main>
  );
}

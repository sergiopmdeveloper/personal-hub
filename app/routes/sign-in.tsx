import type { MetaFunction } from '@remix-run/node';

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
 * Sign in page
 */
export default function SignIn() {
  return (
    <div>
      <h1>Sign in page</h1>
    </div>
  );
}

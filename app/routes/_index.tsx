import type { MetaFunction } from '@remix-run/node';

/**
 * Meta function
 */
export const meta: MetaFunction = () => {
  return [
    { title: 'personal-hub' },
    {
      name: 'description',
      content: 'Organize and share all your personal links in one place 🌐✨',
    },
  ];
};

/**
 * Index page
 */
export default function Index() {
  return <h1>Welcome to personal-hub!</h1>;
}

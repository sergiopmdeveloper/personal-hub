import type { MetaFunction } from '@remix-run/node';
import { Button } from '~/components/ui/button';

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
  return (
    <div>
      <h1>Welcome to personal-hub!</h1>
      <Button>Click me</Button>
    </div>
  );
}

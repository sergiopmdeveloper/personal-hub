import { Form, Link, useLocation, useNavigation } from '@remix-run/react';
import { Loader, Menu } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';
import { Section } from '~/layouts/section';
import { cn } from '~/lib/utils';

/**
 * Header component
 */
export function Header() {
  const { state } = useNavigation();
  const location = useLocation();

  const sending = state === 'submitting';

  return (
    <Section className="sticky top-0 z-50 bg-secondary">
      <header className="flex h-16 items-center justify-between">
        <h1 className="text-2xl font-bold">personal-hub</h1>

        <div className="flex gap-2">
          {location.pathname.startsWith('/user') && (
            <Form method="POST" action="/sign-out">
              <Button variant="destructive" disabled={sending}>
                Sign out
                {sending && <Loader className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </Form>
          )}

          <Sheet>
            <SheetTrigger>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary transition-colors hover:bg-primary/90">
                <Menu className="text-primary-foreground" size={20} />
              </div>
            </SheetTrigger>

            <SheetContent>
              <SheetHeader className="hidden">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Header menu</SheetDescription>
              </SheetHeader>

              {location.pathname.startsWith('/user') && (
                <div className="mt-6 flex flex-col gap-1 text-lg">
                  <Link
                    className={cn({
                      'font-bold': location.pathname === '/user',
                    })}
                    to="/user"
                    reloadDocument
                  >
                    User
                  </Link>

                  <Link
                    className={cn({
                      'font-bold': location.pathname === '/user/links',
                    })}
                    to="/user/links"
                    reloadDocument
                  >
                    Links
                  </Link>
                </div>
              )}

              {!location.pathname.startsWith('/user') && (
                <div className="mt-6 flex flex-col gap-1 text-lg">
                  <Link
                    className={cn({
                      'font-bold': location.pathname === '/',
                    })}
                    to="/"
                    reloadDocument
                  >
                    Home
                  </Link>

                  <Link
                    className={cn({
                      'font-bold': location.pathname === '/sign-in',
                    })}
                    to="/sign-in"
                    reloadDocument
                  >
                    Sign in
                  </Link>

                  <Link
                    className={cn({
                      'font-bold': location.pathname === '/sign-up',
                    })}
                    to="/sign-up"
                    reloadDocument
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </Section>
  );
}

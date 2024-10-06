import { Link, useLocation } from '@remix-run/react';
import { Menu } from 'lucide-react';
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

/**
 * Header component
 */
export function Header() {
  const location = useLocation();

  return (
    <Section className="sticky top-0 z-50 bg-secondary">
      <header className="flex h-16 items-center justify-between">
        <h1 className="text-2xl font-bold">personal-hub</h1>

        <div className="flex gap-2">
          {location.pathname.startsWith('/user') && (
            <Button variant="destructive">Logout</Button>
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
                  <Link to="/user" reloadDocument>
                    User
                  </Link>

                  <Link to="/user/links" reloadDocument>
                    Links
                  </Link>
                </div>
              )}

              {!location.pathname.startsWith('/user') && (
                <div className="mt-6 flex flex-col gap-1 text-lg">
                  <Link to="/" reloadDocument>
                    Home
                  </Link>

                  <Link to="/sign-in" reloadDocument>
                    Sign in
                  </Link>

                  <Link to="/sign-up" reloadDocument>
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

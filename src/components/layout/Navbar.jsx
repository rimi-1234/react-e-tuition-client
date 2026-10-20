import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { ArrowRight, LogIn, Menu, X } from 'lucide-react';
import { Magnetic, Presence, Stagger, useMotion, useWindowScroll } from '../../motion';
import { useAuth } from '../../providers/AuthProvider';
import { cn } from '../../utils/cn';
import { Button, Logo, Skeleton, ThemeToggle } from '../ui';
import { PUBLIC_NAV } from './navigation';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';

/**
 * Full-width site header. Transparent over page heroes, frosted with a
 * hairline border once the page scrolls; hides on scroll-down, returns on scroll-up.
 */
export function Navbar() {
  const { user, loading } = useAuth();
  const { scrolled, direction, past } = useWindowScroll();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { lockScroll, unlockScroll } = useMotion();

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) lockScroll?.();
    else unlockScroll?.();
  }, [open, lockScroll, unlockScroll]);

  const hidden = direction === 'down' && past && !open;
  const solid = scrolled || open;

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-[transform,background-color,border-color,box-shadow] duration-500 ease-out-soft',
          solid ? 'glass border-soft shadow-[var(--shadow-soft)]' : 'border-transparent bg-transparent',
          hidden && '-translate-y-full',
        )}
      >
        <nav aria-label="Main" className="container-page flex h-[72px] items-center justify-between gap-4">
          <Logo />

          <ul className="hidden items-center gap-1 md:flex">
            {PUBLIC_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'relative rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
                      isActive ? 'text-base-content' : 'text-base-content/65 hover:text-base-content',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      <span
                        className={cn(
                          'absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-left rounded-full bg-primary transition-transform duration-500 ease-out-soft',
                          isActive ? 'scale-x-100' : 'scale-x-0',
                        )}
                        aria-hidden
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            {loading ? (
              <Skeleton className="h-9 w-24 rounded-xl" />
            ) : user ? (
              <>
                <NotificationBell />
                <Button to="/dashboard" variant="dark" size="sm" className="hidden sm:inline-flex">
                  Dashboard
                </Button>
                <UserMenu compact />
              </>
            ) : (
              // One entry point: the sign-in page also offers Google, demo accounts and "Create an account".
              <Magnetic strength={0.2} className="hidden sm:inline-flex">
                <Button to="/login" size="sm" leftIcon={LogIn}>
                  Sign in
                </Button>
              </Magnetic>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex size-10 items-center justify-center rounded-xl transition-colors hover:bg-soft md:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <Presence
        show={open}
        id="mobile-menu"
        className="fixed inset-0 z-40 bg-base-200 md:hidden"
        enter={{ opacity: [0, 1] }}
        exit={{ opacity: 0 }}
        duration={0.3}
      >
        <div className="container-page flex h-full flex-col pb-8 pt-24">
          <Stagger as="ul" stagger={0.06} className="space-y-1">
            {PUBLIC_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn('flex items-center justify-between border-b border-soft py-4 font-display text-3xl', isActive ? 'text-primary' : 'text-base-content')
                  }
                >
                  {item.label}
                  <ArrowRight className="size-5 text-subtle" />
                </NavLink>
              </li>
            ))}
          </Stagger>
          <div className="mt-auto">
            {user ? (
              <Button to="/dashboard" size="lg" variant="dark" className="w-full">
                Go to dashboard
              </Button>
            ) : (
              <Button to="/login" size="lg" leftIcon={LogIn} className="w-full">
                Sign in
              </Button>
            )}
          </div>
        </div>
      </Presence>
    </>
  );
}

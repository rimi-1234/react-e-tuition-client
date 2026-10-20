import { Suspense, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { ArrowUpRight, Home, Menu, X } from 'lucide-react';
import { DASHBOARD_NAV, ROLE_META } from '../components/layout/navigation';
import { NotificationBell } from '../components/layout/NotificationBell';
import { UserMenu } from '../components/layout/UserMenu';
import { Avatar, Badge, Logo, ThemeToggle } from '../components/ui';
import { Enter } from '../motion';
import { useAuth } from '../providers/AuthProvider';
import { DashboardFallback } from '../routes/fallbacks';
import { cn } from '../utils/cn';
import { useScrollRestoration } from '../hooks/useScrollRestoration';

function SidebarContent({ onNavigate }) {
  const { user, role } = useAuth();
  const sections = DASHBOARD_NAV[role] || [];
  const RoleIcon = ROLE_META[role]?.icon;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <nav aria-label="Dashboard" className="flex-1 space-y-6 overflow-y-auto px-3 py-4" data-lenis-prevent>
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">{section.title}</p>
            <ul className="space-y-0.5">
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out-soft',
                        isActive ? 'bg-neutral text-neutral-content shadow-sm' : 'text-base-content/70 hover:bg-soft hover:text-base-content',
                      )
                    }
                  >
                    <Icon className="size-[18px] shrink-0 transition-transform duration-300 group-hover:scale-110" aria-hidden />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-soft p-4">
        <NavLink to="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-soft hover:text-base-content">
          <Home className="size-4" /> Back to website <ArrowUpRight className="ml-auto size-3.5" />
        </NavLink>
        <div className="flex items-center gap-3 rounded-2xl bg-soft p-3">
          <Avatar src={user?.photoURL} name={user?.displayName} size="sm" verified={user?.verified} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.displayName}</p>
            <Badge tone="primary" icon={RoleIcon} className="mt-1">
              {role}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  useScrollRestoration();

  return (
    <div className="min-h-dvh bg-base-200">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] border-r border-soft bg-base-100 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <Dialog open={mobileOpen} onClose={setMobileOpen} className="relative z-[80] lg:hidden">
        <DialogBackdrop transition className="fixed inset-0 bg-[#0b1020]/55 transition-opacity duration-300 data-closed:opacity-0" />
        <DialogPanel
          transition
          className="fixed inset-y-0 left-0 w-[85vw] max-w-[300px] bg-base-100 shadow-2xl transition duration-400 ease-out-soft data-closed:-translate-x-full"
        >
          <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-3.5 rounded-lg p-2 hover:bg-soft" aria-label="Close menu">
            <X className="size-5" />
          </button>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </DialogPanel>
      </Dialog>

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 border-b border-soft bg-base-100/95">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileOpen(true)} className="rounded-xl p-2 hover:bg-soft lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </button>
              <div className="lg:hidden">
                <Logo compact />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <Suspense fallback={<DashboardFallback />}>
            <Enter key={pathname}>
              <Outlet />
            </Enter>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

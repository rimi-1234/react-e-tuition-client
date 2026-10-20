import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDown, LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../providers/AuthProvider';
import { cn } from '../../utils/cn';
import { Avatar, Badge, notify } from '../ui';

const itemClass = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-base-content/85 data-focus:bg-soft data-focus:text-base-content';

export function UserMenu({ compact }) {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const handleLogout = async () => {
    await logOut();
    notify.success('Signed out. See you soon!');
    navigate('/');
  };

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-soft data-open:bg-soft">
        <Avatar src={user.photoURL} name={user.displayName} size="sm" verified={user.verified} />
        {!compact && (
          <>
            <span className="hidden max-w-28 truncate text-sm font-medium lg:block">{user.displayName?.split(' ')[0]}</span>
            <ChevronDown className="hidden size-4 text-subtle lg:block" aria-hidden />
          </>
        )}
      </MenuButton>
      <MenuItems
        transition
        anchor="bottom end"
        className={cn(
          'z-[70] mt-2 w-64 rounded-2xl border border-soft bg-base-100 p-1.5 shadow-[var(--shadow-lift)] outline-none [--anchor-gap:8px]',
          'origin-top-right transition duration-200 ease-out-soft data-closed:scale-95 data-closed:opacity-0',
        )}
      >
        <div className="mb-1 flex items-center gap-3 border-b border-soft px-3 pb-3 pt-2">
          <Avatar src={user.photoURL} name={user.displayName} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.displayName}</p>
            <p className="truncate text-xs text-subtle">{user.email}</p>
            <Badge tone="primary" className="mt-1.5">
              {user.role}
            </Badge>
          </div>
        </div>
        <MenuItem>
          <Link to="/dashboard" className={itemClass}>
            <LayoutDashboard className="size-4" /> Dashboard
          </Link>
        </MenuItem>
        <MenuItem>
          <Link to="/dashboard/profile" className={itemClass}>
            <UserRound className="size-4" /> Profile
          </Link>
        </MenuItem>
        <MenuItem>
          <button onClick={handleLogout} className={cn(itemClass, 'text-error data-focus:bg-error/8 data-focus:text-error')}>
            <LogOut className="size-4" /> Sign out
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}

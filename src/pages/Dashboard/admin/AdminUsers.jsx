import { BadgeCheck, ChevronDown, ShieldCheck, Trash2, UserCheck, UserRoundX, Users } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  EmptyState,
  ErrorState,
  IconButton,
  PageHeader,
  Pagination,
  TableSkeleton,
  Tabs,
  confirmAction,
} from '../../../components/ui';
import { SearchField } from '../../../components/dashboard/SearchField';
import { useChangeRole, useDeleteUser, useSetUserStatus, useUsers, useVerifyTutor } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useUrlFilters } from '../../../hooks/useUrlState';
import { useAuth } from '../../../providers/AuthProvider';
import { cn } from '../../../utils/cn';
import { date, timeAgo } from '../../../utils/format';

const DEFAULTS = { role: 'all', search: '', page: 1 };
const ROLES = ['Student', 'Tutor', 'Admin'];
const ROLE_COPY = {
  Student: 'They’ll be able to post tuitions and hire tutors.',
  Tutor: 'They’ll appear in the tutor directory and can apply to tuitions.',
  Admin: 'Admins can moderate tuitions, manage every user and see all payments.',
};
const article = (word) => (/^[AEIOU]/.test(word) ? 'an' : 'a');

function RoleSelect({ user, disabled, onChange }) {
  return (
    <div className="relative inline-flex">
      <select
        value={user.role}
        disabled={disabled}
        onChange={(e) => onChange(user, e.target.value)}
        aria-label={`Role for ${user.displayName || user.email}`}
        className="h-9 appearance-none rounded-lg border border-soft bg-base-100 pl-3 pr-8 text-sm font-medium outline-none transition-[border-color,box-shadow] hover:border-base-content/20 focus:border-primary focus:ring-4 focus:ring-primary/12 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-subtle" aria-hidden />
    </div>
  );
}

export default function AdminUsers() {
  useDocumentTitle('Users');
  const { user: me } = useAuth();
  const [filters, setFilters] = useUrlFilters(DEFAULTS);
  const { data, isPending, isFetching, error, refetch } = useUsers({ ...filters, limit: 15 });
  const changeRole = useChangeRole();
  const verify = useVerifyTutor();
  const setStatus = useSetUserStatus();
  const remove = useDeleteUser();
  const items = data?.items || [];
  const meta = data?.meta;
  const roles = meta?.roles;

  const tabs = [
    { value: 'all', label: 'All', count: roles ? ROLES.reduce((sum, r) => sum + (roles[r] || 0), 0) : undefined },
    { value: 'Student', label: 'Students', count: roles?.Student ?? (roles ? 0 : undefined) },
    { value: 'Tutor', label: 'Tutors', count: roles?.Tutor ?? (roles ? 0 : undefined) },
    { value: 'Admin', label: 'Admins', count: roles?.Admin ?? (roles ? 0 : undefined) },
  ];

  const nameOf = (u) => u.displayName || u.email;
  const busy = (mutation, u) => mutation.isPending && (mutation.variables?.id ?? mutation.variables) === u.id;

  const onRole = async (u, role) => {
    if (role === u.role) return;
    const ok = await confirmAction({
      title: `Make ${nameOf(u)} ${article(role)} ${role}?`,
      text: ROLE_COPY[role],
      confirmText: `Change to ${role}`,
      danger: role === 'Admin',
    });
    if (ok) changeRole.mutate({ id: u.id, role });
  };

  const onVerify = async (u) => {
    if (u.verified) {
      const ok = await confirmAction({
        title: 'Remove verification?',
        text: `${nameOf(u)} will lose the verified badge on their profile and in search results.`,
        confirmText: 'Remove badge',
      });
      if (!ok) return;
    }
    verify.mutate({ id: u.id, verified: !u.verified });
  };

  const onStatus = async (u) => {
    if (u.isActive !== false) {
      const ok = await confirmAction({
        title: `Suspend ${nameOf(u)}?`,
        text: 'They’ll be signed out and can’t use their account until you reactivate it.',
        confirmText: 'Suspend',
        danger: true,
      });
      if (!ok) return;
    }
    setStatus.mutate({ id: u.id, isActive: u.isActive === false });
  };

  const onDelete = async (u) => {
    const ok = await confirmAction({
      title: `Delete ${nameOf(u)}?`,
      text: 'Their account, unbooked tuition posts and pending applications will be removed. Payments and reviews are kept as records. This can’t be undone.',
      confirmText: 'Delete account',
      danger: true,
    });
    if (ok) remove.mutate(u.id);
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      primary: true,
      render: (u) => {
        const self = me?.id === u.id;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar src={u.photoURL} name={nameOf(u)} size="sm" verified={u.role === 'Tutor' && u.verified} />
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-semibold">
                <span className="truncate">{u.displayName || 'Unnamed user'}</span>
                {self && <Badge tone="primary">You</Badge>}
              </p>
              <p className="truncate text-xs text-subtle">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => <RoleSelect user={u} disabled={me?.id === u.id || busy(changeRole, u)} onChange={onRole} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) =>
        u.isActive === false ? (
          <Badge tone="error" dot>
            Suspended
          </Badge>
        ) : (
          <Badge tone="success" dot>
            Active
          </Badge>
        ),
    },
    {
      key: 'verified',
      header: 'Verified',
      render: (u) =>
        u.role !== 'Tutor' ? (
          <span className="text-subtle">—</span>
        ) : (
          <Button
            size="xs"
            variant={u.verified ? 'secondary' : 'outline'}
            leftIcon={BadgeCheck}
            aria-pressed={Boolean(u.verified)}
            aria-label={u.verified ? `${nameOf(u)} is verified. Remove verification` : `Verify ${nameOf(u)}`}
            loading={busy(verify, u)}
            disabled={me?.id === u.id}
            onClick={() => onVerify(u)}
          >
            {u.verified ? 'Verified' : 'Verify'}
          </Button>
        ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      hideOnMobile: true,
      render: (u) => (
        <span className="whitespace-nowrap text-muted" title={timeAgo(u.createdAt)}>
          {date(u.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      fullWidthOnMobile: true,
      render: (u) => {
        const self = me?.id === u.id;
        const suspended = u.isActive === false;
        return (
          <div className="flex items-center justify-end gap-1.5 max-md:justify-start">
            {self ? (
              <span className="text-xs text-subtle">Your account</span>
            ) : (
              <>
                <Button
                  size="xs"
                  variant={suspended ? 'success' : 'outline'}
                  leftIcon={suspended ? UserCheck : UserRoundX}
                  loading={busy(setStatus, u)}
                  onClick={() => onStatus(u)}
                  aria-label={`${suspended ? 'Reactivate' : 'Suspend'} ${nameOf(u)}`}
                >
                  {suspended ? 'Reactivate' : 'Suspend'}
                </Button>
                <IconButton icon={Trash2} label={`Delete ${nameOf(u)}`} size="icon-sm" variant="danger-soft" disabled={busy(remove, u)} onClick={() => onDelete(u)} />
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader eyebrow="Manage" title="Users" description="Change roles, verify tutors and suspend accounts that break the rules." />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs tabs={tabs} value={filters.role} onChange={(role) => setFilters({ role })} />
        <SearchField value={filters.search} onSearch={(search) => setFilters({ search })} label="Search users" placeholder="Search name, email or phone…" />
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isPending ? (
        <TableSkeleton rows={8} cols={5} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={filters.search ? undefined : filters.role === 'Admin' ? ShieldCheck : Users}
          title={filters.search ? `No users match “${filters.search}”` : 'No users here yet'}
          description={filters.search ? 'Check the spelling or try their email address.' : 'People who sign up with this role will be listed here.'}
          action={
            (filters.search || filters.role !== 'all') && (
              <Button variant="outline" onClick={() => setFilters({ search: '', role: 'all' })}>
                Show all users
              </Button>
            )
          }
        />
      ) : (
        <div className={cn('transition-opacity duration-300', isFetching && 'opacity-60')} aria-busy={isFetching || undefined}>
          {meta?.total !== undefined && (
            <p className="mb-3 text-sm text-muted">
              {meta.total} {meta.total === 1 ? 'user' : 'users'}
              {filters.search && <> matching “{filters.search}”</>}
            </p>
          )}
          <DataTable columns={columns} rows={items} caption="Platform users" />
          <Pagination page={meta?.page || filters.page} totalPages={meta?.totalPages} onChange={(page) => setFilters({ page })} className="mt-8" />
        </div>
      )}
    </>
  );
}

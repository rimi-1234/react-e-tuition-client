import { Link } from 'react-router';
import { BookOpenCheck, CalendarClock, CalendarDays, GraduationCap, Mail, MapPin, MonitorSmartphone, Phone, Search } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingRegion,
  PageHeader,
  TuitionCardSkeleton,
} from '../../../components/ui';
import { Stagger } from '../../../motion';
import { useApplications } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { date, money, plural } from '../../../utils/format';

function Detail({ icon: Icon, children }) {
  if (!children) return null;
  return (
    <li className="flex min-w-0 items-center gap-2 text-sm text-muted">
      <Icon className="size-4 shrink-0 text-subtle" aria-hidden />
      <span className="truncate">{children}</span>
    </li>
  );
}

function OngoingCard({ application: a }) {
  const t = a.tuition || {};
  const s = a.student || {};
  const tuitionId = t.id || (typeof a.tuition === 'string' ? a.tuition : null);
  const title = t.title || a.tuitionTitle || 'Tuition';
  const email = s.email || a.studentEmail;
  const studentName = s.displayName || 'Student';

  return (
    <Card interactive className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge tone="primary">{t.subject || a.tuitionSubject || 'Tuition'}</Badge>
        <Badge tone="success" dot>
          Ongoing
        </Badge>
      </div>

      <h2 className="mt-4 font-sans text-lg font-semibold leading-snug">
        {tuitionId ? (
          <Link to={`/tuitions/${tuitionId}`} className="hover:text-primary">
            {title}
          </Link>
        ) : (
          title
        )}
      </h2>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        <Detail icon={GraduationCap}>{t.classLevel}</Detail>
        <Detail icon={MonitorSmartphone}>{t.teachingMode}</Detail>
        <Detail icon={CalendarClock}>{t.schedule}</Detail>
        <Detail icon={MapPin}>{t.location || a.tuitionLocation}</Detail>
      </ul>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-soft pt-5">
        <div>
          <p className="text-xs text-subtle">Agreed monthly fee</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{money(a.expectedSalary)}</p>
        </div>
        <div>
          <p className="text-xs text-subtle">Started</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
            <CalendarDays className="size-4 text-subtle" aria-hidden />
            {date(a.decidedAt || a.updatedAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-1 flex-col justify-end">
        <div className="rounded-2xl bg-soft p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-subtle">Student</p>
          <div className="flex items-center gap-3">
            <Avatar src={s.photoURL} name={studentName} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{studentName}</p>
              {s.location ? (
                <p className="flex items-center gap-1 truncate text-xs text-subtle">
                  <MapPin className="size-3 shrink-0" aria-hidden />
                  {s.location}
                </p>
              ) : (
                email && <p className="truncate text-xs text-subtle">{email}</p>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {email && (
              <Button size="sm" variant="outline" leftIcon={Mail} href={`mailto:${email}?subject=${encodeURIComponent(`Edurock: ${title}`)}`} aria-label={`Email ${studentName}`} className="flex-1">
                Email
              </Button>
            )}
            {s.phone ? (
              <Button size="sm" variant="outline" leftIcon={Phone} href={`tel:${s.phone.replace(/[^\d+]/g, '')}`} aria-label={`Call ${studentName} on ${s.phone}`} className="flex-1">
                Call
              </Button>
            ) : (
              <span className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-soft px-3 text-xs text-subtle">No phone shared</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function OngoingTuitions() {
  useDocumentTitle('Ongoing tuitions');
  const { data, isPending, error, refetch } = useApplications('ongoing');
  const items = data?.items || [];

  return (
    <>
      <PageHeader
        title="Ongoing tuitions"
        description={
          items.length
            ? `You’re currently teaching ${plural(items.length, 'student')}. Contact details are shared once a student hires you.`
            : 'Tuitions you’ve been hired for, with your student’s contact details.'
        }
        actions={
          <Button to="/tuitions" variant="outline" leftIcon={Search}>
            Find more tuitions
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isPending ? (
        <LoadingRegion label="Loading ongoing tuitions" className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <TuitionCardSkeleton key={i} />
          ))}
        </LoadingRegion>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          title="No ongoing tuitions yet"
          description="When a student hires you and completes payment, the tuition and their contact details appear here."
          action={<Button to="/tuitions">Browse tuitions</Button>}
        />
      ) : (
        <Stagger className="grid gap-5 md:grid-cols-2">
          {items.map((a) => (
            <div key={a.id} className="min-w-0">
              <OngoingCard application={a} />
            </div>
          ))}
        </Stagger>
      )}
    </>
  );
}

import { Link } from 'react-router';
import { ExternalLink, Mail, Phone, Star, UserRound } from 'lucide-react';
import { useTuitionApplicants } from '../../hooks/useApi';
import { money, timeAgo } from '../../utils/format';
import { Avatar, Badge, EmptyState, ErrorState, Skeleton, StatusBadge } from '../ui';

const ContactLinks = ({ email, phone }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
    {email && (
      <a href={`mailto:${email}`} className="inline-flex items-center gap-1 text-primary hover:underline">
        <Mail className="size-3.5" /> {email}
      </a>
    )}
    {phone && (
      <a href={`tel:${phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 text-primary hover:underline">
        <Phone className="size-3.5" /> {phone}
      </a>
    )}
    {!email && !phone && <span className="text-subtle">No contact details on file</span>}
  </div>
);

/**
 * Admin-only panel: the poster's contact and every applicant with theirs.
 * Public pages never show this information.
 */
export function TuitionApplicants({ tuitionId }) {
  const { data, isPending, error, refetch } = useTuitionApplicants(tuitionId);
  const items = data?.items || [];
  const poster = data?.meta?.tuition?.student;

  if (isPending) {
    return (
      <div className="space-y-3" aria-busy="true">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-soft p-3">
            <Skeleton className="size-10" rounded="rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-5">
      {poster && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-subtle">Posted by</p>
          <div className="flex items-center gap-3 rounded-2xl bg-soft p-3">
            <Avatar src={poster.photoURL} name={poster.displayName} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{poster.displayName}</p>
              <ContactLinks email={poster.email} phone={poster.phone} />
            </div>
            {poster.location && <span className="hidden text-xs text-subtle sm:block">{poster.location}</span>}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-subtle">Applicants ({items.length})</p>
        {items.length === 0 ? (
          <EmptyState compact icon={UserRound} title="No applications yet" description="Tutors who apply will appear here with their contact details." />
        ) : (
          <ul className="space-y-2">
            {items.map((a) => {
              const tutor = a.tutor || {};
              return (
                <li key={a.id} className="rounded-2xl border border-soft p-3">
                  <div className="flex items-start gap-3">
                    <Avatar src={tutor.photoURL || a.tutorPhoto} name={tutor.displayName || a.tutorName} size="md" verified={tutor.verified} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{tutor.displayName || a.tutorName}</p>
                        <StatusBadge status={a.status} labels={{ Approved: 'Hired', Rejected: 'Declined' }} />
                        {tutor.ratingCount > 0 && (
                          <Badge tone="accent" icon={Star}>
                            {tutor.ratingAvg?.toFixed(1)} ({tutor.ratingCount})
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-subtle">
                        {a.qualifications} · {a.experience}+ yrs · applied {timeAgo(a.createdAt)}
                      </p>
                      <div className="mt-2">
                        <ContactLinks email={tutor.email || a.tutorEmail} phone={tutor.phone} />
                      </div>
                      {a.message && <p className="mt-2 line-clamp-2 text-xs italic text-muted">“{a.message}”</p>}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums">{money(a.expectedSalary)}</p>
                      {tutor.id && (
                        <Link to={`/tutors/${tutor.id}`} className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          Profile <ExternalLink className="size-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

import { Link } from 'react-router';
import { ArrowRight, BriefcaseBusiness, MapPin, Star } from 'lucide-react';
import { usePrefetch } from '../../hooks/useApi';
import { cn } from '../../utils/cn';
import { money } from '../../utils/format';
import { Avatar, Badge } from '../ui';

export function TutorCard({ tutor, className }) {
  const prefetch = usePrefetch();
  return (
    <article
      onPointerEnter={() => prefetch.tutor(tutor.id)}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-box)] border border-soft bg-base-100 shadow-[var(--shadow-soft)]',
        'transition-[transform,box-shadow,border-color] duration-500 ease-out-soft hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-[var(--shadow-lift)]',
        className,
      )}
    >
      {/* Cover band */}
      <div className="relative h-20 overflow-hidden bg-linear-to-br from-primary/15 via-primary/5 to-accent/15">
        <div className="absolute inset-0 bg-dots opacity-60 transition-transform duration-[1200ms] ease-out-soft group-hover:scale-110" aria-hidden />
        {tutor.ratingCount > 0 && (
          <span className="absolute right-3 top-3 bg-base-100/90 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
            <Star className="size-3.5 fill-accent text-accent" /> {tutor.ratingAvg?.toFixed(1)}
            <span className="font-normal text-subtle">({tutor.ratingCount})</span>
          </span>
        )}
      </div>

      <div className="-mt-10 flex flex-1 flex-col px-5 pb-5">
        <Avatar src={tutor.photoURL} name={tutor.displayName} size="xl" verified={tutor.verified} ring />
        <h3 className="mt-3 font-sans text-lg font-semibold tracking-tight">
          <Link to={`/tutors/${tutor.id}`} className="outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-primary">
            {tutor.displayName}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted">{tutor.qualification || 'Tutor on Edurock'}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(tutor.subjects || []).slice(0, 3).map((s) => (
            <Badge key={s} tone="neutral">
              {s}
            </Badge>
          ))}
          {tutor.subjects?.length > 3 && <Badge tone="outline">+{tutor.subjects.length - 3}</Badge>}
        </div>

        <ul className="mb-4 mt-4 space-y-1.5 text-[13px] text-base-content/70">
          {tutor.location && (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-subtle" /> {tutor.location}
            </li>
          )}
          <li className="flex items-center gap-2">
            <BriefcaseBusiness className="size-4 text-subtle" /> {tutor.experienceYears || 0}+ years experience
          </li>
        </ul>

        <div className="mt-auto flex items-center justify-between border-t border-soft pt-4">
          <div>
            <p className="text-xs text-subtle">From</p>
            <p className="font-semibold">
              {tutor.expectedSalary ? money(tutor.expectedSalary) : 'Negotiable'}
              {tutor.expectedSalary ? <span className="text-xs font-normal text-subtle"> /month</span> : null}
            </p>
          </div>
          <span className="flex size-9 items-center justify-center rounded-full bg-soft text-base-content/70 transition-all duration-500 ease-out-soft group-hover:bg-primary group-hover:text-primary-content">
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:-rotate-45" />
          </span>
        </div>
      </div>
    </article>
  );
}

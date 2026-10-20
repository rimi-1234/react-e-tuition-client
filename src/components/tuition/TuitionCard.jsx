import { Link, useNavigate } from 'react-router';
import { ArrowUpRight, Bookmark, CalendarDays, Laptop, MapPin, Users } from 'lucide-react';
import { useBookmarkIds, usePrefetch, useToggleBookmark } from '../../hooks/useApi';
import { useAuth } from '../../providers/AuthProvider';
import { cn } from '../../utils/cn';
import { isRecent, money, timeAgo } from '../../utils/format';
import { BANNER_FALLBACK, tuitionCover } from '../../utils/subjectImages';
import { Badge, StatusBadge, notify } from '../ui';

/** Heart/bookmark toggle used on cards and the details page. */
export function BookmarkButton({ tuitionId, className, withLabel }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: ids } = useBookmarkIds();
  const toggle = useToggleBookmark();
  const saved = ids?.has(tuitionId);

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      notify.info('Sign in to save tuitions for later');
      return navigate('/login');
    }
    toggle.mutate({ tuitionId, saved });
  };

  return (
    <button
      onClick={onClick}
      aria-pressed={Boolean(saved)}
      aria-label={saved ? 'Remove from saved' : 'Save tuition'}
      className={cn(
        'relative z-10 inline-flex items-center gap-2 rounded-xl border text-sm font-medium transition-all duration-300 active:scale-90',
        withLabel ? 'h-11 px-4' : 'size-9 justify-center',
        saved ? 'border-primary/30 bg-primary/10 text-primary' : 'border-soft bg-base-100 text-base-content/60 hover:text-primary',
        className,
      )}
    >
      <Bookmark className={cn('size-4 transition-transform duration-300', saved && 'scale-110 fill-current')} />
      {withLabel && (saved ? 'Saved' : 'Save')}
    </button>
  );
}

const modeIcon = { Online: Laptop, 'Home Visit': MapPin, Both: Users };

/**
 * The tuition card used on the home page, browse page and saved list.
 * The whole card is a link (stretched ::after); inner buttons sit above it.
 */
export function TuitionCard({ tuition, showStatus = false, className }) {
  const prefetch = usePrefetch();
  const ModeIcon = modeIcon[tuition.teachingMode] || Users;
  const isNew = isRecent(tuition.createdAt, 3);

  const cover = tuitionCover(tuition);

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-box)] border border-soft bg-base-100 shadow-[var(--shadow-soft)]',
        'transition-[transform,box-shadow,border-color] duration-500 ease-out-soft hover:-translate-y-1 hover:border-primary/25 hover:shadow-[var(--shadow-lift)]',
        className,
      )}
      onPointerEnter={() => prefetch.tuition(tuition.id)}
      onFocus={() => prefetch.tuition(tuition.id)}
    >
      {/* Banner */}
      <div className="relative aspect-[16/9] overflow-hidden bg-soft">
        <img
          src={cover.src}
          srcSet={cover.srcSet}
          sizes="(min-width:1280px) 400px, (min-width:640px) 50vw, 100vw"
          alt=""
          loading="lazy"
          decoding="async"
          onError={(e) => {
            if (e.currentTarget.dataset.fallback) return;
            e.currentTarget.dataset.fallback = '1';
            e.currentTarget.removeAttribute('srcset');
            e.currentTarget.src = BANNER_FALLBACK;
          }}
          className="size-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0b1020]/70 via-[#0b1020]/10 to-transparent" aria-hidden />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {showStatus ? (
            <StatusBadge status={tuition.status} className="bg-base-100! shadow-sm" />
          ) : (
            isNew && <Badge className="bg-accent text-accent-content shadow-sm">New</Badge>
          )}
        </div>
        <div className="absolute right-3 top-3 z-10">
          <BookmarkButton tuitionId={tuition.id} className="border-transparent bg-base-100/95 shadow-sm" />
        </div>
        <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#12152b]">{tuition.subject}</span>
          <span className="rounded-full bg-[#0b1020]/60 px-2.5 py-1 text-xs font-medium text-white">{tuition.classLevel}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-sans text-lg font-semibold leading-snug tracking-tight">
          <Link
            to={`/tuitions/${tuition.id}`}
            className="outline-none after:absolute after:inset-0 after:rounded-[var(--radius-box)] focus-visible:after:outline-2 focus-visible:after:outline-primary"
          >
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-out-soft group-hover:bg-[length:100%_1px]">
              {tuition.title}
            </span>
          </Link>
        </h3>

        {tuition.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{tuition.description}</p>}

        <ul className="mb-5 mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-base-content/70">
          <li className="inline-flex items-center gap-1.5">
            <MapPin className="size-4 text-subtle" /> <span className="max-w-40 truncate">{tuition.location}</span>
          </li>
          <li className="inline-flex items-center gap-1.5">
            <ModeIcon className="size-4 text-subtle" /> {tuition.teachingMode}
          </li>
          {tuition.schedule && (
            <li className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-subtle" /> {tuition.schedule}
            </li>
          )}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-soft pt-4">
          <div>
            <p className="text-xs text-subtle">Monthly budget</p>
            <p className="font-display text-2xl font-semibold tracking-tight">{money(tuition.budget)}</p>
          </div>
          <div className="text-right text-xs text-subtle">
            <p>{timeAgo(tuition.createdAt)}</p>
            <p className="mt-0.5 inline-flex items-center gap-1">
              {tuition.applicationsCount || 0} applied
              <ArrowUpRight className="size-3.5 text-primary transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

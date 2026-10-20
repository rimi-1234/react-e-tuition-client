import { useId, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  BadgeCheck,
  Bookmark,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Camera,
  Check,
  ExternalLink,
  FileText,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  ErrorState,
  Field,
  InfoRow,
  Input,
  LoadingRegion,
  PageHeader,
  Select,
  Skeleton,
  StatCard,
  StatCardSkeleton,
  Textarea,
  notify,
} from '../../../components/ui';
import { useProfile, useUpdateProfile } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Reveal, Stagger } from '../../../motion';
import { cn } from '../../../utils/cn';
import { GENDERS, POPULAR_SUBJECTS, TEACHING_MODES } from '../../../utils/constants';
import { date, money } from '../../../utils/format';
import { uploadImage } from '../../../utils/upload';

const MAX_SUBJECTS = 12;
const BIO_MAX = 1000;
const ROLE_TONE = { Student: 'primary', Tutor: 'accent', Admin: 'info' };
const GENDER_OPTIONS = [{ value: '', label: 'Prefer not to say' }, ...GENDERS];
const MODE_OPTIONS = [{ value: '', label: 'Not set' }, ...TEACHING_MODES];
const TUTOR_FIELDS = ['subjects', 'experienceYears', 'qualification', 'institution', 'expectedSalary', 'teachingMode'];
const NUMBER_FIELDS = ['experienceYears', 'expectedSalary'];

const STATS = {
  Student: [
    { key: 'tuitionsPosted', label: 'Tuitions posted', icon: BookOpen, tone: 'primary' },
    { key: 'tutorsHired', label: 'Tutors hired', icon: Users, tone: 'success' },
    { key: 'totalSpent', label: 'Total spent', icon: Wallet, tone: 'accent', format: money },
    { key: 'savedTuitions', label: 'Saved tuitions', icon: Bookmark, tone: 'info' },
  ],
  Tutor: [
    { key: 'totalApplications', label: 'Applications', icon: FileText, tone: 'primary' },
    { key: 'approvedBookings', label: 'Bookings', icon: Briefcase, tone: 'success' },
    { key: 'totalEarned', label: 'Net earned', icon: Wallet, tone: 'accent', format: money },
    { key: 'avgRating', label: 'Average rating', icon: Star, tone: 'warning', format: (n) => n.toFixed(1) },
  ],
  Admin: [
    { key: 'users', label: 'Users', icon: Users, tone: 'primary' },
    { key: 'tutors', label: 'Tutors', icon: GraduationCap, tone: 'success' },
    { key: 'tuitions', label: 'Tuitions', icon: BookOpen, tone: 'info' },
    { key: 'platformEarnings', label: 'Platform earnings', icon: Wallet, tone: 'accent', format: money },
  ],
};

/** What counts toward a tutor's "complete profile" (it ranks higher in the directory). */
const COMPLETENESS = [
  { label: 'Profile photo', done: (v, p) => Boolean(p.photoURL) },
  { label: 'Phone number', done: (v) => Boolean(v.phone?.trim()) },
  { label: 'Location', done: (v) => Boolean(v.location?.trim()) },
  { label: 'Bio (60+ characters)', done: (v) => (v.bio?.trim().length || 0) >= 60 },
  { label: 'At least one subject', done: (v) => v.subjects?.length > 0 },
  { label: 'Years of experience', done: (v) => Number(v.experienceYears) > 0 },
  { label: 'Qualification', done: (v) => Boolean(v.qualification?.trim()) },
  { label: 'Institution', done: (v) => Boolean(v.institution?.trim()) },
  { label: 'Expected salary', done: (v) => Number(v.expectedSalary) > 0 },
  { label: 'Teaching mode', done: (v) => Boolean(v.teachingMode) },
];

const toFormValues = (p) => ({
  displayName: p.displayName || '',
  phone: p.phone || '',
  location: p.location || '',
  gender: p.gender || '',
  bio: p.bio || '',
  subjects: p.subjects || [],
  experienceYears: p.experienceYears ?? 0,
  qualification: p.qualification || '',
  institution: p.institution || '',
  expectedSalary: p.expectedSalary ?? 0,
  teachingMode: p.teachingMode || '',
});

export default function Profile() {
  useDocumentTitle('My profile');
  const { data: profile, isPending, error, refetch } = useProfile();

  if (error) {
    return (
      <>
        <PageHeader title="My profile" />
        <ErrorState error={error} onRetry={refetch} />
      </>
    );
  }
  if (isPending) return <ProfileSkeleton />;

  const isTutor = profile.role === 'Tutor';
  return (
    <>
      <PageHeader
        title="My profile"
        description={
          isTutor
            ? 'This is what students see in the tutor directory. A complete profile ranks higher.'
            : 'Keep your details up to date so tutors know who they’re working with.'
        }
        actions={
          isTutor && (
            <Button variant="outline" to={`/tutors/${profile.id}`} leftIcon={ExternalLink}>
              View public profile
            </Button>
          )
        }
      />
      <div className="space-y-6">
        <Reveal variant="fade" duration={0.5}>
          <ProfileHeader profile={profile} />
        </Reveal>
        <ProfileStats role={profile.role} stats={profile.stats} />
        <ProfileForm profile={profile} />
      </div>
    </>
  );
}

/* ── Header with cover band and photo upload ──────────────────────── */

function ProfileHeader({ profile }) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const save = useUpdateProfile({ success: 'Profile photo updated' });
  const busy = uploading || save.isPending;
  const name = profile.displayName || profile.email;

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const photoURL = await uploadImage(file, { maxWidth: 600 });
      setUploading(false);
      save.mutate({ photoURL });
    } catch (err) {
      setUploading(false);
      notify.error(err);
    }
  };

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="relative h-28 overflow-hidden bg-linear-to-br from-primary via-primary/70 to-accent/70 sm:h-36" aria-hidden>
        <div className="absolute inset-0 bg-dots opacity-40" />
        <div className="absolute -right-10 -top-16 size-56 bg-[radial-gradient(closest-side,rgb(255_255_255/0.18),transparent)]" />
        <div className="absolute -bottom-20 left-1/4 size-48 glow-accent" />
      </div>

      <div className="px-5 pb-6 sm:px-8">
        <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative w-fit">
              <Avatar src={profile.photoURL} name={name} size="2xl" ring verified={profile.role === 'Tutor' && profile.verified} />
              {busy && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-neutral/50 text-neutral-content" role="status">
                  <Loader2 className="size-6 animate-spin" aria-hidden />
                  <span className="sr-only">Uploading photo…</span>
                </span>
              )}
              <label
                htmlFor={inputId}
                className={cn(
                  'absolute bottom-1 left-1 flex size-9 cursor-pointer items-center justify-center rounded-full border border-soft bg-base-100 text-base-content shadow-[var(--shadow-soft)] transition-colors hover:text-primary',
                  'has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/20',
                  busy && 'pointer-events-none opacity-60',
                )}
                title="Change photo"
              >
                <Camera className="size-4" aria-hidden />
                <span className="sr-only">Change profile photo</span>
                <input id={inputId} type="file" accept="image/*" className="sr-only" onChange={onPick} disabled={busy} />
              </label>
            </div>
            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-2xl font-semibold sm:text-[1.75rem]">{name}</h2>
                <Badge tone={ROLE_TONE[profile.role] || 'neutral'}>{profile.role}</Badge>
                {profile.role === 'Tutor' &&
                  (profile.verified ? (
                    <Badge tone="success" icon={BadgeCheck}>
                      Verified
                    </Badge>
                  ) : (
                    <Badge tone="outline">Not verified yet</Badge>
                  ))}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <Mail className="size-4 shrink-0 text-subtle" aria-hidden />
                  <span className="truncate">{profile.email}</span>
                </span>
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-subtle" aria-hidden /> {profile.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-subtle" aria-hidden /> Member since {date(profile.createdAt, { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ── Role-specific numbers ────────────────────────────────────────── */

function ProfileStats({ role, stats = {} }) {
  const cards = STATS[role] || [];
  if (!cards.length) return null;
  return (
    <Stagger className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, ...card }) => (
        <StatCard
          key={key}
          {...card}
          value={Number(stats?.[key]) || 0}
          hint={key === 'avgRating' ? `${stats?.reviewCount || 0} reviews` : undefined}
        />
      ))}
    </Stagger>
  );
}

/* ── Edit form ────────────────────────────────────────────────────── */

const textRule = (label, max, min = 0) => ({
  ...(min ? { required: `${label} is required`, minLength: { value: min, message: `${label} needs at least ${min} characters` } } : {}),
  maxLength: { value: max, message: `${label} can be at most ${max} characters` },
});

const numberRule = (label, max) => ({
  validate: (v) => {
    if (v === '' || v === null || v === undefined) return true;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0) return `${label} must be a whole number`;
    if (n > max) return `${label} can be at most ${max.toLocaleString()}`;
    return true;
  },
});

/** Normalise one field's value for the API. */
const toApi = (key, value) => {
  if (key === 'subjects') return value;
  if (NUMBER_FIELDS.includes(key)) return Number(value) || 0;
  return typeof value === 'string' ? value.trim() : value;
};

function ProfileForm({ profile }) {
  const isTutor = profile.role === 'Tutor';
  const update = useUpdateProfile();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, dirtyFields, isDirty, defaultValues },
  } = useForm({ defaultValues: toFormValues(profile), mode: 'onTouched' });
  const values = useWatch({ control });
  const bioLength = values.bio?.length || 0;

  const onSubmit = handleSubmit(async (form) => {
    const keys = Object.keys(form).filter((k) => {
      if (!isTutor && TUTOR_FIELDS.includes(k)) return false;
      // Array dirtiness is per-index in RHF; compare the whole list instead.
      if (k === 'subjects') return JSON.stringify(form.subjects) !== JSON.stringify(defaultValues.subjects || []);
      return Boolean(dirtyFields[k]);
    });
    if (!keys.length) return notify.info('Nothing to save yet');

    const payload = Object.fromEntries(keys.map((k) => [k, toApi(k, form[k])]));
    try {
      await update.mutateAsync(payload);
      reset(form);
    } catch (error) {
      Object.entries(error?.fieldErrors || {}).forEach(([field, message], i) => {
        const name = field.split('.')[0];
        if (name in form) setError(name, { type: 'server', message }, { shouldFocus: i === 0 });
      });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="min-w-0 space-y-6">
        <Card>
          <CardHeader title="Personal details" description="Your name and photo appear on everything you post or apply to." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Full name" required icon={UserRound} autoComplete="name" error={errors.displayName?.message} {...register('displayName', textRule('Name', 80, 2))} />
            <Input
              label="Phone"
              type="tel"
              icon={Phone}
              autoComplete="tel"
              placeholder="+880 1XXX-XXXXXX"
              hint={isTutor ? 'Only shared with students who hire you.' : 'Only shared with tutors you hire.'}
              error={errors.phone?.message}
              {...register('phone', {
                maxLength: { value: 20, message: 'Phone can be at most 20 characters' },
                validate: (v) => !v.trim() || /^\+?[\d\s-]{7,20}$/.test(v.trim()) || 'Enter a valid phone number',
              })}
            />
            <Input label="Location" icon={MapPin} placeholder="e.g. Mirpur, Dhaka" error={errors.location?.message} {...register('location', textRule('Location', 80))} />
            <Select label="Gender" options={GENDER_OPTIONS} error={errors.gender?.message} {...register('gender')} />
            <div className="relative sm:col-span-2">
              <Textarea
                label="Bio"
                rows={5}
                maxLength={BIO_MAX}
                placeholder={
                  isTutor
                    ? 'Your teaching style, results you’re proud of, and the students you work best with…'
                    : 'A little about you or your child, e.g. school, goals, what kind of help you’re looking for…'
                }
                error={errors.bio?.message}
                {...register('bio', textRule('Bio', BIO_MAX))}
              />
              <span className={cn('absolute right-0 top-0.5 text-xs tabular-nums', bioLength > BIO_MAX * 0.95 ? 'text-warning' : 'text-subtle')} aria-hidden>
                {bioLength}/{BIO_MAX}
              </span>
            </div>
          </div>
        </Card>

        {isTutor && (
          <Card>
            <CardHeader title="Teaching profile" description="Students filter the tutor directory by these details." />
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                control={control}
                name="subjects"
                rules={{ validate: (v) => v.length <= MAX_SUBJECTS || `Up to ${MAX_SUBJECTS} subjects` }}
                render={({ field }) => (
                  <SubjectTags value={field.value} onChange={field.onChange} error={errors.subjects?.message} className="sm:col-span-2" />
                )}
              />
              <Input
                label="Experience"
                type="number"
                inputMode="numeric"
                min={0}
                max={60}
                icon={Briefcase}
                suffix={<span className="pr-1.5 text-xs font-medium text-subtle">years</span>}
                error={errors.experienceYears?.message}
                {...register('experienceYears', numberRule('Experience', 60))}
              />
              <Input
                label="Expected salary"
                type="number"
                inputMode="numeric"
                min={0}
                step={500}
                icon={Wallet}
                suffix={<span className="pr-1.5 text-xs font-medium text-subtle">BDT/mo</span>}
                error={errors.expectedSalary?.message}
                {...register('expectedSalary', numberRule('Salary', 1_000_000))}
              />
              <Input
                label="Qualification"
                icon={GraduationCap}
                placeholder="e.g. BSc in Physics (running)"
                error={errors.qualification?.message}
                {...register('qualification', textRule('Qualification', 200))}
              />
              <Input
                label="Institution"
                icon={Building2}
                placeholder="e.g. University of Dhaka"
                error={errors.institution?.message}
                {...register('institution', textRule('Institution', 120))}
              />
              <Select label="Teaching mode" options={MODE_OPTIONS} className="sm:col-span-2" error={errors.teachingMode?.message} {...register('teachingMode')} />
            </div>
          </Card>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        {isTutor ? <CompletenessCard values={values} profile={profile} /> : <AccountCard profile={profile} />}
        <Card className="p-5!">
          <p className="text-sm text-muted">{isDirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>
          <div className="mt-4 flex flex-col gap-2">
            <Button type="submit" leftIcon={Save} loading={update.isPending} disabled={!isDirty}>
              Save changes
            </Button>
            <Button variant="ghost" onClick={() => reset()} disabled={!isDirty || update.isPending}>
              Discard
            </Button>
          </div>
        </Card>
      </aside>
    </form>
  );
}

/** Type a subject and press Enter (or comma) to add it as a chip. */
function SubjectTags({ value = [], onChange, error, className }) {
  const [draft, setDraft] = useState('');
  const listId = useId();
  const full = value.length >= MAX_SUBJECTS;

  const add = () => {
    const s = draft.trim().replace(/,$/, '').slice(0, 40);
    if (!s) return;
    if (value.some((v) => v.toLowerCase() === s.toLowerCase())) {
      notify.info(`${s} is already in your list`);
    } else if (full) {
      notify.info(`You can list up to ${MAX_SUBJECTS} subjects`);
      return;
    } else {
      onChange([...value, s]);
    }
    setDraft('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <Field
      label="Subjects you teach"
      hint={error ? undefined : `${value.length}/${MAX_SUBJECTS} · press Enter to add`}
      error={error}
      className={className}
    >
      {(id, aria) => (
        <div
          className={cn(
            'flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border bg-base-100 px-2 py-1.5 transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/12',
            error ? 'border-error/70' : 'border-soft hover:border-base-content/20',
          )}
        >
          {value.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 py-1 pl-2.5 pr-1 text-sm font-medium text-primary">
              {s}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== s))}
                aria-label={`Remove ${s}`}
                className="flex size-5 items-center justify-center rounded-md transition-colors hover:bg-primary/15"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </span>
          ))}
          <input
            id={id}
            {...aria}
            list={listId}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => draft.trim() && add()}
            disabled={full}
            placeholder={full ? 'Subject limit reached' : value.length ? 'Add another…' : 'e.g. Physics'}
            className="h-8 min-w-28 flex-1 bg-transparent px-1.5 text-[15px] outline-none placeholder:text-subtle disabled:cursor-not-allowed"
            autoComplete="off"
          />
          {draft.trim() && !full && (
            <button
              type="button"
              onClick={add}
              aria-label={`Add ${draft.trim()}`}
              className="flex size-8 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10"
            >
              <Plus className="size-4" aria-hidden />
            </button>
          )}
          <datalist id={listId}>
            {POPULAR_SUBJECTS.filter((s) => !value.includes(s)).map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      )}
    </Field>
  );
}

function CompletenessCard({ values, profile }) {
  const checks = COMPLETENESS.map((c) => ({ label: c.label, done: c.done(values, profile) }));
  const done = checks.filter((c) => c.done).length;
  const pct = Math.round((done / checks.length) * 100);
  const missing = checks.filter((c) => !c.done);
  const tone = pct === 100 ? 'bg-success' : pct >= 60 ? 'bg-primary' : 'bg-accent';

  return (
    <Card className="p-5!">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-sans text-base font-semibold">Profile completeness</p>
          <p className="mt-0.5 text-sm text-muted">Complete profiles rank higher in the tutor directory.</p>
        </div>
        <span className="font-display text-2xl font-semibold tabular-nums">{pct}%</span>
      </div>
      <div
        className="mt-4 h-2.5 overflow-hidden rounded-full bg-soft"
        role="progressbar"
        aria-label="Profile completeness"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className={cn('h-full rounded-full transition-[width] duration-700 ease-out-soft', tone)} style={{ width: `${pct}%` }} />
      </div>
      {missing.length ? (
        <ul className="mt-4 space-y-2 text-sm">
          {missing.slice(0, 5).map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-muted">
              <span className="size-1.5 shrink-0 rounded-full bg-base-content/25" aria-hidden />
              Add {c.label.charAt(0).toLowerCase() + c.label.slice(1)}
            </li>
          ))}
          {missing.length > 5 && <li className="pl-3.5 text-xs text-subtle">and {missing.length - 5} more</li>}
        </ul>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-success">
          <Sparkles className="size-4" aria-hidden /> Your profile is complete. Nice work!
        </p>
      )}
      {!profile.verified && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-soft px-3 py-2.5 text-xs text-muted">
          <ShieldCheck className="mt-px size-4 shrink-0 text-primary" aria-hidden />
          Our team verifies tutors after reviewing their profile. Verified tutors get a badge and more hires.
        </p>
      )}
    </Card>
  );
}

function AccountCard({ profile }) {
  return (
    <Card className="p-5!">
      <p className="font-sans text-base font-semibold">Account</p>
      <div className="mt-2 divide-y divide-base-content/8">
        <InfoRow icon={Mail} label="Email" value={profile.email} />
        <InfoRow icon={ShieldCheck} label="Role" value={profile.role} />
        <InfoRow icon={CalendarDays} label="Member since" value={date(profile.createdAt)} />
      </div>
      <p className="mt-3 flex items-start gap-2 text-xs text-subtle">
        <Check className="mt-px size-3.5 shrink-0 text-success" aria-hidden />
        Your email is managed by your sign-in provider and can’t be changed here.
      </p>
    </Card>
  );
}

/* ── Loading ──────────────────────────────────────────────────────── */

function ProfileSkeleton() {
  return (
    <LoadingRegion label="Loading profile" className="space-y-6">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Card padded={false} className="overflow-hidden">
        <Skeleton className="h-28 sm:h-36" rounded="rounded-none" />
        <div className="flex flex-col gap-4 px-5 pb-6 sm:flex-row sm:items-end sm:px-8">
          <Skeleton className="-mt-12 size-28 ring-4 ring-base-100" rounded="rounded-full" />
          <div className="flex-1 space-y-2 pb-1">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="space-y-5">
          <Skeleton className="h-5 w-40" />
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-11 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-32 rounded-xl" />
        </Card>
        <Skeleton className="h-56 rounded-[var(--radius-box)]" />
      </div>
    </LoadingRegion>
  );
}

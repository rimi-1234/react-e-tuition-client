import { useEffect, useId, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  BookOpen,
  CalendarDays,
  Check,
  GraduationCap,
  ImagePlus,
  Laptop,
  Lightbulb,
  MapPin,
  Send,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { Badge, Button, Card, CardHeader, ChoiceGroup, Input, Select, Textarea, notify } from '../ui';
import { cn } from '../../utils/cn';
import {
  CLASS_LEVELS,
  EXPERIENCE_LEVELS,
  GENDERS,
  POPULAR_SUBJECTS,
  TEACHING_MODES,
  TUTOR_PREFERENCES,
} from '../../utils/constants';
import { money } from '../../utils/format';
import { uploadImage } from '../../utils/upload';

const MAX_PHOTOS = 4;
const DESCRIPTION_MAX = 3000;

const EMPTY = {
  title: '',
  subject: '',
  classLevel: '',
  location: '',
  budget: '',
  schedule: '',
  description: '',
  teachingMode: 'Both',
  studentGender: '',
  preferredTutor: 'Any',
  experienceNeeded: 'Any',
};

const modeIcon = { Online: Laptop, 'Home Visit': MapPin, Both: Users };
const MODE_OPTIONS = TEACHING_MODES.map((m) => ({ value: m, label: m, icon: modeIcon[m] }));
const GENDER_OPTIONS = [{ value: '', label: 'Prefer not to say' }, ...GENDERS];

const TIPS = [
  'A specific title (“HSC Physics, 3 days a week”) gets more relevant applicants.',
  'Mention the syllabus, current level and the goal, e.g. exam prep.',
  'A fair budget for the area gets tutors applying faster.',
];

/** Pick only the form fields from a tuition (or partial defaults). */
const toFormValues = (defaults = {}) =>
  Object.fromEntries(Object.entries(EMPTY).map(([k, v]) => [k, defaults[k] ?? v]));

const lengthRule = (label, min, max) => ({
  ...(min ? { required: `${label} is required`, minLength: { value: min, message: `${label} needs at least ${min} characters` } } : {}),
  maxLength: { value: max, message: `${label} can be at most ${max} characters` },
});

/**
 * Create / edit form for a tuition post, shared by PostTuition and EditTuition.
 * `onSubmit(payload)` should reject with the ApiError so 422s land on fields.
 */
export default function TuitionForm({ defaultValues, onSubmit, submitLabel = 'Publish tuition', submitting = false }) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: toFormValues(defaultValues), mode: 'onTouched' });

  const [title, subject, classLevel, location, budget, teachingMode, description] = useWatch({
    control,
    name: ['title', 'subject', 'classLevel', 'location', 'budget', 'teachingMode', 'description'],
  });

  const photos = usePhotos(defaultValues?.media);
  const [uploading, setUploading] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const busy = submitting || uploading || isSubmitting;

  const submit = handleSubmit(async (values) => {
    setMediaError('');
    let media;
    try {
      setUploading(photos.items.some((p) => p.file));
      media = await photos.resolve();
    } catch (error) {
      setMediaError(error.message);
      notify.error(error);
      return;
    } finally {
      setUploading(false);
    }

    const payload = {
      title: values.title.trim(),
      subject: values.subject.trim(),
      classLevel: values.classLevel,
      location: values.location.trim(),
      budget: Number(values.budget),
      schedule: values.schedule.trim(),
      description: values.description.trim(),
      studentGender: values.studentGender,
      preferredTutor: values.preferredTutor,
      teachingMode: values.teachingMode,
      experienceNeeded: values.experienceNeeded,
      media,
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      // The mutation already toasted; put server validation messages next to their fields.
      const fieldErrors = error?.fieldErrors || {};
      Object.entries(fieldErrors).forEach(([field, message], i) => {
        if (field.startsWith('media')) setMediaError(message);
        else if (field in EMPTY) setError(field, { type: 'server', message }, { shouldFocus: i === 0 });
      });
    }
  });

  const descriptionLength = description?.length || 0;
  const ModeIcon = modeIcon[teachingMode] || Users;

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="min-w-0 space-y-6">
        <Card>
          <CardHeader title="Basics" description="What do you need help with, and where?" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Title"
              required
              placeholder="e.g. HSC Physics tutor for 1st year"
              className="sm:col-span-2"
              error={errors.title?.message}
              {...register('title', lengthRule('Title', 5, 120))}
            />
            <SubjectInput register={register} error={errors.subject?.message} />
            <Select
              label="Class / level"
              required
              placeholder="Select a level"
              options={CLASS_LEVELS}
              icon={GraduationCap}
              error={errors.classLevel?.message}
              {...register('classLevel', { required: 'Choose a class or level' })}
            />
            <Input
              label="Location"
              required
              placeholder="e.g. Dhanmondi, Dhaka"
              icon={MapPin}
              className="sm:col-span-2"
              error={errors.location?.message}
              {...register('location', lengthRule('Location', 2, 80))}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Details" description="Budget, timing and what the tutor should know." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Monthly budget"
              required
              type="number"
              inputMode="numeric"
              min={500}
              step={100}
              placeholder="6000"
              icon={Wallet}
              suffix={<span className="pr-1.5 text-xs font-medium text-subtle">BDT</span>}
              hint="Per month, in Taka (minimum ৳500)."
              error={errors.budget?.message}
              {...register('budget', {
                required: 'Enter a monthly budget',
                validate: (v) => {
                  const n = Number(v);
                  if (!Number.isFinite(n)) return 'Enter a number';
                  if (!Number.isInteger(n)) return 'Use a whole number';
                  if (n < 500) return 'Budget should be at least ৳500';
                  if (n > 1_000_000) return 'That budget looks too high';
                  return true;
                },
              })}
            />
            <Input
              label="Schedule"
              placeholder="e.g. 3 days/week, evenings"
              icon={CalendarDays}
              error={errors.schedule?.message}
              {...register('schedule', lengthRule('Schedule', 0, 120))}
            />
            <div className="relative sm:col-span-2">
              <Textarea
                label="Description"
                required
                rows={6}
                maxLength={DESCRIPTION_MAX}
                placeholder="Current level, syllabus or book, goals, preferred days, anything that helps a tutor decide…"
                error={errors.description?.message}
                hint="At least 20 characters."
                {...register('description', lengthRule('Description', 20, DESCRIPTION_MAX))}
              />
              <span
                className={cn(
                  'absolute right-0 top-0.5 text-xs tabular-nums',
                  descriptionLength > DESCRIPTION_MAX * 0.95 ? 'text-warning' : 'text-subtle',
                )}
                aria-hidden
              >
                {descriptionLength.toLocaleString()}/{DESCRIPTION_MAX.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Preferences" description="Optional, but they help the right tutors find you." />
          <div className="space-y-6">
            <Controller
              control={control}
              name="teachingMode"
              render={({ field }) => (
                <ChoiceGroup label="Teaching mode" name={field.name} options={MODE_OPTIONS} value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              control={control}
              name="preferredTutor"
              render={({ field }) => (
                <ChoiceGroup label="Preferred tutor" name={field.name} options={TUTOR_PREFERENCES} value={field.value} onChange={field.onChange} />
              )}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Select label="Student’s gender" options={GENDER_OPTIONS} {...register('studentGender')} />
              <Select label="Tutor experience" options={EXPERIENCE_LEVELS} {...register('experienceNeeded')} />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Photos (optional)" description={`Up to ${MAX_PHOTOS} images, e.g. the syllabus or a book page.`} />
          <PhotoPicker photos={photos} error={mediaError} disabled={busy} />
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <Card padded={false} className="overflow-hidden">
          <div className="border-b border-soft bg-soft/60 px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Live preview</p>
          </div>
          <div className="space-y-4 p-5">
            <div className="flex flex-wrap gap-2">
              <Badge tone="primary" icon={BookOpen}>
                {subject?.trim() || 'Subject'}
              </Badge>
              {classLevel && <Badge>{classLevel}</Badge>}
            </div>
            <h3 className={cn('line-clamp-3 break-words font-sans text-lg font-semibold leading-snug tracking-tight', !title?.trim() && 'text-subtle')}>
              {title?.trim() || 'Your tuition title'}
            </h3>
            <ul className="space-y-1.5 text-[13px] text-base-content/70">
              <li className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0 text-subtle" aria-hidden />
                <span className="truncate">{location?.trim() || 'Location'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ModeIcon className="size-4 shrink-0 text-subtle" aria-hidden />
                {teachingMode}
              </li>
            </ul>
            <div className="border-t border-soft pt-4">
              <p className="text-xs text-subtle">Monthly budget</p>
              <p className="font-display text-2xl font-semibold tracking-tight">{Number(budget) > 0 ? money(budget) : '৳—'}</p>
            </div>
            <Button type="submit" className="w-full" leftIcon={Send} loading={busy}>
              {uploading ? 'Uploading photos…' : submitLabel}
            </Button>
          </div>
        </Card>

        <Card className="p-5!">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="size-4 text-accent" aria-hidden /> Tips for more applicants
          </p>
          <ul className="space-y-2.5 text-sm text-muted">
            {TIPS.map((tip) => (
              <li key={tip} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      </aside>
    </form>
  );
}

/** Free-text subject with suggestions from a datalist. */
function SubjectInput({ register, error }) {
  const listId = useId();
  return (
    <>
      <Input
        label="Subject"
        required
        placeholder="e.g. Mathematics"
        icon={BookOpen}
        list={listId}
        autoComplete="off"
        error={error}
        {...register('subject', lengthRule('Subject', 2, 60))}
      />
      <datalist id={listId}>
        {POPULAR_SUBJECTS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </>
  );
}

/**
 * Photo list state: existing URLs plus newly picked files (with object-URL
 * previews). `resolve()` uploads the new files and returns every URL in order.
 */
function usePhotos(initial = []) {
  const [items, setItems] = useState(() => (initial || []).map((url) => ({ id: url, url, preview: url })));
  const created = useRef(new Set());

  useEffect(() => {
    const urls = created.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const add = (files) => {
    const room = MAX_PHOTOS - items.length;
    const picked = [...files].filter((f) => f.type.startsWith('image/'));
    if (picked.length > room) notify.info(`You can attach up to ${MAX_PHOTOS} photos.`);
    const next = picked.slice(0, Math.max(0, room)).map((file) => {
      const preview = URL.createObjectURL(file);
      created.current.add(preview);
      return { id: preview, file, preview };
    });
    if (next.length) setItems((prev) => [...prev, ...next]);
  };

  const remove = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    if (created.current.has(id)) {
      URL.revokeObjectURL(id);
      created.current.delete(id);
    }
  };

  const resolve = async () => {
    const urls = await Promise.all(items.map((p) => (p.file ? uploadImage(p.file) : p.url)));
    // Uploaded files become plain URLs so a retry after a server error doesn't re-upload.
    setItems((prev) => prev.map((p, i) => (p.file && urls[i] ? { ...p, file: undefined, url: urls[i] } : p)));
    return urls;
  };

  return { items, add, remove, resolve };
}

function PhotoPicker({ photos, error, disabled }) {
  const hintId = useId();
  const full = photos.items.length >= MAX_PHOTOS;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.items.map((p, i) => (
          <div key={p.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-soft bg-soft">
            <img src={p.preview} alt={`Photo ${i + 1}`} className="size-full object-cover" />
            {p.file && (
              <span className="absolute bottom-2 left-2 rounded-full bg-base-100/90 px-2 py-0.5 text-[11px] font-medium text-base-content/80">New</span>
            )}
            <button
              type="button"
              onClick={() => photos.remove(p.id)}
              disabled={disabled}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-base-100/90 text-base-content shadow-sm transition-colors hover:bg-error hover:text-error-content disabled:opacity-50"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}

        {!full && (
          <label
            className={cn(
              'flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-soft bg-base-100 p-3 text-center text-sm text-muted transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
              'has-[:focus-visible]:border-primary has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/12',
              disabled && 'pointer-events-none opacity-60',
              error && 'border-error/60',
            )}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ImagePlus className="size-5" aria-hidden />
            </span>
            <span className="font-medium">Add photo</span>
            <span className="text-xs text-subtle">
              {photos.items.length}/{MAX_PHOTOS}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={disabled}
              aria-describedby={hintId}
              onChange={(e) => {
                photos.add(e.target.files || []);
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>
      <p id={hintId} className={cn('text-xs', error ? 'text-error' : 'text-subtle')} role={error ? 'alert' : undefined}>
        {error || 'JPG or PNG up to 8 MB. Images are compressed before upload.'}
      </p>
    </div>
  );
}

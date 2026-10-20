import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const control =
  'w-full rounded-xl border bg-base-100 text-[15px] text-base-content placeholder:text-subtle ' +
  'transition-[border-color,box-shadow] duration-200 outline-none ' +
  'focus:border-primary focus:ring-4 focus:ring-primary/12 disabled:cursor-not-allowed disabled:opacity-60';

const stateClass = (error) => (error ? 'border-error/70 focus:border-error focus:ring-error/12' : 'border-soft hover:border-base-content/20');

/**
 * Label + control + hint/error, wired up with ids and aria attributes.
 * `children` receives the generated id via render prop.
 */
export function Field({ label, hint, error, required, className, children, htmlFor }) {
  const autoId = useId();
  const id = htmlFor || autoId;
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-base-content/90">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
      )}
      {children(id, { 'aria-invalid': Boolean(error) || undefined, 'aria-describedby': error || hint ? `${id}-msg` : undefined })}
      {(error || hint) && (
        <p id={`${id}-msg`} className={cn('text-xs', error ? 'text-error' : 'text-subtle')} role={error ? 'alert' : undefined}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

/** React 19: `ref` is a normal prop, so react-hook-form's register() works directly. */
export function Input({ label, hint, error, required, icon: Icon, suffix, className, inputClassName, ref, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(id, aria) => (
        <div className="relative">
          {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-subtle" aria-hidden />}
          <input
            id={id}
            ref={ref}
            className={cn(control, stateClass(error), 'h-11 px-3.5', Icon && 'pl-10', suffix && 'pr-12', inputClassName)}
            {...aria}
            {...props}
          />
          {suffix && <div className="absolute right-2 top-1/2 -translate-y-1/2">{suffix}</div>}
        </div>
      )}
    </Field>
  );
}

export function Textarea({ label, hint, error, required, className, rows = 5, ref, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(id, aria) => (
        <textarea id={id} ref={ref} rows={rows} className={cn(control, stateClass(error), 'resize-y px-3.5 py-3 leading-relaxed')} {...aria} {...props} />
      )}
    </Field>
  );
}

/** options: string[] or { value, label }[] */
export function Select({ label, hint, error, required, options = [], placeholder, className, icon: Icon, ref, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(id, aria) => (
        <div className="relative">
          {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-subtle" aria-hidden />}
          <select id={id} ref={ref} className={cn(control, stateClass(error), 'h-11 appearance-none pl-3.5 pr-10', Icon && 'pl-10')} {...aria} {...props}>
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((o) => {
              const opt = typeof o === 'string' ? { value: o, label: o } : o;
              return (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              );
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden />
        </div>
      )}
    </Field>
  );
}

/** Pill-style single choice (radio group) — friendlier than a select for 2–4 options. */
export function ChoiceGroup({ label, options, value, onChange, error, name, className }) {
  return (
    <fieldset className={cn('space-y-1.5', className)}>
      {label && <legend className="mb-1.5 text-sm font-medium text-base-content/90">{label}</legend>}
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          const active = value === opt.value;
          return (
            <label
              key={opt.value}
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-colors',
                active ? 'border-primary bg-primary/8 text-primary' : 'border-soft bg-base-100 hover:border-base-content/20',
              )}
            >
              <input type="radio" name={name} value={opt.value} checked={active} onChange={() => onChange(opt.value)} className="sr-only" />
              {opt.icon && <opt.icon className="size-4" aria-hidden />}
              {opt.label}
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </fieldset>
  );
}

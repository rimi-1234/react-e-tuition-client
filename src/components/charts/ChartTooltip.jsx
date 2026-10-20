/**
 * Themed tooltip body for every Recharts chart. Rendered as HTML, so it can
 * use design tokens directly (unlike the SVG marks).
 *
 *   <Tooltip content={(p) => <ChartTooltip {...p} format={money} />} />
 */
export function ChartTooltip({ active, payload, label, format = (v) => v, labelFormat = (l) => l, hideLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-36 rounded-xl border border-soft bg-base-100 px-3.5 py-2.5 text-xs shadow-[var(--shadow-lift)]">
      {!hideLabel && label !== undefined && <p className="mb-1.5 font-medium text-subtle">{labelFormat(label)}</p>}
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li key={entry.dataKey ?? entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted">
              <span className="size-2 rounded-full" style={{ background: entry.payload?.fill || entry.color }} aria-hidden />
              {entry.name}
            </span>
            <span className="font-semibold tabular-nums text-base-content">{format(entry.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** HTML legend for multi-series charts (text stays in ink colours; the dot carries identity). */
export function ChartLegend({ items, className = '' }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted ${className}`}>
      {items.map((item) => (
        <li key={item.name} className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-full" style={{ background: item.color }} aria-hidden />
          {item.name}
        </li>
      ))}
    </ul>
  );
}

/** Calm overlay shown on a chart whose series are all zero. */
export function ChartEmptyOverlay({ text }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <p className="rounded-full border border-soft bg-base-100/90 px-3.5 py-1.5 text-xs font-medium text-muted shadow-[var(--shadow-soft)]">{text}</p>
    </div>
  );
}

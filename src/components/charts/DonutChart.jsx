import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useChartColors } from '../../hooks/useChartColors';
import { useReducedMotion } from '../../motion';
import { ChartTooltip } from './ChartTooltip';
import { resolveColor, valueFormatter } from './scale';

/**
 * Donut with a centre total and a legend list beside it.
 *
 *   <DonutChart data={[{ name: 'Live', value: 4, color: 'success' }]} centerLabel="tuitions" />
 */
export function DonutChart({ data = [], centerLabel = 'Total', centerValue, format, size = 176, className = '' }) {
  const colors = useChartColors();
  const reduced = useReducedMotion();
  const fmt = valueFormatter(format);
  const slices = data.map((d, i) => ({ ...d, value: Number(d.value) || 0, fill: resolveColor(colors, d.color, i) }));
  const total = slices.reduce((sum, d) => sum + d.value, 0);
  const shown = total ? slices.filter((d) => d.value > 0) : [{ name: 'None', value: 1, fill: colors.grid }];

  return (
    <div className={`flex flex-col items-center gap-6 sm:flex-row sm:items-center ${className}`}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={shown}
              dataKey="value"
              nameKey="name"
              innerRadius="72%"
              outerRadius="100%"
              paddingAngle={shown.length > 1 ? 2 : 0}
              cornerRadius={4}
              stroke={colors.surface}
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={!reduced}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {shown.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Pie>
            {total > 0 && <Tooltip content={(p) => <ChartTooltip {...p} format={fmt} hideLabel />} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-3xl font-semibold tabular-nums leading-none">{centerValue ?? fmt(total)}</span>
          <span className="mt-1.5 text-xs text-subtle">{centerLabel}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2.5">
        {slices.map((d) => {
          const pct = total ? Math.round((d.value / total) * 100) : 0;
          return (
            <li key={d.name} className="flex items-center gap-3 text-sm">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.fill }} aria-hidden />
              <span className="min-w-0 flex-1 truncate text-muted">{d.name}</span>
              <span className="font-semibold tabular-nums">{fmt(d.value)}</span>
              <span className="w-10 text-right text-xs tabular-nums text-subtle">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

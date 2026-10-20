import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartColors } from '../../hooks/useChartColors';
import { useReducedMotion } from '../../motion';
import { ChartEmptyOverlay, ChartLegend, ChartTooltip } from './ChartTooltip';
import { isAllZero, resolveColor, svgId, tickFormatter, valueFormatter } from './scale';

/**
 * Smooth gradient area chart.
 *
 *   <AreaTrend data={rows} xKey="label" series={[{ key: 'amount', name: 'Spent' }]} money />
 *
 * series: [{ key, name, color? }] — color is a token name ('primary', 'accent' …).
 */
export function AreaTrend({
  data = [],
  xKey = 'label',
  series,
  dataKey = 'amount',
  name = 'Value',
  money: isMoney = false,
  format,
  xFormat,
  height = 260,
  emptyText = 'No activity in this period yet',
  className = '',
}) {
  const colors = useChartColors();
  const reduced = useReducedMotion();
  const uid = svgId(useId());
  const lines = (series || [{ key: dataKey, name }]).map((s, i) => ({ ...s, color: resolveColor(colors, s.color, i) }));
  const fmt = valueFormatter(format, isMoney);
  const empty = isAllZero(data, lines.map((l) => l.key));

  return (
    <div className={className}>
      {lines.length > 1 && <ChartLegend items={lines} className="mb-4" />}
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {lines.map((l) => (
                <linearGradient key={l.key} id={`${uid}-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={l.color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={l.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke={colors.grid} />
            <XAxis
              dataKey={xKey}
              tickFormatter={xFormat}
              tick={{ fill: colors.axis, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={24}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={tickFormatter(isMoney)}
              tick={{ fill: colors.axis, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={52}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: colors.axis, strokeWidth: 1, strokeDasharray: '4 4' }}
              content={(p) => <ChartTooltip {...p} format={fmt} labelFormat={xFormat} />}
            />
            {lines.map((l) => (
              <Area
                key={l.key}
                type="monotone"
                dataKey={l.key}
                name={l.name}
                stroke={l.color}
                strokeWidth={2}
                fill={`url(#${uid}-${l.key})`}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: colors.surface, fill: l.color }}
                isAnimationActive={!reduced}
                animationDuration={900}
                animationEasing="ease-out"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        {empty && <ChartEmptyOverlay text={emptyText} />}
      </div>
    </div>
  );
}

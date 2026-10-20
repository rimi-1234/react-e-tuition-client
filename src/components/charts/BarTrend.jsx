import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartColors } from '../../hooks/useChartColors';
import { useReducedMotion } from '../../motion';
import { ChartEmptyOverlay, ChartLegend, ChartTooltip } from './ChartTooltip';
import { isAllZero, resolveColor, tickFormatter, valueFormatter } from './scale';

/**
 * Rounded vertical bars over time.
 *
 *   <BarTrend data={rows} xKey="date" dataKey="signups" name="Sign-ups" color="secondary" />
 */
export function BarTrend({
  data = [],
  xKey = 'label',
  series,
  dataKey = 'value',
  name = 'Value',
  color,
  money: isMoney = false,
  format,
  xFormat,
  height = 240,
  emptyText = 'Nothing recorded in this period',
  className = '',
}) {
  const colors = useChartColors();
  const reduced = useReducedMotion();
  const bars = (series || [{ key: dataKey, name, color }]).map((s, i) => ({ ...s, color: resolveColor(colors, s.color, i) }));
  const fmt = valueFormatter(format, isMoney);
  const empty = isAllZero(data, bars.map((b) => b.key));

  return (
    <div className={className}>
      {bars.length > 1 && <ChartLegend items={bars} className="mb-4" />}
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
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
            <YAxis tickFormatter={tickFormatter(isMoney)} tick={{ fill: colors.axis, fontSize: 12 }} tickLine={false} axisLine={false} width={40} allowDecimals={false} />
            <Tooltip cursor={{ fill: colors.grid }} content={(p) => <ChartTooltip {...p} format={fmt} labelFormat={xFormat} />} />
            {bars.map((b) => (
              <Bar
                key={b.key}
                dataKey={b.key}
                name={b.name}
                fill={b.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
                isAnimationActive={!reduced}
                animationDuration={800}
                animationEasing="ease-out"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        {empty && <ChartEmptyOverlay text={emptyText} />}
      </div>
    </div>
  );
}

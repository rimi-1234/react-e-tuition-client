import { useMemo } from 'react';
import { useTheme } from '../providers/ThemeProvider';

const read = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Resolved design-token colours for Recharts. SVG presentation attributes
 * can't resolve CSS variables, so charts read the computed values and
 * re-read them whenever the theme flips.
 */
export function useChartColors() {
  const { resolved } = useTheme();
  return useMemo(() => {
    const content = read('--color-base-content') || '#12152b';
    return {
      primary: read('--color-primary') || '#5b5bf0',
      accent: read('--color-accent') || '#f5a524',
      secondary: read('--color-secondary') || '#0f9f94',
      success: read('--color-success') || '#0f9f6e',
      warning: read('--color-warning') || '#c97a06',
      error: read('--color-error') || '#e11d48',
      info: read('--color-info') || '#2563eb',
      content,
      surface: read('--color-base-100') || '#ffffff',
      // 8-digit hex alpha works inside SVG attributes (color-mix may not).
      grid: `${content}14`,
      axis: `${content}80`,
      // Categorical order for pies / multi-series
      series: [read('--color-primary'), read('--color-accent'), read('--color-secondary'), read('--color-info'), read('--color-error')],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved]);
}

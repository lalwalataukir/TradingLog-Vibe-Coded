import { describe, expect, it } from 'vitest';

import { formatCompactCurrency, formatCurrency, formatPercentage } from '@/lib/format';

describe('format helpers', () => {
  it('formats signed percentages', () => {
    expect(formatPercentage(12.34)).toBe('+12.3%');
    expect(formatPercentage(-2.34)).toBe('-2.3%');
  });

  it('formats standard and compact currency values', () => {
    expect(formatCurrency(123456, 'INR')).toContain('₹');
    expect(formatCurrency(123456, 'USD')).toContain('$');
    expect(formatCompactCurrency(123456, 'INR')).toContain('₹');
  });
});

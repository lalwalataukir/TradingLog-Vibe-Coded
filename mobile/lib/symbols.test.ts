import { describe, expect, it } from 'vitest';

import { getSymbolMatches, getSymbolPlaceholder } from '@/lib/symbols';

describe('symbol helpers', () => {
  it('returns market-specific placeholders', () => {
    expect(getSymbolPlaceholder('indian_equity')).toBe('Search NSE symbols');
    expect(getSymbolPlaceholder('indian_fo')).toBe('Search F&O underlyings');
    expect(getSymbolPlaceholder('us_equity')).toBe('Search US symbols');
  });

  it('prioritizes symbol-prefix matches within a market', () => {
    const matches = getSymbolMatches('RELI', 'indian_equity', 5);

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((item) => item.market === 'indian_equity')).toBe(true);
    expect(matches.some((item) => item.symbol === 'RELIANCE')).toBe(true);
  });

  it('returns market-filtered results for us equities', () => {
    const matches = getSymbolMatches('AAPL', 'us_equity', 5);

    expect(matches.some((item) => item.symbol === 'AAPL')).toBe(true);
    expect(matches.every((item) => item.market === 'us_equity')).toBe(true);
  });
});

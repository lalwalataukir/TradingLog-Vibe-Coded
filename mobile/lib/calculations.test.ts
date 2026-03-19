import { describe, expect, it } from 'vitest';

import {
  calculateExpectancy,
  calculatePnl,
  calculatePnlNet,
  calculatePnlPercentage,
  calculatePositionSizePct,
  calculateProfitFactor,
  calculateRiskRewardActual,
  calculateRiskRewardPlanned,
  directionMultiplier,
} from '@/lib/calculations';

describe('calculations', () => {
  it('applies the correct multiplier for long and short trades', () => {
    expect(directionMultiplier('long')).toBe(1);
    expect(directionMultiplier('short')).toBe(-1);
  });

  it('calculates long and short pnl correctly', () => {
    expect(calculatePnl(100, 110, 5, 'long')).toBe(50);
    expect(calculatePnl(100, 90, 5, 'short')).toBe(50);
  });

  it('subtracts fees from pnl net', () => {
    expect(calculatePnlNet(100, 110, 5, 'long', 3, 2)).toBe(45);
  });

  it('returns zero when percentage denominators are zero', () => {
    expect(calculatePnlPercentage(0, 5, 100)).toBe(0);
    expect(calculatePositionSizePct(100, 5, 0)).toBe(0);
  });

  it('calculates planned and actual risk reward', () => {
    expect(calculateRiskRewardPlanned(100, 95, 115)).toBe(3);
    expect(calculateRiskRewardActual(100, 95, 110)).toBe(2);
  });

  it('calculates profit factor from mixed outcomes', () => {
    expect(calculateProfitFactor([100, -40, 20, -10])).toBeCloseTo(2.4);
  });

  it('calculates expectancy from win and loss rates', () => {
    expect(calculateExpectancy(0.6, 200, 0.4, 100)).toBe(80);
  });
});

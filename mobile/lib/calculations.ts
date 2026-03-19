import type { TradeDirection } from '@/lib/types';

function safeDivide(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}

export function directionMultiplier(direction: TradeDirection) {
  return direction === 'long' ? 1 : -1;
}

export function calculatePnl(entryPrice: number, exitPrice: number, quantity: number, direction: TradeDirection) {
  return (exitPrice - entryPrice) * quantity * directionMultiplier(direction);
}

export function calculatePnlNet(
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  direction: TradeDirection,
  entryFees = 0,
  exitFees = 0
) {
  return calculatePnl(entryPrice, exitPrice, quantity, direction) - entryFees - exitFees;
}

export function calculatePnlPercentage(
  entryPrice: number,
  quantity: number,
  pnlNet: number
) {
  return safeDivide(pnlNet, entryPrice * quantity) * 100;
}

export function calculateRiskRewardPlanned(entryPrice: number, stopLoss: number, target: number) {
  return safeDivide(Math.abs(target - entryPrice), Math.abs(entryPrice - stopLoss));
}

export function calculateRiskRewardActual(entryPrice: number, stopLoss: number, exitPrice: number) {
  return safeDivide(Math.abs(exitPrice - entryPrice), Math.abs(entryPrice - stopLoss));
}

export function calculatePositionSizePct(entryPrice: number, quantity: number, totalCapital: number) {
  return safeDivide(entryPrice * quantity, totalCapital) * 100;
}

export function calculateProfitFactor(values: number[]) {
  const grossWins = values.filter((value) => value > 0).reduce((sum, value) => sum + value, 0);
  const grossLosses = Math.abs(values.filter((value) => value < 0).reduce((sum, value) => sum + value, 0));
  return safeDivide(grossWins, grossLosses);
}

export function calculateExpectancy(winRate: number, averageWin: number, lossRate: number, averageLoss: number) {
  return winRate * averageWin - lossRate * averageLoss;
}

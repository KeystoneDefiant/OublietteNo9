import { gameConfig, getCurrentGameMode } from '../config/gameConfig';

export type GameConfig = typeof gameConfig;
export const config = gameConfig;

// Get current game mode settings
const currentMode = getCurrentGameMode();

// Helper functions for cost calculations
export function calculateWildCardCost(wildCardCount: number): number {
  const baseCost = currentMode.shop.wildCard.baseCost;
  const multiplier = 1 + currentMode.shop.wildCard.increasePercent / 100;
  return Math.floor(baseCost * Math.pow(multiplier, wildCardCount));
}

export function calculateSingleDeadCardRemovalCost(removalCount: number): number {
  const baseCost = currentMode.shop.singleDeadCardRemoval.baseCost;
  const multiplier = 1 + currentMode.shop.singleDeadCardRemoval.increasePercent / 100;
  return Math.floor(baseCost * Math.pow(multiplier, removalCount));
}

export function calculateAllDeadCardsRemovalCost(
  removalCount: number,
  deadCardCount: number
): number {
  const singleCardCost = calculateSingleDeadCardRemovalCost(removalCount);
  return singleCardCost * deadCardCount;
}

export function calculateRewardUpgradeCost(currentLevel: number): number {
  const baseCost = currentMode.shop.rewardUpgrade.baseCost;
  const multiplier = 1 + currentMode.shop.rewardUpgrade.increasePercent / 100;
  return Math.floor(baseCost * Math.pow(multiplier, currentLevel));
}

export function calculateHandCountCost(handCount: number): number {
  return handCount * currentMode.shop.handCount.baseCost;
}

export function calculateParallelHandsBundleCost(baseHandCount: number): number {
  // Cost of adding bundled hands = bundleHandCount * cost of one hand
  const bundleSize = gameConfig.gameRules.bundleHandCount;
  return calculateHandCountCost(baseHandCount + bundleSize) - calculateHandCountCost(baseHandCount);
}

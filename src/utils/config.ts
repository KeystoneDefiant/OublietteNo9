import { gameConfig } from '../config/gameConfig';

export type GameConfig = typeof gameConfig;
export const config = gameConfig;

// Helper functions for cost calculations
export function calculateWildCardCost(wildCardCount: number): number {
  const baseCost = config.shop.wildCard.baseCost;
  const multiplier = 1 + (config.shop.wildCard.increasePercent / 100);
  return Math.floor(baseCost * Math.pow(multiplier, wildCardCount));
}

export function calculateCardRemovalCost(removalCount: number): number {
  const baseCost = config.shop.cardRemoval.baseCost;
  const multiplier = 1 + (config.shop.cardRemoval.increasePercent / 100);
  return Math.floor(baseCost * Math.pow(multiplier, removalCount));
}

export function calculateRewardUpgradeCost(currentLevel: number): number {
  const baseCost = config.shop.rewardUpgrade.baseCost;
  const multiplier = 1 + (config.shop.rewardUpgrade.increasePercent / 100);
  return Math.floor(baseCost * Math.pow(multiplier, currentLevel));
}

export function calculateHandCountCost(handCount: number): number {
  return handCount * config.shop.handCount.baseCost;
}

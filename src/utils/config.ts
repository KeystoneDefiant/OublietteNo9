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

export function calculateDevilsDealChanceCost(purchaseCount: number): number {
  const baseCost = currentMode.shop.devilsDealChance.baseCost;
  const multiplier = 1 + currentMode.shop.devilsDealChance.increasePercent / 100;
  return Math.floor(baseCost * Math.pow(multiplier, purchaseCount));
}

export function calculateDevilsDealCostReductionCost(purchaseCount: number): number {
  const baseCost = currentMode.shop.devilsDealCostReduction.baseCost;
  const multiplier = 1 + currentMode.shop.devilsDealCostReduction.increasePercent / 100;
  return Math.floor(baseCost * Math.pow(multiplier, purchaseCount));
}

export function calculateExtraCardInHandCost(currentCount: number): number {
  const baseCost = currentMode.shop.extraCardInHand.baseCost;
  const multiplier = 1 + currentMode.shop.extraCardInHand.increasePercent / 100;
  return Math.floor(baseCost * Math.pow(multiplier, currentCount));
}

/**
 * Shop option selection utilities
 * Handles weighted random selection of shop options
 */

import { ShopOptionType } from '../types';

/**
 * Performs weighted random selection without replacement
 * @param weights Object mapping options to their weights
 * @param count Number of options to select
 * @returns Array of selected options (guaranteed to return exactly 'count' items)
 */
export function selectRandomShopOptions(
  weights: Record<string, number>,
  count: number
): ShopOptionType[] {
  const availableOptions = Object.entries(weights) as [ShopOptionType, number][];
  const selected: ShopOptionType[] = [];
  let totalWeight = availableOptions.reduce((sum, [, weight]) => sum + weight, 0);

  // First pass: select options without replacement
  while (selected.length < count && availableOptions.length > 0) {
    let random = Math.random() * totalWeight;

    for (let i = 0; i < availableOptions.length; i++) {
      const [option, weight] = availableOptions[i];
      random -= weight;

      if (random <= 0) {
        selected.push(option);
        // Remove selected option from available options
        totalWeight -= weight;
        availableOptions.splice(i, 1);
        break;
      }
    }
  }

  // Second pass: if we don't have enough options, add duplicates from highest weight options
  // This ensures we always have the configured minimum number of shop items
  if (selected.length < count) {
    const allOptions = Object.entries(weights) as [ShopOptionType, number][];
    // Sort by weight descending to prioritize high-weight options
    allOptions.sort((a, b) => b[1] - a[1]);
    
    let optionIndex = 0;
    while (selected.length < count && allOptions.length > 0) {
      const [option] = allOptions[optionIndex % allOptions.length];
      selected.push(option);
      optionIndex++;
    }
  }

  return selected;
}

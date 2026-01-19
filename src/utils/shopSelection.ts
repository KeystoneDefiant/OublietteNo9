/**
 * Shop option selection utilities
 * Handles weighted random selection of shop options
 */

export type ShopOptionType =
  | 'hand-count'
  | 'parallel-hands-bundle'
  | 'dead-card'
  | 'wild-card'
  | 'extra-draw'
  | 'remove-single-dead-card'
  | 'remove-all-dead-cards';

/**
 * Performs weighted random selection without replacement
 * @param weights Object mapping options to their weights
 * @param count Number of options to select
 * @returns Array of selected options
 */
export function selectRandomShopOptions(
  weights: Record<string, number>,
  count: number
): ShopOptionType[] {
  const availableOptions = Object.entries(weights) as [ShopOptionType, number][];
  const selected: ShopOptionType[] = [];
  let totalWeight = availableOptions.reduce((sum, [, weight]) => sum + weight, 0);

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

  return selected;
}

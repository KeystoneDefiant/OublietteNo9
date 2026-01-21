import { useCallback } from 'react';
import { GameState, Card } from '../types';
import { gameConfig, getCurrentGameMode } from '../config/gameConfig';
import {
  calculateWildCardCost,
  calculateSingleDeadCardRemovalCost,
  calculateAllDeadCardsRemovalCost,
  calculateDevilsDealChanceCost,
  calculateDevilsDealCostReductionCost,
} from '../utils/config';

const currentMode = getCurrentGameMode();

/**
 * Hook for shop-related actions
 * Provides functions for purchasing and managing shop items
 * 
 * @param _state - Current game state (unused, for future use)
 * @param setState - React state setter function
 * @returns Object containing shop action functions
 * 
 * @example
 * ```tsx
 * const shopActions = useShopActions(state, setState);
 * shopActions.addDeadCard();
 * shopActions.addWildCard();
 * shopActions.addParallelHandsBundle(10);
 * ```
 */
export function useShopActions(
  _state: GameState,
  setState: React.Dispatch<React.SetStateAction<GameState>>
) {
  /**
   * Add a dead card to the deck for credits
   * Dead cards are drawn but don't count toward hand evaluation
   */
  const addDeadCard = useCallback(() => {
    setState((prev) => {
      // Check if adding a dead card would exceed the limit
      if (prev.deckModifications.deadCards.length >= gameConfig.deadCardLimit) {
        return prev; // Don't add if at limit
      }

      const reward = currentMode.shop.deadCard.creditReward;

      // Create a dead card (random suit/rank, marked as dead)
      const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = [
        'hearts',
        'diamonds',
        'clubs',
        'spades',
      ];
      const ranks: Array<
        '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'
      > = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

      const randomSuit = suits[Math.floor(Math.random() * suits.length)];
      const randomRank = ranks[Math.floor(Math.random() * ranks.length)];

      const deadCard: Card = {
        suit: randomSuit,
        rank: randomRank,
        id: `dead-${Date.now()}-${Math.random()}`,
        isDead: true,
      };

      return {
        ...prev,
        credits: prev.credits + reward,
        deckModifications: {
          ...prev.deckModifications,
          deadCards: [...prev.deckModifications.deadCards, deadCard],
        },
      };
    });
  }, [setState]);

  const removeSingleDeadCard = useCallback(() => {
    setState((prev) => {
      // Check if there are any dead cards
      if (prev.deckModifications.deadCards.length === 0) {
        return prev;
      }

      const cost = calculateSingleDeadCardRemovalCost(prev.deckModifications.deadCardRemovalCount);

      if (prev.credits < cost) {
        return prev;
      }

      // Remove the first dead card
      const cardToRemove = prev.deckModifications.deadCards[0];
      const updatedDeadCards = prev.deckModifications.deadCards.filter(
        (c) => c.id !== cardToRemove.id
      );

      return {
        ...prev,
        credits: prev.credits - cost,
        deckModifications: {
          ...prev.deckModifications,
          deadCards: updatedDeadCards,
          removedCards: [...prev.deckModifications.removedCards, cardToRemove],
          deadCardRemovalCount: prev.deckModifications.deadCardRemovalCount + 1,
        },
      };
    });
  }, [setState]);

  const removeAllDeadCards = useCallback(() => {
    setState((prev) => {
      // Check if there are any dead cards
      if (prev.deckModifications.deadCards.length === 0) {
        return prev;
      }

      const deadCardCount = prev.deckModifications.deadCards.length;
      const cost = calculateAllDeadCardsRemovalCost(
        prev.deckModifications.deadCardRemovalCount,
        deadCardCount
      );

      if (prev.credits < cost) {
        return prev;
      }

      // Remove all dead cards
      const cardsToRemove = prev.deckModifications.deadCards;

      return {
        ...prev,
        credits: prev.credits - cost,
        deckModifications: {
          ...prev.deckModifications,
          deadCards: [],
          removedCards: [...prev.deckModifications.removedCards, ...cardsToRemove],
          deadCardRemovalCount: prev.deckModifications.deadCardRemovalCount + deadCardCount,
        },
      };
    });
  }, [setState]);

  const addWildCard = useCallback(() => {
    setState((prev) => {
      const cost = calculateWildCardCost(prev.wildCardCount);
      if (prev.credits < cost || prev.wildCardCount >= currentMode.shop.wildCard.maxCount) {
        return prev;
      }

      // Create a wild card
      const wildCard: Card = {
        suit: 'hearts', // Suit doesn't matter for wild cards
        rank: 'A', // Rank doesn't matter for wild cards
        id: `wild-${Date.now()}-${Math.random()}`,
        isWild: true,
      };

      return {
        ...prev,
        credits: prev.credits - cost,
        wildCardCount: prev.wildCardCount + 1,
        deckModifications: {
          ...prev.deckModifications,
          wildCards: [...prev.deckModifications.wildCards, wildCard],
        },
      };
    });
  }, [setState]);

  const purchaseExtraDraw = useCallback(() => {
    setState((prev) => {
      const cost = currentMode.shop.extraDraw.cost;
      if (prev.credits < cost || prev.extraDrawPurchased) {
        return prev;
      }
      return {
        ...prev,
        credits: prev.credits - cost,
        extraDrawPurchased: true,
      };
    });
  }, [setState]);

  const addParallelHandsBundle = useCallback(
    (bundleSize: number) => {
      setState((prev) => {
        const basePricePerHand = currentMode.shop.parallelHandsBundles.basePricePerHand;
        const cost = bundleSize * basePricePerHand;
        if (prev.credits < cost) {
          return prev;
        }
        return {
          ...prev,
          handCount: prev.handCount + bundleSize,
          credits: prev.credits - cost,
        };
      });
    },
    [setState]
  );

  const purchaseDevilsDealChance = useCallback(() => {
    setState((prev) => {
      const devilsDealConfig = currentMode.devilsDeal;
      if (!devilsDealConfig) {
        return prev;
      }

      // Check if max purchases reached
      if (prev.devilsDealChancePurchases >= devilsDealConfig.maxChancePurchases) {
        return prev;
      }

      const cost = calculateDevilsDealChanceCost(prev.devilsDealChancePurchases);
      if (prev.credits < cost) {
        return prev;
      }

      return {
        ...prev,
        credits: prev.credits - cost,
        devilsDealChancePurchases: prev.devilsDealChancePurchases + 1,
      };
    });
  }, [setState]);

  const purchaseDevilsDealCostReduction = useCallback(() => {
    setState((prev) => {
      const devilsDealConfig = currentMode.devilsDeal;
      if (!devilsDealConfig) {
        return prev;
      }

      // Check if max purchases reached
      if (prev.devilsDealCostReductionPurchases >= devilsDealConfig.maxCostReductionPurchases) {
        return prev;
      }

      const cost = calculateDevilsDealCostReductionCost(prev.devilsDealCostReductionPurchases);
      if (prev.credits < cost) {
        return prev;
      }

      return {
        ...prev,
        credits: prev.credits - cost,
        devilsDealCostReductionPurchases: prev.devilsDealCostReductionPurchases + 1,
      };
    });
  }, [setState]);

  return {
    addDeadCard,
    removeSingleDeadCard,
    removeAllDeadCards,
    addWildCard,
    purchaseExtraDraw,
    addParallelHandsBundle,
    purchaseDevilsDealChance,
    purchaseDevilsDealCostReduction,
  };
}

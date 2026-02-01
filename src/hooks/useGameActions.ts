import { useCallback } from 'react';
import { GameState, Card } from '../types';
import { createFullDeck, shuffleDeck, removeCardsFromDeck } from '../utils/deck';
import { generateParallelHands } from '../utils/parallelHands';
import { findBestDevilsDealCards } from '../utils/devilsDeal';
import { getCurrentGameMode } from '../config/gameConfig';
import { PokerEvaluator } from '../utils/pokerEvaluator';

/**
 * Hook for game play actions (deal, hold, draw)
 * Provides functions for core gameplay mechanics
 *
 * @param _state - Current game state (unused, for future use)
 * @param setState - React state setter function
 * @returns Object containing game action functions
 *
 * @example
 * ```tsx
 * const gameActions = useGameActions(state, setState);
 * gameActions.dealHand();
 * gameActions.toggleHold(0);
 * gameActions.drawParallelHands();
 * ```
 */
export function useGameActions(
  _state: GameState,
  setState: React.Dispatch<React.SetStateAction<GameState>>
) {
  /**
   * Deal a new hand to the player
   * Deducts bet amount and sets up initial game state
   */
  const dealHand = useCallback(() => {
    setState((prev) => {
      const totalBet = prev.betAmount * prev.selectedHandCount;

      // Check if player can afford the bet
      if (prev.credits < totalBet) {
        return prev;
      }

      const deck = shuffleDeck(
        createFullDeck(
          prev.deckModifications.deadCards,
          prev.deckModifications.removedCards,
          prev.deckModifications.wildCards
        )
      );
      const newHand: Card[] = deck.slice(0, 5);

      // Check for Devil's Deal
      const currentMode = getCurrentGameMode();
      const devilsDealConfig = currentMode.devilsDeal;
      let devilsDealCard: Card | null = null;
      let devilsDealCost = 0;

      if (devilsDealConfig) {
        // Calculate effective chance
        const effectiveChance =
          devilsDealConfig.baseChance +
          prev.devilsDealChancePurchases * devilsDealConfig.chanceIncreasePerPurchase;
        const roll = Math.random() * 100;

        if (roll < effectiveChance) {
          // Get available deck (full deck minus playerHand)
          const fullDeck = createFullDeck(
            prev.deckModifications.deadCards,
            prev.deckModifications.removedCards,
            prev.deckModifications.wildCards
          );
          const availableDeck = removeCardsFromDeck(fullDeck, newHand);

          // Find best cards
          const bestCards = findBestDevilsDealCards(
            newHand,
            availableDeck,
            prev.rewardTable,
            prev.betAmount
          );

          // Randomly select one from top 3
          if (bestCards.length > 0) {
            const selectedCard = bestCards[Math.floor(Math.random() * bestCards.length)];

            // Calculate best possible hand's payout (per hand)
            // Uses current betAmount to ensure cost scales with bet size
            const currentBetAmount = prev.betAmount;
            let bestMultiplier = 0;
            for (let position = 0; position < 5; position++) {
              const testHand = [...newHand];
              testHand[position] = selectedCard;
              const result = PokerEvaluator.evaluate(testHand);
              const withRewards = PokerEvaluator.applyRewards(result, prev.rewardTable);
              // Track the best multiplier found
              if (withRewards.multiplier > bestMultiplier) {
                bestMultiplier = withRewards.multiplier;
              }
            }

            // Calculate best possible hand's payout per hand
            // Formula: multiplier * betAmount
            const bestPossibleHandPayoutPerHand = bestMultiplier * currentBetAmount;

            // Calculate cost: (best possible hand's payout * total number of hands) * percentage
            // Formula: (multiplier * betAmount * selectedHandCount) * (costPercent / 100)
            const costPercent =
              devilsDealConfig.baseCostPercent -
              prev.devilsDealCostReductionPurchases * devilsDealConfig.costReductionPerPurchase;
            // Ensure cost is always positive (minimum 1%)
            const finalCostPercent = Math.max(1, costPercent);
            // Cost = (best possible hand's payout per hand * number of hands) * percentage
            // Round to avoid decimals
            devilsDealCost = Math.round(
              (bestPossibleHandPayoutPerHand * prev.selectedHandCount * finalCostPercent) / 100
            );
            devilsDealCard = selectedCard;
          }
        }
      }

      return {
        ...prev,
        playerHand: newHand,
        heldIndices: [],
        parallelHands: [],
        additionalHandsBought: 0,
        credits: prev.credits - totalBet,
        screen: 'game',
        gamePhase: 'playing',
        hasExtraDraw: prev.extraDrawPurchased,
        firstDrawComplete: false,
        secondDrawAvailable: false,
        selectedHandCount: prev.selectedHandCount || prev.handCount,
        devilsDealCard,
        devilsDealCost,
        devilsDealHeld: false,
      };
    });
  }, [setState]);

  /**
   * Toggle hold status of a card at the specified index
   * Enforces 5-card limit (including Devil's Deal card)
   * @param index - Card index (0-4) to toggle hold status
   */
  const toggleHold = useCallback(
    (index: number) => {
      setState((prev) => {
        const isCurrentlyHeld = prev.heldIndices.includes(index);

        // If trying to hold a new card, check 5-card limit
        if (!isCurrentlyHeld) {
          const totalHeld = prev.heldIndices.length + (prev.devilsDealHeld ? 1 : 0);
          if (totalHeld >= 5) {
            return prev; // Can't hold more than 5 cards total
          }
        }

        const heldIndices = isCurrentlyHeld
          ? prev.heldIndices.filter((i) => i !== index)
          : [...prev.heldIndices, index];

        return {
          ...prev,
          heldIndices,
        };
      });
    },
    [setState]
  );

  /**
   * Draw parallel hands from held cards
   * Handles extra draw mechanic if purchased
   * Generates multiple hands and transitions to animation phase
   */
  const drawParallelHands = useCallback(() => {
    setState((prev) => {
      if (prev.playerHand.length !== 5) {
        return prev;
      }

      // If this is the first draw and extra draw is available, mark first draw complete and redraw non-held cards
      if (!prev.firstDrawComplete && prev.hasExtraDraw) {
        // Create a deck and shuffle it
        const deck = shuffleDeck(
          createFullDeck(
            prev.deckModifications.deadCards,
            prev.deckModifications.removedCards,
            prev.deckModifications.wildCards
          )
        );

        // Replace non-held cards with new cards from the deck
        const updatedHand = [...prev.playerHand];
        let deckIndex = 0;
        for (let i = 0; i < 5; i++) {
          if (!prev.heldIndices.includes(i)) {
            updatedHand[i] = deck[deckIndex++];
          }
        }

        // Handle Devil's Deal card if held (for first draw)
        let finalHand = updatedHand;
        let finalHeldIndices = [...prev.heldIndices];
        if (prev.devilsDealHeld && prev.devilsDealCard) {
          const modifiedHand = [...updatedHand];
          // Find first non-held position and replace with Devil's Deal card
          for (let i = 0; i < 5; i++) {
            if (!prev.heldIndices.includes(i)) {
              modifiedHand[i] = prev.devilsDealCard;
              // Mark this position as held so it doesn't get replaced in parallel hands
              finalHeldIndices = [...prev.heldIndices, i];
              break;
            }
          }
          finalHand = modifiedHand;
        }

        // Generate parallel hands from the updated player hand
        const parallelHands = generateParallelHands(
          finalHand,
          finalHeldIndices,
          prev.selectedHandCount,
          prev.deckModifications.deadCards,
          prev.deckModifications.removedCards,
          prev.deckModifications.wildCards
        );

        return {
          ...prev,
          playerHand: finalHand,
          heldIndices: finalHeldIndices,
          parallelHands,
          firstDrawComplete: true,
          secondDrawAvailable: true,
        };
      }

      // Second draw or no extra draw - generate final hands and move to parallel hands animation
      // For second draw, also replace non-held cards
      let handForAnimation = prev.playerHand;
      let currentHeldIndices = [...prev.heldIndices];
      if (prev.firstDrawComplete && prev.hasExtraDraw) {
        const deck = shuffleDeck(
          createFullDeck(
            prev.deckModifications.deadCards,
            prev.deckModifications.removedCards,
            prev.deckModifications.wildCards
          )
        );

        const updatedHand = [...prev.playerHand];
        let deckIndex = 0;
        for (let i = 0; i < 5; i++) {
          if (!prev.heldIndices.includes(i)) {
            updatedHand[i] = deck[deckIndex++];
          }
        }
        handForAnimation = updatedHand;
        currentHeldIndices = [...prev.heldIndices];
      }

      // Handle Devil's Deal card if held
      let finalHand = handForAnimation;
      let finalHeldIndices = [...currentHeldIndices];
      let creditsAfterDeal = prev.credits;
      if (prev.devilsDealHeld && prev.devilsDealCard) {
        // Replace the first non-held card position with the deal card
        const modifiedHand = [...handForAnimation];
        for (let i = 0; i < 5; i++) {
          if (!currentHeldIndices.includes(i)) {
            modifiedHand[i] = prev.devilsDealCard;
            // Mark this position as held so it doesn't get replaced in parallel hands
            finalHeldIndices = [...currentHeldIndices, i];
            break;
          }
        }
        finalHand = modifiedHand;
        // Deduct cost
        creditsAfterDeal = prev.credits - prev.devilsDealCost;
      }

      const parallelHands = generateParallelHands(
        finalHand,
        finalHeldIndices,
        prev.selectedHandCount,
        prev.deckModifications.deadCards,
        prev.deckModifications.removedCards,
        prev.deckModifications.wildCards
      );

      return {
        ...prev,
        playerHand: finalHand,
        heldIndices: finalHeldIndices,
        parallelHands,
        credits: creditsAfterDeal,
        gamePhase: 'parallelHandsAnimation',
        firstDrawComplete: false,
        secondDrawAvailable: false,
      };
    });
  }, [setState]);

  return {
    dealHand,
    toggleHold,
    drawParallelHands,
  };
}

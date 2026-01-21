import { useCallback } from 'react';
import { GameState, Card } from '../types';
import { createFullDeck, shuffleDeck } from '../utils/deck';
import { generateParallelHands } from '../utils/parallelHands';

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
      };
    });
  }, [setState]);

  /**
   * Toggle hold status of a card at the specified index
   * @param index - Card index (0-4) to toggle hold status
   */
  const toggleHold = useCallback(
    (index: number) => {
      setState((prev) => {
        const heldIndices = prev.heldIndices.includes(index)
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

        // Generate parallel hands from the updated player hand
        const parallelHands = generateParallelHands(
          updatedHand,
          prev.heldIndices,
          prev.selectedHandCount,
          prev.deckModifications.deadCards,
          prev.deckModifications.removedCards,
          prev.deckModifications.wildCards
        );

        return {
          ...prev,
          playerHand: updatedHand,
          parallelHands,
          firstDrawComplete: true,
          secondDrawAvailable: true,
        };
      }

      // Second draw or no extra draw - generate final hands and move to parallel hands animation
      // For second draw, also replace non-held cards
      let handForAnimation = prev.playerHand;
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
      }

      const parallelHands = generateParallelHands(
        handForAnimation,
        prev.heldIndices,
        prev.selectedHandCount,
        prev.deckModifications.deadCards,
        prev.deckModifications.removedCards,
        prev.deckModifications.wildCards
      );

      return {
        ...prev,
        playerHand: handForAnimation,
        parallelHands,
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

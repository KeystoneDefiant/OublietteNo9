import { useState, useCallback } from 'react';
import { GameState, HandRank, Card } from '../types';
import { createFullDeck, shuffleDeck } from '../utils/deck';
import { selectRandomShopOptions } from '../utils/shopSelection';
import { getCurrentGameMode } from '../config/gameConfig';
import { useGameActions } from './useGameActions';
import { useShopActions } from './useShopActions';

const currentMode = getCurrentGameMode();

const INITIAL_STATE: GameState = {
  screen: 'menu',
  gamePhase: 'preDraw',
  playerHand: [],
  heldIndices: [],
  parallelHands: [],
  handCount: currentMode.startingHandCount,
  rewardTable: currentMode.rewards,
  credits: currentMode.startingCredits,
  currentRun: 0,
  additionalHandsBought: 0,
  betAmount: currentMode.startingBet,
  selectedHandCount: currentMode.startingHandCount,
  minimumBet: currentMode.startingBet,
  round: 1,
  totalEarnings: 0,
  deckModifications: {
    deadCards: [],
    wildCards: [],
    removedCards: [],
    deadCardRemovalCount: 0,
  },
  extraDrawPurchased: false,
  hasExtraDraw: false,
  firstDrawComplete: false,
  secondDrawAvailable: false,
  wildCardCount: 0,
  gameOver: false,
  showShopNextRound: false,
  selectedShopOptions: [],
};

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  // Use specialized hooks for different action types
  const gameActions = useGameActions(state, setState);
  const shopActions = useShopActions(state, setState);

  const openShop = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: 'shop',
    }));
  }, []);

  const closeShop = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: 'game',
    }));
  }, []);

  const upgradeRewardTable = useCallback((rank: HandRank, cost: number) => {
    setState((prev) => {
      if (prev.credits < cost) {
        return prev;
      }
      return {
        ...prev,
        rewardTable: {
          ...prev.rewardTable,
          [rank]: (prev.rewardTable[rank] || 0) + 1,
        },
        credits: prev.credits - cost,
      };
    });
  }, []);

  const returnToMenu = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const returnToPreDraw = useCallback((payout: number = 0) => {
    setState((prev) => {
      // Add payout to credits and total earnings
      const newCredits = prev.credits + payout;
      const newTotalEarnings = prev.totalEarnings + payout;

      // Increment round and apply bet increase
      const newRound = prev.round + 1;
      const minBetMultiplier = 1 + currentMode.minimumBetIncreasePercent / 100;
      const newMinimumBet = Math.floor(prev.minimumBet * minBetMultiplier);

      // Auto-adjust bet and hand count if player can't afford current bet
      let adjustedBet = prev.betAmount;
      let adjustedHandCount = prev.selectedHandCount;
      let gameOver = false;

      // First, try to reduce bet to an affordable level
      const maxAffordableBet = Math.floor(newCredits / adjustedHandCount);
      if (maxAffordableBet < adjustedBet) {
        adjustedBet = Math.max(newMinimumBet, maxAffordableBet);
      }

      // If still can't afford with minimum bet, reduce hand count
      if (newCredits < adjustedBet * adjustedHandCount) {
        adjustedHandCount = Math.max(1, Math.floor(newCredits / adjustedBet));
      }

      // If still can't afford, trigger game over
      if (newCredits < adjustedBet * adjustedHandCount) {
        gameOver = true;
      }

      // Check if shop should appear next round and generate options if so
      const showShopNextRound = newRound % currentMode.shopFrequency === 0;
      const selectedShopOptions = showShopNextRound
        ? selectRandomShopOptions(currentMode.shopWeights, currentMode.shopOptionCount)
        : [];

      return {
        ...prev,
        gamePhase: 'preDraw',
        playerHand: [],
        heldIndices: [],
        parallelHands: [],
        firstDrawComplete: false,
        secondDrawAvailable: false,
        round: newRound,
        minimumBet: newMinimumBet,
        credits: newCredits,
        totalEarnings: newTotalEarnings,
        betAmount: adjustedBet,
        selectedHandCount: adjustedHandCount,
        gameOver,
        showShopNextRound,
        selectedShopOptions,
      };
    });
  }, []);

  const startNewRun = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: 'game',
      gamePhase: 'preDraw',
      playerHand: [],
      heldIndices: [],
      parallelHands: [],
      additionalHandsBought: 0,
      currentRun: prev.currentRun + 1,
      betAmount: currentMode.startingBet,
      selectedHandCount: prev.handCount,
      minimumBet: currentMode.startingBet,
      round: 1,
      totalEarnings: 0,
      gameOver: false,
      hasExtraDraw: false,
      showShopNextRound: false,
      selectedShopOptions: [],
    }));
  }, []);

  /**
   * End the current run and show game over summary screen
   * Preserves stats (round, totalEarnings, credits) for display
   */
  const endRun = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: 'gameOver',
      gamePhase: 'preDraw',
      gameOver: true,
      // Preserve stats for game over screen
      // round: prev.round (kept as is)
      // totalEarnings: prev.totalEarnings (kept as is)
      // credits: prev.credits (kept as is)
      playerHand: [],
      heldIndices: [],
      parallelHands: [],
      additionalHandsBought: 0,
      hasExtraDraw: false,
      showShopNextRound: false,
      selectedShopOptions: [],
    }));
  }, []);

  const buyAnotherHand = useCallback(() => {
    setState((prev) => {
      if (prev.playerHand.length !== 5 || prev.parallelHands.length === 0) {
        return prev;
      }

      // Calculate cost: parallelHands.length * (additionalHandsBought % 10)
      const cost = prev.parallelHands.length * (prev.additionalHandsBought % 10);

      if (prev.credits < cost) {
        return prev;
      }

      // Deal a completely new hand from a fresh deck (including deck modifications)
      const deck = shuffleDeck(
        createFullDeck(
          prev.deckModifications.deadCards,
          prev.deckModifications.removedCards,
          prev.deckModifications.wildCards
        )
      );
      const newHand: Card[] = deck.slice(0, 5);

      // Reset the entire hand state while maintaining the rest of the game state
      const totalBet = prev.betAmount * prev.selectedHandCount;
      if (prev.credits - cost < totalBet) {
        return prev;
      }

      return {
        ...prev,
        playerHand: newHand,
        heldIndices: [],
        parallelHands: [],
        additionalHandsBought: 0,
        credits: prev.credits - cost,
        hasExtraDraw: prev.extraDrawPurchased,
      };
    });
  }, []);

  const setBetAmount = useCallback((amount: number) => {
    setState((prev) => {
      // Validate input is a valid number
      if (isNaN(amount) || !isFinite(amount)) {
        return prev;
      }
      
      // Ensure amount is not negative
      if (amount < 0) {
        return prev;
      }
      
      // Ensure amount meets minimum bet requirement
      if (amount < prev.minimumBet) {
        return prev;
      }
      
      // Floor the amount to ensure it's an integer
      const validAmount = Math.floor(amount);
      
      return {
        ...prev,
        betAmount: validAmount,
      };
    });
  }, []);

  const setSelectedHandCount = useCallback((count: number) => {
    setState((prev) => {
      // Validate input is a valid number
      if (isNaN(count) || !isFinite(count)) {
        return prev;
      }
      
      // Ensure count is positive
      if (count < 1) {
        return prev;
      }
      
      // Ensure count doesn't exceed available hands
      if (count > prev.handCount) {
        return prev;
      }
      
      // Floor the count to ensure it's an integer
      const validCount = Math.floor(count);
      
      // Check if player can afford bet with this hand count
      const totalBet = prev.betAmount * validCount;
      if (prev.credits < totalBet) {
        return prev;
      }
      
      return {
        ...prev,
        selectedHandCount: validCount,
      };
    });
  }, []);


  const moveToNextScreen = useCallback(() => {
    setState((prev) => {
      if (prev.gamePhase === 'parallelHandsAnimation') {
        return {
          ...prev,
          gamePhase: 'results',
        };
      }
      return prev;
    });
  }, []);

  const proceedFromResults = useCallback(() => {
    setState((prev) => {
      // Always hide the shop and go to PreDraw
      return {
        ...prev,
        screen: 'game',
        gamePhase: 'preDraw',
        showShopNextRound: false,
        selectedShopOptions: [],
      };
    });
  }, []);

  const cheatAddCredits = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      credits: prev.credits + amount,
      gameOver: false,
    }));
  }, []);

  const cheatAddHands = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      handCount: prev.handCount + amount,
    }));
  }, []);

  return {
    state,
    // Game actions
    ...gameActions,
    // Shop actions
    ...shopActions,
    // Navigation and other actions
    openShop,
    closeShop,
    upgradeRewardTable,
    returnToMenu,
    returnToPreDraw,
    startNewRun,
    endRun,
    buyAnotherHand,
    setBetAmount,
    setSelectedHandCount,
    moveToNextScreen,
    proceedFromResults,
    cheatAddCredits,
    cheatAddHands,
  };
}

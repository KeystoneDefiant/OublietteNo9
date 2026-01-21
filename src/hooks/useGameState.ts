import { useState, useCallback } from 'react';
import { GameState, HandRank, Card } from '../types';
import { createFullDeck, shuffleDeck } from '../utils/deck';
import { selectRandomShopOptions } from '../utils/shopSelection';
import { getCurrentGameMode } from '../config/gameConfig';
import { useGameActions } from './useGameActions';
import { useShopActions } from './useShopActions';
import { checkFailureConditions } from '../utils/failureConditions';
import { PokerEvaluator } from '../utils/pokerEvaluator';

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
  baseMinimumBet: currentMode.startingBet,
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
  isEndlessMode: false,
  currentFailureState: null,
  winningHandsLastRound: 0,
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
      // Count winning hands from last round (hands with payout > 0)
      const winningHandsCount = prev.parallelHands.reduce((count, hand) => {
        const result = PokerEvaluator.evaluate(hand.cards);
        const withRewards = PokerEvaluator.applyRewards(result, prev.rewardTable);
        const handPayout = prev.betAmount * withRewards.multiplier;
        return handPayout > 0 ? count + 1 : count;
      }, 0);

      // Add payout to credits and total earnings
      const newCredits = prev.credits + payout;
      const newTotalEarnings = prev.totalEarnings + payout;

      // Increment round
      const newRound = prev.round + 1;

      // Check if we should enter endless mode
      const endlessConfig = currentMode.endlessMode;
      const shouldEnterEndlessMode =
        endlessConfig && newRound > endlessConfig.startRound && !prev.isEndlessMode;

      // Update minimum bet - only increase every X rounds (based on minimumBetIncreaseInterval)
      let newMinimumBet = prev.minimumBet;
      let newBaseMinimumBet = prev.baseMinimumBet;

      if (shouldEnterEndlessMode) {
        // When entering endless mode, set base minimum bet to current minimum bet
        newBaseMinimumBet = prev.minimumBet;
      }

      // Only increase minimum bet if it's time (based on interval)
      if (newRound % currentMode.minimumBetIncreaseInterval === 0) {
        const minBetMultiplier = 1 + currentMode.minimumBetIncreasePercent / 100;
        newMinimumBet = Math.floor(prev.minimumBet * minBetMultiplier);
      }

      // Ensure bet is at least minimum bet
      let adjustedBet = Math.max(newMinimumBet, prev.betAmount);
      let adjustedHandCount = prev.selectedHandCount;
      let gameOver = false;
      let currentFailureState = prev.currentFailureState;

      // Auto-adjust bet and hand count if player can't afford current bet
      // Step 1: Try reducing bet size until affordable (but not below minimum)
      const maxAffordableBet = Math.floor(newCredits / adjustedHandCount);
      if (maxAffordableBet >= newMinimumBet) {
        // Can afford by reducing bet (bet will be >= minimum)
        adjustedBet = maxAffordableBet;
      } else {
        // Step 2: Bet reached minimum bet, try reducing hand count
        adjustedBet = newMinimumBet;
        adjustedHandCount = Math.max(1, Math.floor(newCredits / adjustedBet));
        adjustedHandCount = Math.min(prev.handCount, adjustedHandCount);
      }

      // Step 3: If still can't afford, trigger game over
      if (newCredits < adjustedBet * adjustedHandCount) {
        gameOver = true;
      }

      // Check if we're in endless mode (or should enter it)
      const isEndlessMode = shouldEnterEndlessMode || prev.isEndlessMode;

      // If in endless mode, check failure conditions
      if (isEndlessMode && !gameOver) {
        // Create temporary state for failure condition checking
        const tempState: GameState = {
          ...prev,
          round: newRound,
          credits: newCredits,
          totalEarnings: newTotalEarnings,
          minimumBet: newMinimumBet,
          baseMinimumBet: newBaseMinimumBet,
          betAmount: adjustedBet,
          winningHandsLastRound: winningHandsCount,
          isEndlessMode: true,
        };

        currentFailureState = checkFailureConditions(tempState);

        // If a failure condition is active, trigger game over
        if (currentFailureState !== null) {
          gameOver = true;
        }
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
        baseMinimumBet: newBaseMinimumBet,
        credits: newCredits,
        totalEarnings: newTotalEarnings,
        betAmount: adjustedBet,
        selectedHandCount: adjustedHandCount,
        gameOver,
        showShopNextRound,
        selectedShopOptions,
        isEndlessMode,
        currentFailureState,
        winningHandsLastRound: winningHandsCount,
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
      baseMinimumBet: currentMode.startingBet,
      round: 1,
      totalEarnings: 0,
      gameOver: false,
      hasExtraDraw: false,
      showShopNextRound: false,
      selectedShopOptions: [],
      isEndlessMode: false,
      currentFailureState: null,
      winningHandsLastRound: 0,
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

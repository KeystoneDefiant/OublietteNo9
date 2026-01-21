import { useState, useCallback } from 'react';
import { GameState, Card, HandRank } from '../types';
import { createFullDeck, shuffleDeck } from '../utils/deck';
import { generateParallelHands } from '../utils/parallelHands';
import { selectRandomShopOptions } from '../utils/shopSelection';
import {
  calculateWildCardCost,
  calculateSingleDeadCardRemovalCost,
  calculateAllDeadCardsRemovalCost,
} from '../utils/config';
import { gameConfig, getCurrentGameMode } from '../config/gameConfig';

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
  }, []);

  const toggleHold = useCallback((index: number) => {
    setState((prev) => {
      const heldIndices = prev.heldIndices.includes(index)
        ? prev.heldIndices.filter((i) => i !== index)
        : [...prev.heldIndices, index];

      return {
        ...prev,
        heldIndices,
      };
    });
  }, []);

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
  }, []);

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

  const endRun = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: 'menu',
      gamePhase: 'preDraw',
      gameOver: false,
      currentRun: prev.currentRun,
      betAmount: currentMode.startingBet,
      selectedHandCount: prev.handCount,
      minimumBet: currentMode.startingBet,
      round: 1,
      totalEarnings: 0,
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
      if (amount < prev.minimumBet) {
        return prev;
      }
      return {
        ...prev,
        betAmount: amount,
      };
    });
  }, []);

  const setSelectedHandCount = useCallback((count: number) => {
    setState((prev) => {
      if (count < 1 || count > prev.handCount) {
        return prev;
      }
      // Check if player can afford bet with this hand count
      const totalBet = prev.betAmount * count;
      if (prev.credits < totalBet) {
        return prev;
      }
      return {
        ...prev,
        selectedHandCount: count,
      };
    });
  }, []);

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
  }, []);

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
  }, []);

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
  }, []);

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
  }, []);

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
  }, []);

  const addParallelHandsBundle = useCallback((bundleSize: number) => {
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
    dealHand,
    toggleHold,
    drawParallelHands,
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
    addDeadCard,
    removeSingleDeadCard,
    removeAllDeadCards,
    addWildCard,
    purchaseExtraDraw,
    addParallelHandsBundle,
    moveToNextScreen,
    proceedFromResults,
    cheatAddCredits,
    cheatAddHands,
  };
}

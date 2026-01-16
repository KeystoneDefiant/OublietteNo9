import { useState, useCallback } from 'react';
import { GameState, Card, HandRank } from '../types';
import { createFullDeck, shuffleDeck } from '../utils/deck';
import { generateParallelHands } from '../utils/parallelHands';
import { PokerEvaluator } from '../utils/pokerEvaluator';
import { config, calculateWildCardCost, calculateCardRemovalCost } from '../utils/config';

const DEFAULT_REWARD_TABLE = config.rewards.defaultTable;

const INITIAL_STATE: GameState = {
  screen: 'menu',
  playerHand: [],
  heldIndices: [],
  parallelHands: [],
  handCount: 1,
  rewardTable: DEFAULT_REWARD_TABLE,
  credits: config.gameplay.startingCredits,
  currentRun: 0,
  additionalHandsBought: 0,
  betAmount: config.gameplay.startingBet,
  selectedHandCount: config.gameplay.startingHandCount,
  minimumBet: config.gameplay.startingMinimumBet,
  round: 0,
  totalEarnings: 0,
  deckModifications: {
    deadCards: [],
    wildCards: [],
    removedCards: [],
    cardRemovalCount: 0,
  },
  extraDrawPurchased: false,
  hasExtraDraw: false,
  firstDrawComplete: false,
  secondDrawAvailable: false,
  random2xChance: config.gameplay.starting2xChance,
  wildCardCount: 0,
  gameOver: false,
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

      const deck = shuffleDeck(createFullDeck(
        prev.deckModifications.deadCards,
        prev.deckModifications.removedCards,
        prev.deckModifications.wildCards
      ));
      const newHand: Card[] = deck.slice(0, 5);

      return {
        ...prev,
        playerHand: newHand,
        heldIndices: [],
        parallelHands: [],
        additionalHandsBought: 0,
        credits: prev.credits - totalBet,
        screen: 'game',
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

      // If this is the first draw and extra draw is available, just mark first draw complete
      if (!prev.firstDrawComplete && prev.hasExtraDraw) {
        const parallelHands = generateParallelHands(
          prev.playerHand,
          prev.heldIndices,
          prev.selectedHandCount,
          prev.deckModifications.deadCards,
          prev.deckModifications.removedCards,
          prev.deckModifications.wildCards
        );

        return {
          ...prev,
          parallelHands,
          firstDrawComplete: true,
          secondDrawAvailable: true,
        };
      }

      // Second draw or no extra draw - final evaluation
      const parallelHands = generateParallelHands(
        prev.playerHand,
        prev.heldIndices,
        prev.selectedHandCount,
        prev.deckModifications.deadCards,
        prev.deckModifications.removedCards,
        prev.deckModifications.wildCards
      );

      // Evaluate all hands and calculate total winnings
      let totalWinnings = 0;
      parallelHands.forEach((hand) => {
        const result = PokerEvaluator.evaluate(hand.cards);
        const withRewards = PokerEvaluator.applyRewards(result, prev.rewardTable);
        // Payout = betAmount × multiplier
        const handPayout = prev.betAmount * withRewards.multiplier;
        totalWinnings += handPayout;
      });

      // Check for 2x bonus (per-hand chance)
      let finalWinnings = totalWinnings;
      if (Math.random() * 100 < prev.random2xChance) {
        finalWinnings = totalWinnings * 2;
      }

      const newCredits = prev.credits + finalWinnings;
      const newRound = prev.round + 1;
      const newTotalEarnings = prev.totalEarnings + finalWinnings;
      const minBetMultiplier = 1 + (config.percentages.minimumBetIncrease / 100);
      const newMinimumBet = Math.floor(prev.minimumBet * minBetMultiplier);

      // Check for game over
      const gameOver = newCredits < newMinimumBet * prev.selectedHandCount;

      return {
        ...prev,
        parallelHands,
        credits: newCredits,
        round: newRound,
        totalEarnings: newTotalEarnings,
        minimumBet: newMinimumBet,
        gameOver,
        screen: gameOver ? 'gameOver' : prev.screen,
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

  const upgradeHandCount = useCallback((cost: number) => {
    setState((prev) => {
      if (prev.credits < cost) {
        return prev;
      }
      return {
        ...prev,
        handCount: prev.handCount + 1,
        credits: prev.credits - cost,
      };
    });
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

  const startNewRun = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: 'game',
      playerHand: [],
      heldIndices: [],
      parallelHands: [],
      additionalHandsBought: 0,
      currentRun: prev.currentRun + 1,
      betAmount: config.gameplay.startingBet,
      selectedHandCount: prev.handCount,
      minimumBet: config.gameplay.startingMinimumBet,
      round: 0,
      totalEarnings: 0,
      gameOver: false,
      hasExtraDraw: false,
    }));
    dealHand();
  }, [dealHand]);

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
      const deck = shuffleDeck(createFullDeck(
        prev.deckModifications.deadCards,
        prev.deckModifications.removedCards,
        prev.deckModifications.wildCards
      ));
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
      const reward = config.shop.deadCard.baseCost;
      
      // Create a dead card (random suit/rank, marked as dead)
      const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = ['hearts', 'diamonds', 'clubs', 'spades'];
      const ranks: Array<'2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'> = 
        ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      
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

  const removeCard = useCallback((cardToRemove: Card) => {
    setState((prev) => {
      const cost = calculateCardRemovalCost(prev.deckModifications.cardRemovalCount);
      
      if (prev.credits < cost) {
        return prev;
      }

      // Check if card is already removed
      if (prev.deckModifications.removedCards.some(c => c.id === cardToRemove.id)) {
        return prev;
      }

      // Remove the card from deadCards or wildCards if it's one of those
      const updatedDeadCards = prev.deckModifications.deadCards.filter(c => c.id !== cardToRemove.id);
      const updatedWildCards = prev.deckModifications.wildCards.filter(c => c.id !== cardToRemove.id);

      return {
        ...prev,
        credits: prev.credits - cost,
        deckModifications: {
          ...prev.deckModifications,
          deadCards: updatedDeadCards,
          wildCards: updatedWildCards,
          removedCards: [...prev.deckModifications.removedCards, cardToRemove],
          cardRemovalCount: prev.deckModifications.cardRemovalCount + 1,
        },
      };
    });
  }, []);

  const addWildCard = useCallback(() => {
    setState((prev) => {
      const cost = calculateWildCardCost(prev.wildCardCount);
      if (prev.credits < cost || prev.wildCardCount >= config.shop.wildCard.maxCount) {
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

  const increase2xChance = useCallback(() => {
    setState((prev) => {
      const cost = config.shop['2xChance'].baseCost;
      const maxChance = config.shop['2xChance'].maxChance;
      const increaseAmount = config.shop['2xChance'].increaseAmount;
      if (prev.credits < cost || prev.random2xChance >= maxChance) {
        return prev;
      }
      return {
        ...prev,
        credits: prev.credits - cost,
        random2xChance: Math.min(maxChance, prev.random2xChance + increaseAmount),
      };
    });
  }, []);

  const purchaseExtraDraw = useCallback(() => {
    setState((prev) => {
      const cost = config.shop.extraDraw.cost;
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

  return {
    state,
    dealHand,
    toggleHold,
    drawParallelHands,
    openShop,
    closeShop,
    upgradeHandCount,
    upgradeRewardTable,
    returnToMenu,
    startNewRun,
    buyAnotherHand,
    setBetAmount,
    setSelectedHandCount,
    addDeadCard,
    removeCard,
    addWildCard,
    increase2xChance,
    purchaseExtraDraw,
  };
}

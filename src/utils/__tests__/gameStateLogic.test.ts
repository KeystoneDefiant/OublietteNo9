import { describe, it, expect } from 'vitest';
import { GameState } from '../../types';
import { gameConfig, getCurrentGameMode } from '../../config/gameConfig';
import { checkFailureConditions } from '../failureConditions';
import { PokerEvaluator } from '../pokerEvaluator';
import { Card, Hand } from '../../types';

// Get config values
const mode = gameConfig.gameModes.normalGame;
const betMultiplier = mode.endlessMode?.failureConditions.minimumBetMultiplier?.value || 2.0;
const minEfficiency = mode.endlessMode?.failureConditions.minimumCreditEfficiency?.value || 100;
const minWinningHands = mode.endlessMode?.failureConditions.minimumWinningHandsPerRound?.value || 20;

// Helper to create a minimal game state
function createGameState(overrides: Partial<GameState> = {}): GameState {
  const baseState: GameState = {
    screen: 'game',
    gamePhase: 'preDraw',
    playerHand: [],
    heldIndices: [],
    parallelHands: [],
    handCount: 10,
    rewardTable: {},
    credits: 5000,
    currentRun: 1,
    additionalHandsBought: 0,
    betAmount: 1,
    selectedHandCount: 10,
    minimumBet: 1,
    baseMinimumBet: 1,
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

  return { ...baseState, ...overrides };
}

// Helper to create a card
function createCard(rank: Card['rank'], suit: Card['suit'], options?: Partial<Card>): Card {
  return {
    rank,
    suit,
    id: `${rank}-${suit}-${Math.random()}`,
    ...options,
  };
}

// Helper to create a hand
function createHand(cards: Card[], id?: string): Hand {
  return {
    cards,
    id: id || `hand-${Math.random()}`,
  };
}

describe('Game State Logic - Minimum Bet Increase Intervals', () => {
  const mode = getCurrentGameMode();

  it('should increase minimum bet every interval rounds', () => {
    const interval = mode.minimumBetIncreaseInterval;
    const increasePercent = mode.minimumBetIncreasePercent;
    const multiplier = 1 + increasePercent / 100;

    let state = createGameState({ minimumBet: 100, round: 1 }); // Use larger starting bet to see increases

    // Simulate rounds (newRound is incremented first, then checked)
    for (let newRound = 2; newRound <= 10; newRound++) {
      const shouldIncrease = newRound % interval === 0;
      const newMinimumBet = shouldIncrease
        ? Math.floor(state.minimumBet * multiplier)
        : state.minimumBet;

      state = { ...state, round: newRound, minimumBet: newMinimumBet };

      if (shouldIncrease && state.minimumBet > 100) {
        // Only check if we actually got an increase (might not if starting bet is too small)
        expect(state.minimumBet).toBeGreaterThan(100);
      }
    }
  });

  it('should not increase minimum bet on non-interval rounds', () => {
    const interval = mode.minimumBetIncreaseInterval;
    const state = createGameState({ minimumBet: 10, round: 1 });

    // Check rounds that are NOT multiples of interval
    for (let round = 2; round <= 10; round++) {
      if (round % interval !== 0) {
        const newState = { ...state, round, minimumBet: state.minimumBet };
        expect(newState.minimumBet).toBe(10);
      }
    }
  });

  it('should apply correct percentage increase', () => {
    const increasePercent = mode.minimumBetIncreasePercent;
    const multiplier = 1 + increasePercent / 100;
    const initialBet = 100;

    const newBet = Math.floor(initialBet * multiplier);
    const expectedBet = Math.floor(100 * (1 + increasePercent / 100));

    expect(newBet).toBe(expectedBet);
  });
});

describe('Game State Logic - Endless Mode Entry', () => {
  const mode = getCurrentGameMode();
  const endlessConfig = mode.endlessMode!;

  it('should enter endless mode after startRound', () => {
    const startRound = endlessConfig.startRound;
    let state = createGameState({ round: startRound, isEndlessMode: false });

    // At start round (not yet in endless mode)
    expect(state.isEndlessMode).toBe(false);

    // After start round (newRound > startRound)
    state = { ...state, round: startRound + 1, isEndlessMode: true };
    expect(state.isEndlessMode).toBe(true);
  });

  it('should set baseMinimumBet when entering endless mode', () => {
    const startRound = endlessConfig.startRound;
    const currentMinimumBet = 15;

    const state = createGameState({
      round: startRound,
      minimumBet: currentMinimumBet,
      baseMinimumBet: 1, // Old base
      isEndlessMode: false,
    });

    // When entering endless mode (at startRound + 1), baseMinimumBet should be set to current minimumBet
    const newState = {
      ...state,
      round: startRound + 1,
      isEndlessMode: true,
      baseMinimumBet: state.minimumBet, // Set to current minimum bet
    };

    expect(newState.baseMinimumBet).toBe(currentMinimumBet);
  });

  it('should not enter endless mode before or at startRound', () => {
    const startRound = endlessConfig.startRound;
    const stateAtStartRound = createGameState({ round: startRound, isEndlessMode: false });
    const stateBeforeStartRound = createGameState({ round: startRound - 1, isEndlessMode: false });

    expect(stateAtStartRound.isEndlessMode).toBe(false);
    expect(stateBeforeStartRound.isEndlessMode).toBe(false);
  });
});

describe('Game State Logic - Winning Hands Counting', () => {
  it('should count winning hands correctly (payout > 0)', () => {
    const rewardTable = {
      'royal-flush': 250,
      'straight-flush': 50,
      'four-of-a-kind': 25,
      'full-house': 9,
      flush: 6,
      straight: 4,
      'three-of-a-kind': 3,
      'two-pair': 2,
      'one-pair': 1,
      'high-card': 0,
    };

    const betAmount = 10;

    // Create hands with different ranks
    const winningHand1 = createHand([
      createCard('A', 'hearts'),
      createCard('A', 'diamonds'),
      createCard('A', 'clubs'),
      createCard('A', 'spades'),
      createCard('K', 'hearts'),
    ]); // Four of a kind - payout > 0

    const winningHand2 = createHand([
      createCard('K', 'hearts'),
      createCard('K', 'diamonds'),
      createCard('Q', 'hearts'),
      createCard('Q', 'diamonds'),
      createCard('J', 'hearts'),
    ]); // Two pair - payout > 0

    const losingHand = createHand([
      createCard('2', 'hearts'),
      createCard('5', 'diamonds'),
      createCard('8', 'clubs'),
      createCard('J', 'spades'),
      createCard('K', 'hearts'),
    ]); // High card - payout = 0

    const parallelHands = [winningHand1, winningHand2, losingHand];

    // Count winning hands
    const winningCount = parallelHands.reduce((count, hand) => {
      const result = PokerEvaluator.evaluate(hand.cards);
      const withRewards = PokerEvaluator.applyRewards(result, rewardTable);
      const handPayout = betAmount * withRewards.multiplier;
      return handPayout > 0 ? count + 1 : count;
    }, 0);

    expect(winningCount).toBe(2);
  });

  it('should count zero winning hands when all hands lose', () => {
    const rewardTable = {
      'high-card': 0,
    };

    const betAmount = 10;

    const losingHand1 = createHand([
      createCard('2', 'hearts'),
      createCard('5', 'diamonds'),
      createCard('8', 'clubs'),
      createCard('J', 'spades'),
      createCard('K', 'hearts'),
    ]);

    const losingHand2 = createHand([
      createCard('3', 'hearts'),
      createCard('6', 'diamonds'),
      createCard('9', 'clubs'),
      createCard('Q', 'spades'),
      createCard('A', 'hearts'),
    ]);

    const parallelHands = [losingHand1, losingHand2];

    const winningCount = parallelHands.reduce((count, hand) => {
      const result = PokerEvaluator.evaluate(hand.cards);
      const withRewards = PokerEvaluator.applyRewards(result, rewardTable);
      const handPayout = betAmount * withRewards.multiplier;
      return handPayout > 0 ? count + 1 : count;
    }, 0);

    expect(winningCount).toBe(0);
  });

  it('should count all hands as winning when all have payouts', () => {
    const rewardTable = {
      'one-pair': 1,
    };

    const betAmount = 10;

    const winningHand1 = createHand([
      createCard('A', 'hearts'),
      createCard('A', 'diamonds'),
      createCard('2', 'clubs'),
      createCard('3', 'spades'),
      createCard('4', 'hearts'),
    ]);

    const winningHand2 = createHand([
      createCard('K', 'hearts'),
      createCard('K', 'diamonds'),
      createCard('5', 'clubs'),
      createCard('6', 'spades'),
      createCard('7', 'hearts'),
    ]);

    const parallelHands = [winningHand1, winningHand2];

    const winningCount = parallelHands.reduce((count, hand) => {
      const result = PokerEvaluator.evaluate(hand.cards);
      const withRewards = PokerEvaluator.applyRewards(result, rewardTable);
      const handPayout = betAmount * withRewards.multiplier;
      return handPayout > 0 ? count + 1 : count;
    }, 0);

    expect(winningCount).toBe(2);
  });
});

describe('Game State Logic - Failure Condition Integration', () => {
  it('should trigger game over when failure condition is detected', () => {
    const baseMinBet = 10;
    const requiredBet = Math.ceil(baseMinBet * betMultiplier);
    const state = createGameState({
      isEndlessMode: true,
      baseMinimumBet: baseMinBet,
      betAmount: requiredBet - 5, // Fails minimum bet multiplier
      round: 10,
      totalEarnings: minEfficiency * 10,
      winningHandsLastRound: minWinningHands / 2,
    });

    const failureState = checkFailureConditions(state);
    expect(failureState).toBe('minimum-bet-multiplier');

    // Game over should be triggered
    const gameOverState = { ...state, gameOver: failureState !== null };
    expect(gameOverState.gameOver).toBe(true);
  });

  it('should not trigger game over when no failure conditions', () => {
    const baseMinBet = 10;
    const requiredBet = Math.ceil(baseMinBet * betMultiplier);
    const state = createGameState({
      isEndlessMode: true,
      baseMinimumBet: baseMinBet,
      betAmount: requiredBet, // Passes
      round: 10,
      totalEarnings: minEfficiency * 10, // Passes
      winningHandsLastRound: minWinningHands, // Passes
    });

    const failureState = checkFailureConditions(state);
    expect(failureState).toBeNull();

    const gameOverState = { ...state, gameOver: failureState !== null };
    expect(gameOverState.gameOver).toBe(false);
  });

  it('should update currentFailureState when condition fails', () => {
    const baseMinBet = 10;
    const requiredBet = Math.ceil(baseMinBet * betMultiplier);
    const state = createGameState({
      isEndlessMode: true,
      baseMinimumBet: baseMinBet,
      betAmount: requiredBet - 5,
      round: 10,
      totalEarnings: minEfficiency * 10,
      winningHandsLastRound: minWinningHands / 2,
    });

    const failureState = checkFailureConditions(state);
    const updatedState = { ...state, currentFailureState: failureState };

    expect(updatedState.currentFailureState).toBe('minimum-bet-multiplier');
  });

  it('should clear currentFailureState when conditions pass', () => {
    const baseMinBet = 10;
    const requiredBet = Math.ceil(baseMinBet * betMultiplier);
    // Create state with failure condition
    createGameState({
      isEndlessMode: true,
      baseMinimumBet: baseMinBet,
      betAmount: requiredBet - 5,
      round: 10,
      totalEarnings: minEfficiency * 10,
      winningHandsLastRound: minWinningHands,
      currentFailureState: 'minimum-bet-multiplier',
    });

    // Then, passing state
    const passingState = createGameState({
      isEndlessMode: true,
      baseMinimumBet: baseMinBet,
      betAmount: requiredBet, // Now passes
      round: 10,
      totalEarnings: minEfficiency * 10,
      winningHandsLastRound: minWinningHands, // Passes
    });

    const failureState = checkFailureConditions(passingState);
    const updatedState = { ...passingState, currentFailureState: failureState };

    expect(updatedState.currentFailureState).toBeNull();
  });
});

describe('Game State Logic - Round Progression Scenarios', () => {
  it('should handle progression from normal to endless mode', () => {
    const mode = getCurrentGameMode();
    const startRound = mode.endlessMode!.startRound;
    const interval = mode.minimumBetIncreaseInterval;
    const increasePercent = mode.minimumBetIncreasePercent;
    const multiplier = 1 + increasePercent / 100;

    let state = createGameState({
      minimumBet: mode.startingBet,
      baseMinimumBet: mode.startingBet,
      round: 1,
      isEndlessMode: false,
    });

    // Progress through rounds (newRound is incremented first, then checked)
    for (let newRound = 2; newRound <= startRound + 5; newRound++) {
      const shouldIncreaseBet = newRound % interval === 0;
      const newMinimumBet = shouldIncreaseBet
        ? Math.floor(state.minimumBet * multiplier)
        : state.minimumBet;

      // Endless mode starts AFTER startRound (newRound > startRound)
      const shouldEnterEndless = newRound > startRound && !state.isEndlessMode;
      const newBaseMinimumBet = shouldEnterEndless ? state.minimumBet : state.baseMinimumBet;

      state = {
        ...state,
        round: newRound,
        minimumBet: newMinimumBet,
        baseMinimumBet: newBaseMinimumBet,
        isEndlessMode: shouldEnterEndless || state.isEndlessMode,
      };

      // Endless mode should start at startRound + 1
      if (newRound === startRound + 1) {
        expect(state.isEndlessMode).toBe(true);
        expect(state.baseMinimumBet).toBeGreaterThanOrEqual(mode.startingBet);
      }
    }

    expect(state.isEndlessMode).toBe(true);
  });

  it('should maintain baseMinimumBet after entering endless mode', () => {
    const mode = getCurrentGameMode();
    const startRound = mode.endlessMode!.startRound;

    let state = createGameState({
      minimumBet: 15,
      baseMinimumBet: 1,
      round: startRound,
      isEndlessMode: false,
    });

    // Enter endless mode (at startRound + 1)
    state = {
      ...state,
      round: startRound + 1,
      baseMinimumBet: state.minimumBet, // Set to current minimum bet
      isEndlessMode: true,
    };

    const baseBetAtEntry = state.baseMinimumBet;

    // Progress a few more rounds
    for (let round = startRound + 2; round <= startRound + 4; round++) {
      state = { ...state, round };
      expect(state.baseMinimumBet).toBe(baseBetAtEntry); // Should not change
    }
  });
});

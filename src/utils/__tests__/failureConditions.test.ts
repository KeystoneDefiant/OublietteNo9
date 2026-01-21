import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkFailureConditions, getFailureStateDescription } from '../failureConditions';
import { GameState, FailureStateType } from '../../types';
import { gameConfig } from '../../config/gameConfig';

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

describe('checkFailureConditions', () => {
  describe('when not in endless mode', () => {
    it('should return null when endless mode is not active', () => {
      const state = createGameState({ isEndlessMode: false });
      const result = checkFailureConditions(state);
      expect(result).toBeNull();
    });

    it('should return null even if conditions would fail', () => {
      const state = createGameState({
        isEndlessMode: false,
        betAmount: 0, // Would fail minimum bet multiplier
        totalEarnings: 0, // Would fail efficiency
        winningHandsLastRound: 0, // Would fail winning hands
      });
      const result = checkFailureConditions(state);
      expect(result).toBeNull();
    });
  });

  describe('minimum bet multiplier condition', () => {
    beforeEach(() => {
      // Ensure we're using the actual config values
      const mode = gameConfig.gameModes.normalGame;
      expect(mode.endlessMode?.failureConditions.minimumBetMultiplier?.enabled).toBe(true);
      expect(mode.endlessMode?.failureConditions.minimumBetMultiplier?.value).toBe(2.0);
    });

    it('should fail when bet is below required multiplier', () => {
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: 10,
        betAmount: 19, // Below 2x (20)
      });
      const result = checkFailureConditions(state);
      expect(result).toBe('minimum-bet-multiplier');
    });

    it('should pass when bet meets required multiplier', () => {
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: 10,
        betAmount: 20, // Exactly 2x
      });
      const result = checkFailureConditions(state);
      expect(result).not.toBe('minimum-bet-multiplier');
    });

    it('should pass when bet exceeds required multiplier', () => {
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: 10,
        betAmount: 25, // Above 2x (20)
      });
      const result = checkFailureConditions(state);
      expect(result).not.toBe('minimum-bet-multiplier');
    });

    it('should use Math.ceil for required bet calculation', () => {
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: 7, // 7 * 2.0 = 14, should require 14
        betAmount: 13, // Below required
      });
      const result = checkFailureConditions(state);
      expect(result).toBe('minimum-bet-multiplier');
    });

    it('should check minimum bet multiplier first (priority)', () => {
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: 10,
        betAmount: 15, // Fails minimum bet multiplier
        totalEarnings: 0, // Would also fail efficiency
        winningHandsLastRound: 0, // Would also fail winning hands
      });
      const result = checkFailureConditions(state);
      expect(result).toBe('minimum-bet-multiplier');
    });
  });

  describe('minimum credit efficiency condition', () => {
    beforeEach(() => {
      const mode = gameConfig.gameModes.normalGame;
      expect(mode.endlessMode?.failureConditions.minimumCreditEfficiency?.enabled).toBe(true);
      expect(mode.endlessMode?.failureConditions.minimumCreditEfficiency?.value).toBe(100);
    });

    it('should fail when efficiency is below required', () => {
      const state = createGameState({
        isEndlessMode: true,
        round: 10,
        totalEarnings: 900, // 900 / 10 = 90, below 100
        betAmount: 20, // Pass minimum bet
      });
      const result = checkFailureConditions(state);
      expect(result).toBe('minimum-credit-efficiency');
    });

    it('should pass when efficiency meets required', () => {
      const state = createGameState({
        isEndlessMode: true,
        round: 10,
        totalEarnings: 1000, // 1000 / 10 = 100, exactly required
        betAmount: 20, // Pass minimum bet
      });
      const result = checkFailureConditions(state);
      expect(result).not.toBe('minimum-credit-efficiency');
    });

    it('should pass when efficiency exceeds required', () => {
      const state = createGameState({
        isEndlessMode: true,
        round: 10,
        totalEarnings: 1500, // 1500 / 10 = 150, above 100
        betAmount: 20, // Pass minimum bet
      });
      const result = checkFailureConditions(state);
      expect(result).not.toBe('minimum-credit-efficiency');
    });

    it('should handle round 0 correctly (no division by zero)', () => {
      const state = createGameState({
        isEndlessMode: true,
        round: 0,
        totalEarnings: 0,
        betAmount: 20, // Pass minimum bet
      });
      const result = checkFailureConditions(state);
      // Efficiency would be 0, which is below 100, so should fail
      expect(result).toBe('minimum-credit-efficiency');
    });

    it('should only check if minimum bet multiplier passes', () => {
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: 10,
        betAmount: 15, // Fails minimum bet multiplier (should be 20+)
        round: 10,
        totalEarnings: 500, // Would fail efficiency too
      });
      const result = checkFailureConditions(state);
      // Should return minimum-bet-multiplier, not efficiency
      expect(result).toBe('minimum-bet-multiplier');
    });
  });

  describe('minimum winning hands per round condition', () => {
    beforeEach(() => {
      const mode = gameConfig.gameModes.normalGame;
      expect(mode.endlessMode?.failureConditions.minimumWinningHandsPerRound?.enabled).toBe(true);
      expect(mode.endlessMode?.failureConditions.minimumWinningHandsPerRound?.value).toBe(3);
    });

    it('should fail when winning hands are below required', () => {
      const state = createGameState({
        isEndlessMode: true,
        winningHandsLastRound: 2, // Below required 3
        betAmount: 20, // Pass minimum bet
        round: 10,
        totalEarnings: 1000, // Pass efficiency
      });
      const result = checkFailureConditions(state);
      expect(result).toBe('minimum-winning-hands');
    });

    it('should pass when winning hands meet required', () => {
      const state = createGameState({
        isEndlessMode: true,
        winningHandsLastRound: 3, // Exactly required
        betAmount: 20, // Pass minimum bet
        round: 10,
        totalEarnings: 1000, // Pass efficiency
      });
      const result = checkFailureConditions(state);
      expect(result).not.toBe('minimum-winning-hands');
    });

    it('should pass when winning hands exceed required', () => {
      const state = createGameState({
        isEndlessMode: true,
        winningHandsLastRound: 5, // Above required
        betAmount: 20, // Pass minimum bet
        round: 10,
        totalEarnings: 1000, // Pass efficiency
      });
      const result = checkFailureConditions(state);
      expect(result).not.toBe('minimum-winning-hands');
    });

    it('should only check if previous conditions pass', () => {
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: 10,
        betAmount: 15, // Fails minimum bet multiplier
        winningHandsLastRound: 0, // Would fail winning hands too
        round: 10,
        totalEarnings: 500, // Would fail efficiency too
      });
      const result = checkFailureConditions(state);
      // Should return minimum-bet-multiplier (first failing condition)
      expect(result).toBe('minimum-bet-multiplier');
    });
  });

  describe('all conditions passing', () => {
    it('should return null when all conditions pass', () => {
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: 10,
        betAmount: 20, // Pass minimum bet (2x)
        round: 10,
        totalEarnings: 1000, // Pass efficiency (100/round)
        winningHandsLastRound: 3, // Pass winning hands (3+)
      });
      const result = checkFailureConditions(state);
      expect(result).toBeNull();
    });

    it('should return null when all conditions exceed requirements', () => {
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: 10,
        betAmount: 50, // Well above minimum bet
        round: 10,
        totalEarnings: 2000, // Well above efficiency requirement
        winningHandsLastRound: 8, // Well above winning hands requirement
      });
      const result = checkFailureConditions(state);
      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle very high base minimum bet', () => {
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: 1000,
        betAmount: 1999, // Below 2x (2000)
      });
      const result = checkFailureConditions(state);
      expect(result).toBe('minimum-bet-multiplier');
    });

    it('should handle very high round numbers', () => {
      const state = createGameState({
        isEndlessMode: true,
        round: 1000,
        totalEarnings: 99000, // 99000 / 1000 = 99, below 100
        betAmount: 20, // Pass minimum bet
      });
      const result = checkFailureConditions(state);
      expect(result).toBe('minimum-credit-efficiency');
    });

    it('should handle zero winning hands correctly', () => {
      const state = createGameState({
        isEndlessMode: true,
        winningHandsLastRound: 0,
        betAmount: 20, // Pass minimum bet
        round: 10,
        totalEarnings: 1000, // Pass efficiency
      });
      const result = checkFailureConditions(state);
      expect(result).toBe('minimum-winning-hands');
    });
  });
});

describe('getFailureStateDescription', () => {
  describe('when failure state is null', () => {
    it('should return empty string', () => {
      const state = createGameState();
      const result = getFailureStateDescription(null, state);
      expect(result).toBe('');
    });
  });

  describe('minimum bet multiplier description', () => {
    it('should return correct description', () => {
      const state = createGameState({
        baseMinimumBet: 10,
      });
      const result = getFailureStateDescription('minimum-bet-multiplier', state);
      expect(result).toContain('Bet must be ≥');
      expect(result).toContain('20'); // 10 * 2.0 = 20
      expect(result).toContain('2x base');
    });

    it('should handle different base minimum bets', () => {
      const state = createGameState({
        baseMinimumBet: 25,
      });
      const result = getFailureStateDescription('minimum-bet-multiplier', state);
      expect(result).toContain('50'); // 25 * 2.0 = 50
    });

    it('should use Math.ceil for required bet', () => {
      const state = createGameState({
        baseMinimumBet: 7,
      });
      const result = getFailureStateDescription('minimum-bet-multiplier', state);
      expect(result).toContain('14'); // Math.ceil(7 * 2.0) = 14
    });
  });

  describe('minimum credit efficiency description', () => {
    it('should return correct description with current efficiency', () => {
      const state = createGameState({
        round: 10,
        totalEarnings: 900,
      });
      const result = getFailureStateDescription('minimum-credit-efficiency', state);
      expect(result).toContain('Efficiency:');
      expect(result).toContain('90.0'); // 900 / 10 = 90.0
      expect(result).toContain('100'); // Required value
      expect(result).toContain('credits/round');
    });

    it('should handle round 0', () => {
      const state = createGameState({
        round: 0,
        totalEarnings: 0,
      });
      const result = getFailureStateDescription('minimum-credit-efficiency', state);
      expect(result).toContain('0.0');
      expect(result).toContain('100');
    });

    it('should format efficiency to 1 decimal place', () => {
      const state = createGameState({
        round: 3,
        totalEarnings: 333,
      });
      const result = getFailureStateDescription('minimum-credit-efficiency', state);
      expect(result).toContain('111.0'); // 333 / 3 = 111.0
    });
  });

  describe('minimum winning hands description', () => {
    it('should return correct description with last round count', () => {
      const state = createGameState({
        winningHandsLastRound: 2,
      });
      const result = getFailureStateDescription('minimum-winning-hands', state);
      expect(result).toContain('Win ≥');
      expect(result).toContain('3'); // Required value
      expect(result).toContain('hands/round');
      expect(result).toContain('last: 2');
    });

    it('should handle zero winning hands', () => {
      const state = createGameState({
        winningHandsLastRound: 0,
      });
      const result = getFailureStateDescription('minimum-winning-hands', state);
      expect(result).toContain('last: 0');
    });

    it('should handle high winning hands count', () => {
      const state = createGameState({
        winningHandsLastRound: 8,
      });
      const result = getFailureStateDescription('minimum-winning-hands', state);
      expect(result).toContain('last: 8');
    });
  });

  describe('invalid failure state', () => {
    it('should return empty string for invalid state', () => {
      const state = createGameState();
      // TypeScript would prevent this, but test runtime behavior
      const result = getFailureStateDescription('' as FailureStateType, state);
      expect(result).toBe('');
    });
  });
});

describe('integration scenarios', () => {
  it('should handle a player barely passing all conditions', () => {
    const state = createGameState({
      isEndlessMode: true,
      baseMinimumBet: 10,
      betAmount: 20, // Exactly 2x
      round: 10,
      totalEarnings: 1000, // Exactly 100/round
      winningHandsLastRound: 3, // Exactly required
    });
    const result = checkFailureConditions(state);
    expect(result).toBeNull();
  });

  it('should handle a player failing multiple conditions (returns first)', () => {
    const state = createGameState({
      isEndlessMode: true,
      baseMinimumBet: 10,
      betAmount: 15, // Fails minimum bet (should be 20+)
      round: 10,
      totalEarnings: 500, // Would fail efficiency (50 < 100)
      winningHandsLastRound: 1, // Would fail winning hands (1 < 3)
    });
    const result = checkFailureConditions(state);
    expect(result).toBe('minimum-bet-multiplier');
  });

  it('should handle a player recovering from failure', () => {
    // First, failing state
    const failingState = createGameState({
      isEndlessMode: true,
      baseMinimumBet: 10,
      betAmount: 15,
      round: 10,
      totalEarnings: 1000,
      winningHandsLastRound: 3,
    });
    expect(checkFailureConditions(failingState)).toBe('minimum-bet-multiplier');

    // Then, recovering by increasing bet
    const recoveredState = createGameState({
      isEndlessMode: true,
      baseMinimumBet: 10,
      betAmount: 20, // Now passes
      round: 10,
      totalEarnings: 1000,
      winningHandsLastRound: 3,
    });
    expect(checkFailureConditions(recoveredState)).toBeNull();
  });

  it('should handle progression through rounds', () => {
    // Round 1 - all passing
    const round1 = createGameState({
      isEndlessMode: true,
      baseMinimumBet: 10,
      betAmount: 20,
      round: 1,
      totalEarnings: 150, // 150/1 = 150, passes
      winningHandsLastRound: 5,
    });
    expect(checkFailureConditions(round1)).toBeNull();

    // Round 10 - efficiency dropping
    const round10 = createGameState({
      isEndlessMode: true,
      baseMinimumBet: 10,
      betAmount: 20,
      round: 10,
      totalEarnings: 900, // 900/10 = 90, fails
      winningHandsLastRound: 3,
    });
    expect(checkFailureConditions(round10)).toBe('minimum-credit-efficiency');
  });
});

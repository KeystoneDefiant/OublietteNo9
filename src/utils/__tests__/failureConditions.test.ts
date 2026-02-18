import { describe, it, expect, beforeEach } from 'vitest';
import { checkFailureConditions, getFailureStateDescription } from '../failureConditions';
import { GameState, FailureStateType } from '../../types';
import { getCurrentGameMode } from '../../config/gameConfig';

// Get config values
const mode = getCurrentGameMode();
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
    maxDraws: 1,
    drawsCompletedThisRound: 0,
    wildCardCount: 0,
    gameOver: false,
    showShopNextRound: false,
    selectedShopOptions: [],
    isEndlessMode: false,
    currentFailureState: null,
    winningHandsLastRound: 0,
    audioSettings: {
      musicEnabled: true,
      soundEffectsEnabled: true,
      musicVolume: 0.7,
      soundEffectsVolume: 1.0,
    },
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
      const mode = getCurrentGameMode();
      expect(mode.endlessMode?.failureConditions.minimumBetMultiplier?.enabled).toBe(true);
      expect(mode.endlessMode?.failureConditions.minimumBetMultiplier?.value).toBe(betMultiplier);
    });

    it('should fail when bet is below required multiplier', () => {
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: baseMinBet,
        betAmount: requiredBet - 1, // Below required
      });
      const result = checkFailureConditions(state);
      expect(result).toBe('minimum-bet-multiplier');
    });

    it('should pass when bet meets required multiplier', () => {
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: baseMinBet,
        betAmount: requiredBet, // Exactly required
      });
      const result = checkFailureConditions(state);
      expect(result).not.toBe('minimum-bet-multiplier');
    });

    it('should pass when bet exceeds required multiplier', () => {
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: baseMinBet,
        betAmount: requiredBet + 5, // Above required
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
      const mode = getCurrentGameMode();
      expect(mode.endlessMode?.failureConditions.minimumCreditEfficiency?.enabled).toBe(true);
      expect(mode.endlessMode?.failureConditions.minimumCreditEfficiency?.value).toBe(100);
    });

    it('should fail when efficiency is below required', () => {
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        round: 10,
        totalEarnings: (minEfficiency - 10) * 10, // Below required efficiency
        betAmount: requiredBet, // Pass minimum bet
      });
      const result = checkFailureConditions(state);
      expect(result).toBe('minimum-credit-efficiency');
    });

    it('should pass when efficiency meets required', () => {
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        round: 10,
        totalEarnings: minEfficiency * 10, // Exactly required efficiency
        betAmount: requiredBet, // Pass minimum bet
      });
      const result = checkFailureConditions(state);
      expect(result).not.toBe('minimum-credit-efficiency');
    });

    it('should pass when efficiency exceeds required', () => {
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        round: 10,
        totalEarnings: (minEfficiency + 50) * 10, // Above required efficiency
        betAmount: requiredBet, // Pass minimum bet
      });
      const result = checkFailureConditions(state);
      expect(result).not.toBe('minimum-credit-efficiency');
    });

    it('should handle round 0 correctly (no division by zero)', () => {
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        round: 0,
        totalEarnings: 0,
        betAmount: requiredBet, // Pass minimum bet
      });
      const result = checkFailureConditions(state);
      // Efficiency would be 0, which is below required, so should fail
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
      const mode = getCurrentGameMode();
      expect(mode.endlessMode?.failureConditions.minimumWinningHandsPerRound?.enabled).toBe(true);
      expect(mode.endlessMode?.failureConditions.minimumWinningHandsPerRound?.value).toBe(minWinningHands);
    });

    it('should fail when winning hands are below required', () => {
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        winningHandsLastRound: minWinningHands - 1, // Below required
        betAmount: requiredBet, // Pass minimum bet
        round: 10,
        totalEarnings: minEfficiency * 10, // Pass efficiency
      });
      const result = checkFailureConditions(state);
      expect(result).toBe('minimum-winning-hands');
    });

    it('should pass when winning hands meet required', () => {
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        winningHandsLastRound: minWinningHands, // Exactly required (from config)
        betAmount: requiredBet, // Pass minimum bet
        round: 10,
        totalEarnings: minEfficiency * 10, // Pass efficiency
      });
      const result = checkFailureConditions(state);
      expect(result).not.toBe('minimum-winning-hands');
    });

    it('should pass when winning hands exceed required', () => {
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        winningHandsLastRound: minWinningHands + 5, // Above required (config)
        betAmount: requiredBet, // Pass minimum bet
        round: 10,
        totalEarnings: minEfficiency * 10, // Pass efficiency
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
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: baseMinBet,
        betAmount: requiredBet, // Pass minimum bet
        round: 10,
        totalEarnings: minEfficiency * 10, // Pass efficiency
        winningHandsLastRound: minWinningHands, // Pass winning hands
      });
      const result = checkFailureConditions(state);
      expect(result).toBeNull();
    });

    it('should return null when all conditions exceed requirements', () => {
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: baseMinBet,
        betAmount: requiredBet * 2, // Well above minimum bet
        round: 10,
        totalEarnings: minEfficiency * 20, // Well above efficiency requirement
        winningHandsLastRound: minWinningHands + 10, // Well above winning hands requirement
      });
      const result = checkFailureConditions(state);
      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle very high base minimum bet', () => {
      const baseMinBet = 1000;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        baseMinimumBet: baseMinBet,
        betAmount: requiredBet - 1, // Below required
      });
      const result = checkFailureConditions(state);
      expect(result).toBe('minimum-bet-multiplier');
    });

    it('should handle very high round numbers', () => {
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        round: 1000,
        totalEarnings: (minEfficiency - 1) * 1000, // Below required efficiency
        betAmount: requiredBet, // Pass minimum bet
      });
      const result = checkFailureConditions(state);
      expect(result).toBe('minimum-credit-efficiency');
    });

    it('should handle zero winning hands correctly', () => {
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        isEndlessMode: true,
        winningHandsLastRound: 0,
        betAmount: requiredBet, // Pass minimum bet
        round: 10,
        totalEarnings: minEfficiency * 10, // Pass efficiency
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
      const baseMinBet = 10;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        baseMinimumBet: baseMinBet,
      });
      const result = getFailureStateDescription('minimum-bet-multiplier', state);
      expect(result).toContain('Bet must be ≥');
      expect(result).toContain(String(requiredBet));
      expect(result).toContain(`${betMultiplier}x base`);
    });

    it('should handle different base minimum bets', () => {
      const baseMinBet = 25;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        baseMinimumBet: baseMinBet,
      });
      const result = getFailureStateDescription('minimum-bet-multiplier', state);
      expect(result).toContain(String(requiredBet));
    });

    it('should use Math.ceil for required bet', () => {
      const baseMinBet = 7;
      const requiredBet = Math.ceil(baseMinBet * betMultiplier);
      const state = createGameState({
        baseMinimumBet: baseMinBet,
      });
      const result = getFailureStateDescription('minimum-bet-multiplier', state);
      expect(result).toContain(String(requiredBet));
    });
  });

  describe('minimum credit efficiency description', () => {
    it('should return correct description with current efficiency', () => {
      const state = createGameState({
        round: 10,
        totalEarnings: (minEfficiency - 10) * 10,
      });
      const result = getFailureStateDescription('minimum-credit-efficiency', state);
      expect(result).toContain('Efficiency:');
      expect(result).toContain(String(minEfficiency - 10) + '.0');
      expect(result).toContain(String(minEfficiency)); // Required value
      expect(result).toContain('credits/round');
    });

    it('should handle round 0', () => {
      const state = createGameState({
        round: 0,
        totalEarnings: 0,
      });
      const result = getFailureStateDescription('minimum-credit-efficiency', state);
      expect(result).toContain('0.0');
      expect(result).toContain(String(minEfficiency));
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
      expect(result).toContain(String(minWinningHands)); // Required value from config
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
    const baseMinBet = 10;
    const requiredBet = Math.ceil(baseMinBet * betMultiplier);
    const state = createGameState({
      isEndlessMode: true,
      baseMinimumBet: baseMinBet,
      betAmount: requiredBet, // Exactly required
      round: 10,
      totalEarnings: minEfficiency * 10, // Exactly required
      winningHandsLastRound: minWinningHands, // Exactly required (from config)
    });
    const result = checkFailureConditions(state);
    expect(result).toBeNull();
  });

  it('should handle a player failing multiple conditions (returns first)', () => {
    const baseMinBet = 10;
    const requiredBet = Math.ceil(baseMinBet * betMultiplier);
    const state = createGameState({
      isEndlessMode: true,
      baseMinimumBet: baseMinBet,
      betAmount: requiredBet - 5, // Fails minimum bet
      round: 10,
      totalEarnings: (minEfficiency / 2) * 10, // Would fail efficiency
      winningHandsLastRound: 1, // Would fail winning hands
    });
    const result = checkFailureConditions(state);
    expect(result).toBe('minimum-bet-multiplier');
  });

  it('should handle a player recovering from failure', () => {
    const baseMinBet = 10;
    const requiredBet = Math.ceil(baseMinBet * betMultiplier);
    // First, failing state
    const failingState = createGameState({
      isEndlessMode: true,
      baseMinimumBet: baseMinBet,
      betAmount: requiredBet - 5,
      round: 10,
      totalEarnings: minEfficiency * 10,
      winningHandsLastRound: minWinningHands / 2,
    });
    expect(checkFailureConditions(failingState)).toBe('minimum-bet-multiplier');

    // Then, recovering by increasing bet
    const recoveredState = createGameState({
      isEndlessMode: true,
      baseMinimumBet: baseMinBet,
      betAmount: requiredBet, // Now passes
      round: 10,
      totalEarnings: minEfficiency * 10,
      winningHandsLastRound: minWinningHands, // Now passes (from config)
    });
    expect(checkFailureConditions(recoveredState)).toBeNull();
  });

  it('should handle progression through rounds', () => {
    const baseMinBet = 10;
    const requiredBet = Math.ceil(baseMinBet * betMultiplier);
    // Round 1 - all passing
    const round1 = createGameState({
      isEndlessMode: true,
      baseMinimumBet: baseMinBet,
      betAmount: requiredBet,
      round: 1,
      totalEarnings: minEfficiency * 1.5, // Above required, passes
      winningHandsLastRound: minWinningHands, // Exactly required, passes
    });
    expect(checkFailureConditions(round1)).toBeNull();

    // Round 10 - efficiency dropping
    const round10 = createGameState({
      isEndlessMode: true,
      baseMinimumBet: baseMinBet,
      betAmount: requiredBet,
      round: 10,
      totalEarnings: (minEfficiency - 10) * 10, // Below required, fails
      winningHandsLastRound: minWinningHands / 2,
    });
    expect(checkFailureConditions(round10)).toBe('minimum-credit-efficiency');
  });
});

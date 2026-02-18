import { GameState, FailureStateType } from '../types';
import { getCurrentGameMode } from '../config/gameConfig';

/**
 * Checks all enabled failure conditions and returns the first failing condition
 * This is designed to be extensible - new failure conditions can be added here
 * 
 * @param state - Current game state
 * @returns The type of failure condition that is failing, or null if all conditions pass
 */
export function checkFailureConditions(state: GameState): FailureStateType {
  const mode = getCurrentGameMode();
  const endlessConfig = mode.endlessMode;

  // Only check failure conditions if endless mode is active
  if (!state.isEndlessMode || !endlessConfig) {
    return null;
  }

  const conditions = endlessConfig.failureConditions;

  // Check minimum bet multiplier condition
  if (conditions.minimumBetMultiplier?.enabled) {
    const requiredBet = Math.ceil(state.baseMinimumBet * conditions.minimumBetMultiplier.value);
    if (state.betAmount < requiredBet) {
      return 'minimum-bet-multiplier';
    }
  }

  // Check minimum credit efficiency condition
  if (conditions.minimumCreditEfficiency?.enabled) {
    const efficiency = state.round > 0 ? state.totalEarnings / state.round : 0;
    if (efficiency < conditions.minimumCreditEfficiency.value) {
      return 'minimum-credit-efficiency';
    }
  }

  // Check minimum winning hands per round condition
  if (conditions.minimumWinningHandsPerRound?.enabled) {
    if (state.winningHandsLastRound < conditions.minimumWinningHandsPerRound.value) {
      return 'minimum-winning-hands';
    }
  }

  // Check minimum win percentage (only increments from when endless mode started)
  const minWinPct = conditions.minimumWinPercent;
  if (minWinPct?.enabled && endlessConfig && state.round > endlessConfig.startRound) {
    const roundsCompletedInEndless = state.round - endlessConfig.startRound;
    const requiredPercent = Math.min(
      minWinPct.startPercent + (roundsCompletedInEndless - 1) * minWinPct.incrementPerRound,
      minWinPct.maxPercent
    );
    const minRequiredWins = Math.ceil(
      (state.selectedHandCount * requiredPercent) / 100
    );
    if (state.winningHandsLastRound < minRequiredWins) {
      return 'minimum-win-percent';
    }
  }

  // All conditions passed
  return null;
}

/**
 * Gets a human-readable description of a failure state
 * 
 * @param failureState - The failure state type
 * @param state - Current game state (for context)
 * @returns Human-readable description
 */
export function getFailureStateDescription(
  failureState: FailureStateType,
  state: GameState
): string {
  const mode = getCurrentGameMode();
  const endlessConfig = mode.endlessMode;

  if (!failureState || !endlessConfig) {
    return '';
  }

  switch (failureState) {
    case 'minimum-bet-multiplier': {
      const requiredBet = Math.ceil(
        state.baseMinimumBet * endlessConfig.failureConditions.minimumBetMultiplier!.value
      );
      return `Bet must be ≥ ${requiredBet} (${endlessConfig.failureConditions.minimumBetMultiplier!.value}x base)`;
    }
    case 'minimum-credit-efficiency': {
      const efficiency = state.round > 0 ? (state.totalEarnings / state.round).toFixed(1) : '0.0';
      const required = endlessConfig.failureConditions.minimumCreditEfficiency!.value;
      return `Efficiency: ${efficiency}/${required} credits/round`;
    }
    case 'minimum-winning-hands': {
      const required = endlessConfig.failureConditions.minimumWinningHandsPerRound!.value;
      return `Win ≥ ${required} hands/round (last: ${state.winningHandsLastRound})`;
    }
    case 'minimum-win-percent': {
      const minWinPct = endlessConfig.failureConditions.minimumWinPercent!;
      const roundsCompletedInEndless = endlessConfig.startRound
        ? Math.max(0, state.round - endlessConfig.startRound)
        : 0;
      const requiredPercent = Math.min(
        minWinPct.startPercent + (roundsCompletedInEndless - 1) * minWinPct.incrementPerRound,
        minWinPct.maxPercent
      );
      return `You must win at least ${requiredPercent}% of the hands played this round`;
    }
    default:
      return '';
  }
}

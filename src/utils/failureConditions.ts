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

/**
 * Gets human-readable descriptions of all enabled end-game conditions.
 * Used to inform the player what they must meet to survive when endless mode is active.
 *
 * @param state - Current game state
 * @returns Array of condition descriptions, or empty if endless mode is not active
 */
export function getEndlessModeConditions(state: GameState): string[] {
  const mode = getCurrentGameMode();
  const endlessConfig = mode.endlessMode;

  if (!state.isEndlessMode || !endlessConfig) {
    return [];
  }

  const conditions = endlessConfig.failureConditions;
  const result: string[] = [];

  if (conditions.minimumBetMultiplier?.enabled) {
    const requiredBet = Math.ceil(state.baseMinimumBet * conditions.minimumBetMultiplier!.value);
    result.push(
      `Bet must be ≥ ${requiredBet} (${conditions.minimumBetMultiplier!.value}x base minimum)`
    );
  }

  if (conditions.minimumCreditEfficiency?.enabled) {
    result.push(
      `Efficiency must be ≥ ${conditions.minimumCreditEfficiency!.value} credits/round`
    );
  }

  if (conditions.minimumWinningHandsPerRound?.enabled) {
    result.push(
      `Win ≥ ${conditions.minimumWinningHandsPerRound!.value} hands per round`
    );
  }

  if (conditions.minimumWinPercent?.enabled) {
    const minWinPct = conditions.minimumWinPercent;
    const roundsCompletedInEndless = endlessConfig.startRound
      ? Math.max(0, state.round - endlessConfig.startRound)
      : 0;
    const requiredPercent = Math.min(
      minWinPct.startPercent + (roundsCompletedInEndless - 1) * minWinPct.incrementPerRound,
      minWinPct.maxPercent
    );
    result.push(`Win at least ${requiredPercent}% of hands this round`);
  }

  return result;
}

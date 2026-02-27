import { describe, it, expect } from 'vitest';
import { getGameOverDisplay } from '../gameOverDisplay';
import { createTestGameState } from '../../test/testHelpers';

describe('getGameOverDisplay', () => {
  it('should return voluntary end display when reason is voluntary', () => {
    const result = getGameOverDisplay('voluntary', null);
    expect(result.title).toBe('Run Complete!');
    expect(result.subtitle).toBe('You ended your run successfully');
    expect(result.isVoluntaryEnd).toBe(true);
    expect(result.tip).toBeUndefined();
  });

  it('should return voluntary when reason is null', () => {
    const result = getGameOverDisplay(null, null);
    expect(result.title).toBe('Run Complete!');
    expect(result.isVoluntaryEnd).toBe(true);
  });

  it('should return insufficient-credits display with context', () => {
    const result = getGameOverDisplay('insufficient-credits', null, {
      minimumBet: 10,
      handCount: 20,
    });
    expect(result.title).toBe('Game Over');
    expect(result.subtitle).toContain('200');
    expect(result.subtitle).toContain('10');
    expect(result.subtitle).toContain('20');
    expect(result.isVoluntaryEnd).toBe(false);
    expect(result.tip).toContain('shop');
  });

  it('should return failure condition display with state', () => {
    const state = createTestGameState({
      baseMinimumBet: 10,
      round: 31,
      totalEarnings: 500,
      winningHandsLastRound: 5,
    });
    const result = getGameOverDisplay('minimum-bet-multiplier', state);
    expect(result.title).toBe('Game Over');
    expect(result.subtitle).toMatch(/Bet must be|multiplier/);
    expect(result.isVoluntaryEnd).toBe(false);
  });
});

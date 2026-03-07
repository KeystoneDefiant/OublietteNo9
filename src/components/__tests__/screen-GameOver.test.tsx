import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { GameOver } from '../screen-GameOver';
import { createTestGameState } from '../../test/testHelpers';
import { gameConfig } from '../../config/gameConfig';

describe('GameOver Component', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats average per round with commas and one decimal place', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    render(
      <GameOver
        round={4}
        totalEarnings={12345}
        credits={500}
        gameOverReason="insufficient-credits"
        gameState={createTestGameState({
          handCount: 42,
          runHighestCombo: 17,
          runHighestMultiplier: 3.5,
        })}
        onReturnToMenu={vi.fn()}
      />
    );

    const avgCard = screen.getAllByText('Avg per Round')[0]?.closest('div');
    expect(avgCard).toBeTruthy();
    expect(within(avgCard as HTMLElement).getByText('3,086.3')).toBeInTheDocument();
    expect(screen.getByText('credits/round')).toBeInTheDocument();
  });

  it('shows final parallel hands and best run streak stats', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    render(
      <GameOver
        round={9}
        totalEarnings={50000}
        credits={2500}
        gameOverReason="minimum-win-percent"
        gameState={createTestGameState({
          handCount: 88,
          runHighestCombo: 19,
          runHighestMultiplier: 4.25,
        })}
        onReturnToMenu={vi.fn()}
      />
    );

    const parallelHandsCard = screen.getAllByText('Parallel Hands')[0]?.closest('div');
    expect(parallelHandsCard).toBeTruthy();
    expect(within(parallelHandsCard as HTMLElement).getByText('88')).toBeInTheDocument();

    const highestComboCard = screen.getAllByText('Highest Combo')[0]?.closest('div');
    expect(highestComboCard).toBeTruthy();
    expect(within(highestComboCard as HTMLElement).getByText('19')).toBeInTheDocument();

    const highestMultiplierCard = screen.getAllByText('Highest Multiplier')[0]?.closest('div');
    expect(highestMultiplierCard).toBeTruthy();
    expect(within(highestMultiplierCard as HTMLElement).getByText('4.25x')).toBeInTheDocument();
  });

  it('fills the hint area with a config-driven random quip', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    render(
      <GameOver
        round={2}
        totalEarnings={100}
        credits={0}
        gameOverReason="insufficient-credits"
        gameState={createTestGameState()}
        onReturnToMenu={vi.fn()}
      />
    );

    expect(screen.getByText('Your highball glass whispers...')).toBeInTheDocument();
    expect(screen.getByText(gameConfig.quips.gameOver[0])).toBeInTheDocument();
  });
});

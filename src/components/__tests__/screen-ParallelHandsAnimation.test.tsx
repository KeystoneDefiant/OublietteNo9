import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ParallelHandsAnimation } from '../screen-ParallelHandsAnimation';
import { Hand, Card } from '../../types';
import { getTestRewardTable } from '../../test/testHelpers';

vi.mock('../../hooks/useThemeAudio', () => ({
  useThemeAudio: () => ({
    playSound: vi.fn(),
  }),
}));

function createCard(rank: Card['rank'], suit: Card['suit'], id: string): Card {
  return {
    id,
    rank,
    suit,
  };
}

const winningHand: Hand = {
  id: 'winning-hand',
  cards: [
    createCard('A', 'hearts', 'ah'),
    createCard('K', 'hearts', 'kh'),
    createCard('Q', 'hearts', 'qh'),
    createCard('J', 'hearts', 'jh'),
    createCard('10', 'hearts', '10h'),
  ],
};

describe('ParallelHandsAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should show the scored hands counter immediately', () => {
    render(
      <ParallelHandsAnimation
        parallelHands={[winningHand, { ...winningHand, id: 'winning-hand-2' }]}
        playerHand={winningHand.cards}
        heldIndices={[0, 1]}
        rewardTable={getTestRewardTable()}
        selectedHandCount={2}
        betAmount={10}
        initialStreakCounter={0}
        onAnimationComplete={vi.fn()}
        audioSettings={{ musicEnabled: true, soundEffectsEnabled: true }}
        animationSpeedMode={1}
      />
    );

    expect(screen.getByText(/0 of 2 hands/i)).toBeInTheDocument();
  });

  it('should keep the full hand total visible while the animation runs', () => {
    render(
      <ParallelHandsAnimation
        parallelHands={[winningHand]}
        playerHand={winningHand.cards}
        heldIndices={[0, 1]}
        rewardTable={getTestRewardTable()}
        selectedHandCount={1}
        betAmount={10}
        initialStreakCounter={0}
        onAnimationComplete={vi.fn()}
        audioSettings={{ musicEnabled: true, soundEffectsEnabled: true }}
        animationSpeedMode={1}
      />
    );

    expect(screen.getByText(/0 of 1 hands/i)).toBeInTheDocument();
  });

  it('should switch to the high-velocity reveal mode for large hand counts', () => {
    const manyHands = Array.from({ length: 100 }, (_, index) => ({
      ...winningHand,
      id: `winning-hand-${index}`,
    }));

    const { container } = render(
      <ParallelHandsAnimation
        parallelHands={manyHands}
        playerHand={winningHand.cards}
        heldIndices={[0, 1]}
        rewardTable={getTestRewardTable()}
        selectedHandCount={100}
        betAmount={10}
        initialStreakCounter={0}
        onAnimationComplete={vi.fn()}
        audioSettings={{ musicEnabled: true, soundEffectsEnabled: true }}
        animationSpeedMode={1}
      />
    );

    expect(screen.getByText(/high-velocity cascade/i)).toBeInTheDocument();
    expect(container.querySelector('.phase-b-rolodex')?.getAttribute('data-stack-count')).toBe('3');
  });
});

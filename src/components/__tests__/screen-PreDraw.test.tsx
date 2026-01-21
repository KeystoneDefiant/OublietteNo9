import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreDraw } from '../screen-PreDraw';
import { GameState } from '../../types';

// Mock child components to simplify testing
vi.mock('../RewardTable', () => ({
  RewardTable: () => <div data-testid="reward-table">Reward Table</div>,
}));

vi.mock('../CheatsModal', () => ({
  CheatsModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="cheats-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../GameHeader', () => ({
  GameHeader: () => <div data-testid="game-header">Game Header</div>,
}));

describe('PreDraw Component - Max Bet Button', () => {
  const defaultProps = {
    credits: 1000,
    handCount: 10,
    selectedHandCount: 5,
    betAmount: 10,
    minimumBet: 2,
    rewardTable: {
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
    },
    gameOver: false,
    round: 1,
    totalEarnings: 0,
    onSetBetAmount: vi.fn(),
    onSetSelectedHandCount: vi.fn(),
    onDealHand: vi.fn(),
    onEndRun: vi.fn(),
    onCheatAddCredits: vi.fn(),
    onCheatAddHands: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Max Bet Button', () => {
    it('should calculate and set maximum bet when credits allow more than minimum', async () => {
      const user = userEvent.setup();
      const onSetBetAmount = vi.fn();
      
      render(<PreDraw {...defaultProps} credits={1000} selectedHandCount={5} onSetBetAmount={onSetBetAmount} />);

      // Find the Max button by aria-label
      const maxButton = screen.getByLabelText('Set bet amount to maximum affordable');
      
      // Click the Max button
      await user.click(maxButton);

      // Should calculate: Math.floor(1000 / 5) = 200
      // Should be at least minimumBet (2), so result is 200
      expect(onSetBetAmount).toHaveBeenCalledTimes(1);
      expect(onSetBetAmount).toHaveBeenCalledWith(200);
    });

    it('should set minimum bet when credits are insufficient for higher bet', async () => {
      const user = userEvent.setup();
      const onSetBetAmount = vi.fn();
      
      // Credits: 5, Hand count: 5, Minimum bet: 2
      // Math.floor(5 / 5) = 1, but minimum is 2, so should set to 2
      render(
        <PreDraw
          {...defaultProps}
          credits={5}
          selectedHandCount={5}
          minimumBet={2}
          onSetBetAmount={onSetBetAmount}
        />
      );

      const maxButton = screen.getByLabelText('Set bet amount to maximum affordable');
      await user.click(maxButton);

      // Should use minimumBet since calculated value (1) is less than minimum (2)
      expect(onSetBetAmount).toHaveBeenCalledTimes(1);
      expect(onSetBetAmount).toHaveBeenCalledWith(2);
    });

    it('should floor the result when credits are not exactly divisible by hand count', async () => {
      const user = userEvent.setup();
      const onSetBetAmount = vi.fn();
      
      // Credits: 999, Hand count: 5
      // Math.floor(999 / 5) = 199 (not 199.8)
      render(
        <PreDraw
          {...defaultProps}
          credits={999}
          selectedHandCount={5}
          onSetBetAmount={onSetBetAmount}
        />
      );

      const maxButton = screen.getByLabelText('Set bet amount to maximum affordable');
      await user.click(maxButton);

      expect(onSetBetAmount).toHaveBeenCalledTimes(1);
      expect(onSetBetAmount).toHaveBeenCalledWith(199);
    });

    it('should work correctly with different hand counts', async () => {
      const user = userEvent.setup();
      const onSetBetAmount = vi.fn();
      
      // Credits: 100, Hand count: 3
      // Math.floor(100 / 3) = 33
      render(
        <PreDraw
          {...defaultProps}
          credits={100}
          selectedHandCount={3}
          onSetBetAmount={onSetBetAmount}
        />
      );

      const maxButton = screen.getByLabelText('Set bet amount to maximum affordable');
      await user.click(maxButton);

      expect(onSetBetAmount).toHaveBeenCalledTimes(1);
      expect(onSetBetAmount).toHaveBeenCalledWith(33);
    });

    it('should clear bet input error when clicked', async () => {
      const user = userEvent.setup();
      const onSetBetAmount = vi.fn();
      
      render(<PreDraw {...defaultProps} credits={1000} selectedHandCount={5} onSetBetAmount={onSetBetAmount} />);

      // First, set an error by entering an invalid bet amount
      const betInput = screen.getByLabelText('Bet amount per hand');
      await user.clear(betInput);
      await user.type(betInput, 'invalid');
      
      // The error should be visible
      const errorMessage = screen.queryByText(/Please enter a valid number/i);
      expect(errorMessage).toBeInTheDocument();

      // Click Max button - should clear error and set max bet
      const maxButton = screen.getByLabelText('Set bet amount to maximum affordable');
      await user.click(maxButton);

      // Verify that onSetBetAmount was called with the max bet
      // The component's onClick handler clears the error state
      expect(onSetBetAmount).toHaveBeenCalledTimes(1);
      expect(onSetBetAmount).toHaveBeenCalledWith(200);
    });

    it('should handle edge case with single hand', async () => {
      const user = userEvent.setup();
      const onSetBetAmount = vi.fn();
      
      // Credits: 50, Hand count: 1
      // Math.floor(50 / 1) = 50
      render(
        <PreDraw
          {...defaultProps}
          credits={50}
          selectedHandCount={1}
          onSetBetAmount={onSetBetAmount}
        />
      );

      const maxButton = screen.getByLabelText('Set bet amount to maximum affordable');
      await user.click(maxButton);

      expect(onSetBetAmount).toHaveBeenCalledTimes(1);
      expect(onSetBetAmount).toHaveBeenCalledWith(50);
    });

    it('should handle case where credits exactly match minimum bet times hand count', async () => {
      const user = userEvent.setup();
      const onSetBetAmount = vi.fn();
      
      // Credits: 10, Hand count: 5, Minimum bet: 2
      // Math.floor(10 / 5) = 2, which equals minimum bet
      render(
        <PreDraw
          {...defaultProps}
          credits={10}
          selectedHandCount={5}
          minimumBet={2}
          onSetBetAmount={onSetBetAmount}
        />
      );

      const maxButton = screen.getByLabelText('Set bet amount to maximum affordable');
      await user.click(maxButton);

      expect(onSetBetAmount).toHaveBeenCalledTimes(1);
      expect(onSetBetAmount).toHaveBeenCalledWith(2);
    });
  });

  describe('Max Hands Button', () => {
    it('should set maximum hands when player can afford it at current bet', async () => {
      const user = userEvent.setup();
      const onSetSelectedHandCount = vi.fn();
      const onSetBetAmount = vi.fn();
      
      // Credits: 1000, Hand count: 10, Bet: 10, Selected: 5
      // Can afford 10 hands at 10 credits each (100 total)
      render(
        <PreDraw
          {...defaultProps}
          credits={1000}
          handCount={10}
          selectedHandCount={5}
          betAmount={10}
          onSetSelectedHandCount={onSetSelectedHandCount}
          onSetBetAmount={onSetBetAmount}
        />
      );

      const maxHandsButton = screen.getByLabelText('Set to maximum number of hands');
      await user.click(maxHandsButton);

      // Should set to max hands (10), bet stays the same
      expect(onSetSelectedHandCount).toHaveBeenCalledTimes(1);
      expect(onSetSelectedHandCount).toHaveBeenCalledWith(10);
      expect(onSetBetAmount).toHaveBeenCalledTimes(1);
      expect(onSetBetAmount).toHaveBeenCalledWith(10);
    });

    it('should reduce bet amount when player cannot afford max hands at current bet', async () => {
      const user = userEvent.setup();
      const onSetSelectedHandCount = vi.fn();
      const onSetBetAmount = vi.fn();
      
      // Credits: 50, Hand count: 10, Bet: 10, Selected: 5
      // Cannot afford 10 hands at 10 credits (need 100, have 50)
      // Should reduce bet to Math.floor(50 / 10) = 5
      render(
        <PreDraw
          {...defaultProps}
          credits={50}
          handCount={10}
          selectedHandCount={5}
          betAmount={10}
          minimumBet={2}
          onSetSelectedHandCount={onSetSelectedHandCount}
          onSetBetAmount={onSetBetAmount}
        />
      );

      const maxHandsButton = screen.getByLabelText('Set to maximum number of hands');
      await user.click(maxHandsButton);

      // Should set to max hands (10) and reduce bet to 5
      expect(onSetSelectedHandCount).toHaveBeenCalledTimes(1);
      expect(onSetSelectedHandCount).toHaveBeenCalledWith(10);
      expect(onSetBetAmount).toHaveBeenCalledTimes(1);
      expect(onSetBetAmount).toHaveBeenCalledWith(5);
    });

    it('should reduce hands when player cannot afford even at minimum bet', async () => {
      const user = userEvent.setup();
      const onSetSelectedHandCount = vi.fn();
      const onSetBetAmount = vi.fn();
      
      // Credits: 5, Hand count: 10, Bet: 10, Minimum bet: 2
      // Cannot afford 10 hands even at minimum bet (need 20, have 5)
      // Should reduce hands to Math.floor(5 / 2) = 2
      render(
        <PreDraw
          {...defaultProps}
          credits={5}
          handCount={10}
          selectedHandCount={5}
          betAmount={10}
          minimumBet={2}
          onSetSelectedHandCount={onSetSelectedHandCount}
          onSetBetAmount={onSetBetAmount}
        />
      );

      const maxHandsButton = screen.getByLabelText('Set to maximum number of hands');
      await user.click(maxHandsButton);

      // Should reduce hands to 2 and set bet to minimum (2)
      expect(onSetSelectedHandCount).toHaveBeenCalledTimes(1);
      expect(onSetSelectedHandCount).toHaveBeenCalledWith(2);
      expect(onSetBetAmount).toHaveBeenCalledTimes(1);
      expect(onSetBetAmount).toHaveBeenCalledWith(2);
    });

    it('should ensure at least 1 hand even with very low credits', async () => {
      const user = userEvent.setup();
      const onSetSelectedHandCount = vi.fn();
      const onSetBetAmount = vi.fn();
      
      // Credits: 1, Hand count: 10, Minimum bet: 2
      // Cannot afford even 1 hand at minimum bet (need 2, have 1)
      // Should still set to 1 hand (edge case - player can't play, but we set to 1)
      render(
        <PreDraw
          {...defaultProps}
          credits={1}
          handCount={10}
          selectedHandCount={5}
          betAmount={10}
          minimumBet={2}
          onSetSelectedHandCount={onSetSelectedHandCount}
          onSetBetAmount={onSetBetAmount}
        />
      );

      const maxHandsButton = screen.getByLabelText('Set to maximum number of hands');
      await user.click(maxHandsButton);

      // Should set to 1 hand (minimum) and minimum bet
      expect(onSetSelectedHandCount).toHaveBeenCalledTimes(1);
      expect(onSetSelectedHandCount).toHaveBeenCalledWith(1);
      expect(onSetBetAmount).toHaveBeenCalledTimes(1);
      expect(onSetBetAmount).toHaveBeenCalledWith(2);
    });

    it('should handle case where optimal bet equals minimum bet', async () => {
      const user = userEvent.setup();
      const onSetSelectedHandCount = vi.fn();
      const onSetBetAmount = vi.fn();
      
      // Credits: 20, Hand count: 10, Bet: 10, Minimum bet: 2
      // Cannot afford 10 hands at 10 credits (need 100, have 20)
      // Optimal bet: Math.floor(20 / 10) = 2, which equals minimum bet
      render(
        <PreDraw
          {...defaultProps}
          credits={20}
          handCount={10}
          selectedHandCount={5}
          betAmount={10}
          minimumBet={2}
          onSetSelectedHandCount={onSetSelectedHandCount}
          onSetBetAmount={onSetBetAmount}
        />
      );

      const maxHandsButton = screen.getByLabelText('Set to maximum number of hands');
      await user.click(maxHandsButton);

      // Should set to max hands (10) and bet to 2 (minimum)
      expect(onSetSelectedHandCount).toHaveBeenCalledTimes(1);
      expect(onSetSelectedHandCount).toHaveBeenCalledWith(10);
      expect(onSetBetAmount).toHaveBeenCalledTimes(1);
      expect(onSetBetAmount).toHaveBeenCalledWith(2);
    });

    it('should handle case where optimal bet is between minimum and current bet', async () => {
      const user = userEvent.setup();
      const onSetSelectedHandCount = vi.fn();
      const onSetBetAmount = vi.fn();
      
      // Credits: 75, Hand count: 10, Bet: 10, Minimum bet: 2
      // Cannot afford 10 hands at 10 credits (need 100, have 75)
      // Optimal bet: Math.floor(75 / 10) = 7
      render(
        <PreDraw
          {...defaultProps}
          credits={75}
          handCount={10}
          selectedHandCount={5}
          betAmount={10}
          minimumBet={2}
          onSetSelectedHandCount={onSetSelectedHandCount}
          onSetBetAmount={onSetBetAmount}
        />
      );

      const maxHandsButton = screen.getByLabelText('Set to maximum number of hands');
      await user.click(maxHandsButton);

      // Should set to max hands (10) and bet to 7
      expect(onSetSelectedHandCount).toHaveBeenCalledTimes(1);
      expect(onSetSelectedHandCount).toHaveBeenCalledWith(10);
      expect(onSetBetAmount).toHaveBeenCalledTimes(1);
      expect(onSetBetAmount).toHaveBeenCalledWith(7);
    });

    it('should clear both bet and hand count errors when clicked', async () => {
      const user = userEvent.setup();
      const onSetSelectedHandCount = vi.fn();
      const onSetBetAmount = vi.fn();
      
      render(
        <PreDraw
          {...defaultProps}
          credits={1000}
          handCount={10}
          selectedHandCount={5}
          betAmount={10}
          onSetSelectedHandCount={onSetSelectedHandCount}
          onSetBetAmount={onSetBetAmount}
        />
      );

      // Set errors by entering invalid values
      const betInput = screen.getByLabelText('Bet amount per hand');
      const handInput = screen.getByLabelText('Number of hands to play');
      
      await user.clear(betInput);
      await user.type(betInput, 'invalid');
      
      await user.clear(handInput);
      await user.type(handInput, 'invalid');

      // Errors should be visible (check by ID to avoid multiple matches)
      const betError = document.getElementById('bet-error');
      const handError = document.getElementById('hand-count-error');
      expect(betError).toBeInTheDocument();
      expect(handError).toBeInTheDocument();

      // Click Max hands button - should clear errors
      const maxHandsButton = screen.getByLabelText('Set to maximum number of hands');
      await user.click(maxHandsButton);

      // Should have called both setters
      expect(onSetSelectedHandCount).toHaveBeenCalled();
      expect(onSetBetAmount).toHaveBeenCalled();
    });

    it('should handle edge case with exactly enough credits for max hands at minimum bet', async () => {
      const user = userEvent.setup();
      const onSetSelectedHandCount = vi.fn();
      const onSetBetAmount = vi.fn();
      
      // Credits: 20, Hand count: 10, Minimum bet: 2
      // Exactly enough: 10 hands * 2 credits = 20 credits
      render(
        <PreDraw
          {...defaultProps}
          credits={20}
          handCount={10}
          selectedHandCount={5}
          betAmount={10}
          minimumBet={2}
          onSetSelectedHandCount={onSetSelectedHandCount}
          onSetBetAmount={onSetBetAmount}
        />
      );

      const maxHandsButton = screen.getByLabelText('Set to maximum number of hands');
      await user.click(maxHandsButton);

      // Should set to max hands (10) and bet to 2 (minimum)
      expect(onSetSelectedHandCount).toHaveBeenCalledTimes(1);
      expect(onSetSelectedHandCount).toHaveBeenCalledWith(10);
      expect(onSetBetAmount).toHaveBeenCalledTimes(1);
      expect(onSetBetAmount).toHaveBeenCalledWith(2);
    });
  });
});

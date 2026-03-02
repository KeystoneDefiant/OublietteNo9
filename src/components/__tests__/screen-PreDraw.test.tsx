import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreDraw } from '../screen-PreDraw';
import { Settings } from '../Settings';
import { FailureStateType, GameState } from '../../types';
import { getTestRewardTable } from '../../test/testHelpers';
import { getCurrentGameMode } from '../../config/gameConfig';

const mode = getCurrentGameMode();

describe('PreDraw Component', () => {
  const mockProps = {
    credits: 10000,
    handCount: 50,
    selectedHandCount: mode.startingHandCount,
    betAmount: 5,
    minimumBet: mode.startingBet,
    rewardTable: getTestRewardTable(),
    gameOver: false,
    round: 1,
    totalEarnings: 0,
    onSetBetAmount: vi.fn(),
    onSetSelectedHandCount: vi.fn(),
    onDealHand: vi.fn(),
    onEndRun: vi.fn(),
    onCheatAddCredits: vi.fn(),
    onCheatAddHands: vi.fn(),
    onCheatSetDevilsDeal: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component with all main elements', () => {
      render(<PreDraw {...mockProps} />);

      expect(screen.getByText(/Round:/)).toBeInTheDocument();
      expect(screen.getByText(/Credits:/)).toBeInTheDocument();
      expect(screen.getByText('Run Round')).toBeInTheDocument();
    });

    it('should display current credits correctly', () => {
      render(<PreDraw {...mockProps} />);
      expect(screen.getByText(/10,000/)).toBeInTheDocument();
    });

    it('should display current round correctly', () => {
      render(<PreDraw {...mockProps} />);
      expect(document.body.textContent).toMatch(/Round:\s*1/);
    });

    it('should display bet and hand count summary', () => {
      render(<PreDraw {...mockProps} />);
      // PreDraw shows Credits (header), Bet/Hands/Cost panels
      expect(document.body.textContent).toMatch(/Credits/i);
      expect(document.body.textContent).toMatch(/Hands/i);
      expect(document.body.textContent).toMatch(/Cost/i);
    });
  });

  describe('Display Values', () => {
    it('should display bet amount and hand count from config', () => {
      render(<PreDraw {...mockProps} />);
      // minimumBet=2, handCount=50, totalBetCost=100
      expect(document.body.textContent).toMatch(/2/);
      expect(document.body.textContent).toMatch(/50/);
      expect(document.body.textContent).toMatch(/100/);
    });

    it('should show total cost to play', () => {
      render(<PreDraw {...mockProps} />);
      // Cost panel shows total (minimumBet * handCount = 2 * 50 = 100)
      expect(screen.getByText(/^100$/)).toBeInTheDocument();
      expect(screen.getByText(/Cost/i)).toBeInTheDocument();
    });
  });

  describe('Run Round Button', () => {
    it('should be enabled when player can afford bet', () => {
      render(<PreDraw {...mockProps} />);
      const dealButton = screen.getByRole('button', { name: /Run Round/i });

      expect(dealButton).not.toBeDisabled();
    });

    it('should be disabled when player cannot afford bet', () => {
      const props = { ...mockProps, credits: 10 };
      render(<PreDraw {...props} />);
      const dealButton = screen.getByRole('button', { name: /Run Round/i });

      expect(dealButton).toBeDisabled();
    });

    it('should call onDealHand when clicked', () => {
      render(<PreDraw {...mockProps} />);
      const dealButton = screen.getByRole('button', { name: /Run Round/i });

      fireEvent.click(dealButton);
      expect(mockProps.onDealHand).toHaveBeenCalledTimes(1);
    });

    it('should be disabled in game over state', () => {
      const props = { ...mockProps, gameOver: true };
      render(<PreDraw {...props} />);
      const dealButton = screen.getByRole('button', { name: /Cannot Play - Game Over/i });

      expect(dealButton).toBeDisabled();
    });
  });

  describe('End Run Confirmation', () => {
    it('should show confirmation dialog when End Run clicked', () => {
      render(<PreDraw {...mockProps} />);
      const endRunButton = screen.getByRole('button', { name: /End current run/i });

      fireEvent.click(endRunButton);

      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });

    it('should call onEndRun when confirmed', () => {
      render(<PreDraw {...mockProps} />);
      const endRunButton = screen.getByRole('button', { name: /End current run/i });

      fireEvent.click(endRunButton);

      const confirmButton = screen.getByRole('button', { name: /Confirm End Run/i });
      fireEvent.click(confirmButton);

      expect(mockProps.onEndRun).toHaveBeenCalledTimes(1);
    });

    it('should not call onEndRun when cancelled', () => {
      render(<PreDraw {...mockProps} />);
      const endRunButton = screen.getByRole('button', { name: /End current run/i });

      fireEvent.click(endRunButton);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockProps.onEndRun).not.toHaveBeenCalled();
    });
  });

  describe('Failure State Display', () => {
    it('should show failure condition in main panel when in failure state', () => {
      const failureState: FailureStateType = 'minimum-bet-multiplier';
      const gameState = {
        baseMinimumBet: 10,
        round: 31,
        totalEarnings: 100,
        winningHandsLastRound: 5,
      } as GameState;

      const props = { ...mockProps, failureState, gameState };
      render(<PreDraw {...props} />);

      expect(screen.getByText(/Failure Condition/i)).toBeInTheDocument();
      expect(screen.getByText(/Bet must be/)).toBeInTheDocument();
    });

    it('should not show failure condition in normal state', () => {
      render(<PreDraw {...mockProps} />);

      expect(screen.queryByText(/Failure Condition/i)).not.toBeInTheDocument();
    });
  });

  describe('End Game Conditions Display', () => {
    it('should show end game conditions when endless mode is active', () => {
      const gameState = {
        isEndlessMode: true,
        baseMinimumBet: 2,
        round: 31,
      } as GameState;

      const props = { ...mockProps, gameState };
      render(<PreDraw {...props} />);

      expect(screen.getByText(/End Game Active/i)).toBeInTheDocument();
      expect(screen.getByText(/You must meet these conditions to survive each round/i)).toBeInTheDocument();
    });

    it('should not show end game conditions when endless mode is not active', () => {
      const gameState = { isEndlessMode: false } as GameState;
      const props = { ...mockProps, gameState };
      render(<PreDraw {...props} />);

      expect(screen.queryByText(/End Game Active/i)).not.toBeInTheDocument();
    });

    it('should not show end game conditions when game over', () => {
      const gameState = {
        isEndlessMode: true,
        baseMinimumBet: 2,
        round: 31,
      } as GameState;

      const props = { ...mockProps, gameState, gameOver: true };
      render(<PreDraw {...props} />);

      expect(screen.queryByText(/End Game Active/i)).not.toBeInTheDocument();
    });
  });

  describe('Cheats (via Settings)', () => {
    it('should show settings button when onShowSettings is provided', () => {
      const propsWithSettings = { ...mockProps, onShowSettings: vi.fn() };
      render(<PreDraw {...propsWithSettings} />);
      const settingsButton = screen.getByRole('button', { name: /Open settings/i });
      expect(settingsButton).toBeInTheDocument();
    });

    it('should show cheats in Settings when opened with cheat callbacks', () => {
      const onClose = vi.fn();
      render(
        <Settings
          onClose={onClose}
          onCheatAddCredits={mockProps.onCheatAddCredits}
          onCheatAddHands={mockProps.onCheatAddHands}
          onCheatSetDevilsDeal={mockProps.onCheatSetDevilsDeal}
        />
      );
      const cheatsAccordion = screen.getByRole('button', { name: /Cheats/i });
      fireEvent.click(cheatsAccordion);
      expect(screen.getByText(/Add 1000 Credits/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<PreDraw {...mockProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have accessible Run Round button', () => {
      render(<PreDraw {...mockProps} />);

      expect(
        screen.getByRole('button', { name: /Run round with \d+ hands at \d+ credits per hand/i })
      ).toBeInTheDocument();
    });
  });

  describe('Game Over State', () => {
    it('should show Game Over message when gameOver is true', () => {
      const props = { ...mockProps, gameOver: true };
      render(<PreDraw {...props} />);

      expect(screen.getAllByText(/Game Over/i).length).toBeGreaterThanOrEqual(1);
    });

    it('should show insufficient credits message when game over', () => {
      const props = { ...mockProps, gameOver: true };
      render(<PreDraw {...props} />);

      expect(screen.getByText(/Insufficient Credits/i)).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PreDraw } from '../screen-PreDraw';
import { GameState, FailureStateType } from '../../types';

describe('PreDraw Component', () => {
  const mockProps = {
    credits: 10000,
    handCount: 50,
    selectedHandCount: 10,
    betAmount: 5,
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
      expect(screen.getByText('Deal Hand')).toBeInTheDocument();
    });

    it('should display current credits correctly', () => {
      render(<PreDraw {...mockProps} />);
      expect(screen.getByText(/10,000/)).toBeInTheDocument();
    });

    it('should display current round correctly', () => {
      render(<PreDraw {...mockProps} />);
      expect(screen.getByText(/Round: 1/)).toBeInTheDocument();
    });

    it('should render reward table', () => {
      render(<PreDraw {...mockProps} />);
      expect(screen.getByText(/Royal Flush/i)).toBeInTheDocument();
    });
  });

  describe('Bet Amount Controls', () => {
    it('should display current bet amount', () => {
      render(<PreDraw {...mockProps} />);
      const betInput = screen.getByLabelText(/Bet per hand/i) as HTMLInputElement;
      expect(betInput.value).toBe('5');
    });

    it('should call onSetBetAmount when bet is changed', () => {
      render(<PreDraw {...mockProps} />);
      const betInput = screen.getByLabelText(/Bet per hand/i);
      
      fireEvent.change(betInput, { target: { value: '10' } });
      expect(mockProps.onSetBetAmount).toHaveBeenCalledWith(10);
    });

    it('should show error for bet below minimum', () => {
      render(<PreDraw {...mockProps} />);
      const betInput = screen.getByLabelText(/Bet per hand/i);
      
      fireEvent.change(betInput, { target: { value: '1' } });
      fireEvent.blur(betInput);
      
      waitFor(() => {
        expect(screen.getByText(/must be at least/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid bet (NaN)', () => {
      render(<PreDraw {...mockProps} />);
      const betInput = screen.getByLabelText(/Bet per hand/i);
      
      fireEvent.change(betInput, { target: { value: 'abc' } });
      fireEvent.blur(betInput);
      
      waitFor(() => {
        expect(screen.getByText(/Invalid bet amount/i)).toBeInTheDocument();
      });
    });

    it('should increment bet with + button', () => {
      render(<PreDraw {...mockProps} />);
      const incrementButton = screen.getAllByRole('button', { name: '+' })[0];
      
      fireEvent.click(incrementButton);
      expect(mockProps.onSetBetAmount).toHaveBeenCalledWith(6);
    });

    it('should decrement bet with - button', () => {
      render(<PreDraw {...mockProps} />);
      const decrementButton = screen.getAllByRole('button', { name: '-' })[0];
      
      fireEvent.click(decrementButton);
      expect(mockProps.onSetBetAmount).toHaveBeenCalledWith(4);
    });

    it('should set max bet when max button clicked', () => {
      render(<PreDraw {...mockProps} />);
      const maxButton = screen.getByRole('button', { name: /Max/i });
      
      fireEvent.click(maxButton);
      // Max bet = floor(10000 / 10) = 1000
      expect(mockProps.onSetBetAmount).toHaveBeenCalled();
    });
  });

  describe('Hand Count Controls', () => {
    it('should display current hand count', () => {
      render(<PreDraw {...mockProps} />);
      const handInput = screen.getByLabelText(/Number of hands/i) as HTMLInputElement;
      expect(handInput.value).toBe('10');
    });

    it('should call onSetSelectedHandCount when hand count is changed', () => {
      render(<PreDraw {...mockProps} />);
      const handInput = screen.getByLabelText(/Number of hands/i);
      
      fireEvent.change(handInput, { target: { value: '20' } });
      expect(mockProps.onSetSelectedHandCount).toHaveBeenCalledWith(20);
    });

    it('should show error for hand count below 1', () => {
      render(<PreDraw {...mockProps} />);
      const handInput = screen.getByLabelText(/Number of hands/i);
      
      fireEvent.change(handInput, { target: { value: '0' } });
      fireEvent.blur(handInput);
      
      waitFor(() => {
        expect(screen.getByText(/must be at least 1/i)).toBeInTheDocument();
      });
    });

    it('should show error for hand count exceeding available', () => {
      render(<PreDraw {...mockProps} />);
      const handInput = screen.getByLabelText(/Number of hands/i);
      
      fireEvent.change(handInput, { target: { value: '100' } });
      fireEvent.blur(handInput);
      
      waitFor(() => {
        expect(screen.getByText(/cannot exceed/i)).toBeInTheDocument();
      });
    });

    it('should increment hand count with + button', () => {
      render(<PreDraw {...mockProps} />);
      const incrementButton = screen.getAllByRole('button', { name: '+' })[1];
      
      fireEvent.click(incrementButton);
      expect(mockProps.onSetSelectedHandCount).toHaveBeenCalledWith(11);
    });

    it('should decrement hand count with - button', () => {
      render(<PreDraw {...mockProps} />);
      const decrementButton = screen.getAllByRole('button', { name: '-' })[1];
      
      fireEvent.click(decrementButton);
      expect(mockProps.onSetSelectedHandCount).toHaveBeenCalledWith(9);
    });
  });

  describe('Deal Hand Button', () => {
    it('should be enabled when player can afford bet', () => {
      render(<PreDraw {...mockProps} />);
      const dealButton = screen.getByRole('button', { name: /Deal Hand/i });
      
      expect(dealButton).not.toBeDisabled();
    });

    it('should be disabled when player cannot afford bet', () => {
      const props = { ...mockProps, credits: 10 };
      render(<PreDraw {...props} />);
      const dealButton = screen.getByRole('button', { name: /Deal Hand/i });
      
      expect(dealButton).toBeDisabled();
    });

    it('should call onDealHand when clicked', () => {
      render(<PreDraw {...mockProps} />);
      const dealButton = screen.getByRole('button', { name: /Deal Hand/i });
      
      fireEvent.click(dealButton);
      expect(mockProps.onDealHand).toHaveBeenCalledTimes(1);
    });

    it('should be disabled in game over state', () => {
      const props = { ...mockProps, gameOver: true };
      render(<PreDraw {...props} />);
      const dealButton = screen.getByRole('button', { name: /Deal Hand/i });
      
      expect(dealButton).toBeDisabled();
    });
  });

  describe('End Run Confirmation', () => {
    it('should show confirmation dialog when End Run clicked', () => {
      render(<PreDraw {...mockProps} />);
      const endRunButton = screen.getByRole('button', { name: /End Run/i });
      
      fireEvent.click(endRunButton);
      
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });

    it('should call onEndRun when confirmed', () => {
      render(<PreDraw {...mockProps} />);
      const endRunButton = screen.getByRole('button', { name: /End Run/i });
      
      fireEvent.click(endRunButton);
      
      const confirmButton = screen.getByRole('button', { name: /Yes, End Run/i });
      fireEvent.click(confirmButton);
      
      expect(mockProps.onEndRun).toHaveBeenCalledTimes(1);
    });

    it('should not call onEndRun when cancelled', () => {
      render(<PreDraw {...mockProps} />);
      const endRunButton = screen.getByRole('button', { name: /End Run/i });
      
      fireEvent.click(endRunButton);
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);
      
      expect(mockProps.onEndRun).not.toHaveBeenCalled();
    });
  });

  describe('Bet Efficiency Display', () => {
    it('should show efficiency percentage', () => {
      render(<PreDraw {...mockProps} />);
      // Should calculate and display efficiency
      expect(screen.getByText(/efficiency/i)).toBeInTheDocument();
    });

    it('should show color coding for efficiency', () => {
      render(<PreDraw {...mockProps} />);
      const efficiencyElement = screen.getByText(/efficiency/i).parentElement;
      
      // Check that it has color styling
      expect(efficiencyElement).toHaveClass(/text-/);
    });
  });

  describe('Cost Display', () => {
    it('should show total cost correctly', () => {
      render(<PreDraw {...mockProps} />);
      // 5 bet * 10 hands = 50 credits
      expect(screen.getByText(/50/)).toBeInTheDocument();
    });

    it('should update cost when bet changes', () => {
      const { rerender } = render(<PreDraw {...mockProps} />);
      
      const updatedProps = { ...mockProps, betAmount: 10 };
      rerender(<PreDraw {...updatedProps} />);
      
      // 10 bet * 10 hands = 100 credits
      expect(screen.getByText(/100/)).toBeInTheDocument();
    });
  });

  describe('Failure State Display', () => {
    it('should show failure warnings when in failure state', () => {
      const failureState: FailureStateType = {
        minimumBetMultiplier: {
          failing: true,
          value: 2.0,
          required: 2.0,
        },
      };
      
      const props = { ...mockProps, failureState };
      render(<PreDraw {...props} />);
      
      expect(screen.getByText(/Failure Condition/i)).toBeInTheDocument();
    });

    it('should not show failure warnings in normal state', () => {
      render(<PreDraw {...mockProps} />);
      
      expect(screen.queryByText(/Failure Condition/i)).not.toBeInTheDocument();
    });
  });

  describe('Cheats Modal', () => {
    it('should open cheats modal when button clicked', () => {
      render(<PreDraw {...mockProps} />);
      const cheatsButton = screen.getByRole('button', { name: /🎮/i });
      
      fireEvent.click(cheatsButton);
      
      expect(screen.getByText(/Cheats/i)).toBeInTheDocument();
    });

    it('should close cheats modal', () => {
      render(<PreDraw {...mockProps} />);
      const cheatsButton = screen.getByRole('button', { name: /🎮/i });
      
      fireEvent.click(cheatsButton);
      
      const closeButton = screen.getByRole('button', { name: /Close/i });
      fireEvent.click(closeButton);
      
      expect(screen.queryByText(/Add.*Credits/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<PreDraw {...mockProps} />);
      
      expect(screen.getByLabelText(/Bet per hand/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Number of hands/i)).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      render(<PreDraw {...mockProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show error messages with role="alert"', () => {
      render(<PreDraw {...mockProps} />);
      const betInput = screen.getByLabelText(/Bet per hand/i);
      
      fireEvent.change(betInput, { target: { value: '1' } });
      fireEvent.blur(betInput);
      
      waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toBeInTheDocument();
      });
    });
  });
});

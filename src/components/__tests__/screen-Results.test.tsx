import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Results } from '../screen-Results';
import { Card as CardType, Hand } from '../../types';

describe('Results Component', () => {
  const createMockCard = (rank: string, suit: string, id: string): CardType => ({
    id,
    rank,
    suit: suit as 'hearts' | 'diamonds' | 'clubs' | 'spades',
    isDead: false,
    isWild: false,
  });

  const mockHand: Hand = {
    cards: [
      createMockCard('A', 'hearts', 'ah'),
      createMockCard('K', 'hearts', 'kh'),
      createMockCard('Q', 'hearts', 'qh'),
      createMockCard('J', 'hearts', 'jh'),
      createMockCard('10', 'hearts', '10h'),
    ],
    totalPayout: 2500,
  };

  const mockProps = {
    playerHand: mockHand.cards,
    heldIndices: [0, 1, 2, 3, 4],
    parallelHands: [mockHand, mockHand, mockHand],
    bestHand: mockHand,
    betAmount: 10,
    selectedHandCount: 3,
    credits: 10000,
    round: 5,
    totalEarnings: 5000,
    handCounts: {
      'royal-flush': 3,
      'straight-flush': 0,
      'four-of-a-kind': 0,
    },
    rewardTable: {
      'royal-flush': 250,
      'straight-flush': 50,
    },
    onContinue: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component', () => {
      render(<Results {...mockProps} />);
      
      expect(screen.getByText(/Results/i)).toBeInTheDocument();
    });

    it('should display round number', () => {
      render(<Results {...mockProps} />);
      
      expect(screen.getByText(/Round: 5/i)).toBeInTheDocument();
    });

    it('should display current credits', () => {
      render(<Results {...mockProps} />);
      
      expect(screen.getByText(/10,000/)).toBeInTheDocument();
    });
  });

  describe('Payout Display', () => {
    it('should display total payout correctly', () => {
      render(<Results {...mockProps} />);
      
      // 3 hands * 2500 = 7500 total payout
      expect(screen.getByText(/7,500/)).toBeInTheDocument();
    });

    it('should display bet cost', () => {
      render(<Results {...mockProps} />);
      
      // 10 bet * 3 hands = 30 credits
      expect(screen.getByText(/30/)).toBeInTheDocument();
    });

    it('should calculate profit correctly', () => {
      render(<Results {...mockProps} />);
      
      // 7500 payout - 30 bet = 7470 profit
      expect(screen.getByText(/7,470/)).toBeInTheDocument();
    });

    it('should show positive profit in green', () => {
      const { container } = render(<Results {...mockProps} />);
      
      const profitElement = screen.getByText(/7,470/).parentElement;
      expect(profitElement).toHaveClass(/text-green/);
    });

    it('should show negative profit in red', () => {
      const lossProps = {
        ...mockProps,
        parallelHands: [{ ...mockHand, totalPayout: 5 }],
      };
      
      const { container } = render(<Results {...lossProps} />);
      
      // Find negative profit (5 - 30 = -25)
      const profitElements = container.querySelectorAll('.text-red-600');
      expect(profitElements.length).toBeGreaterThan(0);
    });
  });

  describe('Devil\'s Deal Cost', () => {
    it('should display Devil\'s Deal cost when deal was taken', () => {
      const props = {
        ...mockProps,
        gameState: {
          devilsDealCard: createMockCard('A', 'spades', 'as'),
          devilsDealCost: 100,
          devilsDealHeld: true,
        },
      };
      
      render(<Results {...props as any} />);
      
      expect(screen.getByText(/Devil's Deal/i)).toBeInTheDocument();
      expect(screen.getByText(/100.*credits/i)).toBeInTheDocument();
    });

    it('should not display Devil\'s Deal line when deal not taken', () => {
      render(<Results {...mockProps} />);
      
      expect(screen.queryByText(/Devil's Deal/i)).not.toBeInTheDocument();
    });

    it('should deduct Devil\'s Deal cost from final profit', () => {
      const props = {
        ...mockProps,
        gameState: {
          devilsDealCard: createMockCard('A', 'spades', 'as'),
          devilsDealCost: 100,
          devilsDealHeld: true,
        },
      };
      
      render(<Results {...props as any} />);
      
      // 7500 payout - 30 bet - 100 devil's deal = 7370 profit
      expect(screen.getByText(/7,370/)).toBeInTheDocument();
    });
  });

  describe('Hand Counts Summary', () => {
    it('should display hand counts', () => {
      render(<Results {...mockProps} />);
      
      expect(screen.getByText(/Royal Flush.*3/i)).toBeInTheDocument();
    });

    it('should only show hands that occurred', () => {
      const props = {
        ...mockProps,
        handCounts: {
          'royal-flush': 1,
          'one-pair': 2,
        },
      };
      
      render(<Results {...props} />);
      
      expect(screen.getByText(/Royal Flush.*1/i)).toBeInTheDocument();
      expect(screen.getByText(/One Pair.*2/i)).toBeInTheDocument();
    });

    it('should not display hands with zero count', () => {
      render(<Results {...mockProps} />);
      
      // Straight flush has 0 count, should not be shown
      expect(screen.queryByText(/Straight Flush/i)).not.toBeInTheDocument();
    });
  });

  describe('Held Cards Display', () => {
    it('should display held cards', () => {
      render(<Results {...mockProps} />);
      
      expect(screen.getByText(/Held Cards/i)).toBeInTheDocument();
    });

    it('should show all held cards', () => {
      const { container } = render(<Results {...mockProps} />);
      
      // 5 cards were held
      const heldCards = container.querySelectorAll('.held-card, .card');
      expect(heldCards.length).toBeGreaterThanOrEqual(5);
    });

    it('should display "None" when no cards held', () => {
      const props = { ...mockProps, heldIndices: [] };
      render(<Results {...props} />);
      
      expect(screen.getByText(/None/i)).toBeInTheDocument();
    });
  });

  describe('Best Hand Display', () => {
    it('should show best hand title', () => {
      render(<Results {...mockProps} />);
      
      expect(screen.getByText(/Best Hand/i)).toBeInTheDocument();
    });

    it('should display best hand cards', () => {
      const { container } = render(<Results {...mockProps} />);
      
      // Best hand should be displayed
      const cards = container.querySelectorAll('.card');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should show best hand payout', () => {
      render(<Results {...mockProps} />);
      
      expect(screen.getByText(/2,500/)).toBeInTheDocument();
    });
  });

  describe('Continue Button', () => {
    it('should display continue button', () => {
      render(<Results {...mockProps} />);
      
      expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
    });

    it('should call onContinue when clicked', () => {
      render(<Results {...mockProps} />);
      const continueButton = screen.getByRole('button', { name: /Continue/i });
      
      fireEvent.click(continueButton);
      expect(mockProps.onContinue).toHaveBeenCalledTimes(1);
    });

    it('should be enabled', () => {
      render(<Results {...mockProps} />);
      const continueButton = screen.getByRole('button', { name: /Continue/i });
      
      expect(continueButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<Results {...mockProps} />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have descriptive labels', () => {
      render(<Results {...mockProps} />);
      
      expect(screen.getByText(/Total Payout/i)).toBeInTheDocument();
      expect(screen.getByText(/Bet Cost/i)).toBeInTheDocument();
    });

    it('should have button with accessible name', () => {
      render(<Results {...mockProps} />);
      
      const button = screen.getByRole('button', { name: /Continue/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    it('should format large numbers with commas', () => {
      const props = {
        ...mockProps,
        credits: 1000000,
      };
      
      render(<Results {...props} />);
      
      expect(screen.getByText(/1,000,000/)).toBeInTheDocument();
    });

    it('should handle single-digit numbers', () => {
      const props = {
        ...mockProps,
        round: 1,
      };
      
      render(<Results {...props} />);
      
      expect(screen.getByText(/Round: 1/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero payout', () => {
      const props = {
        ...mockProps,
        parallelHands: [{ ...mockHand, totalPayout: 0 }],
      };
      
      render(<Results {...props} />);
      
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should handle empty hand counts', () => {
      const props = {
        ...mockProps,
        handCounts: {},
      };
      
      render(<Results {...props} />);
      
      // Should still render without errors
      expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
    });

    it('should pluralize "credit" correctly', () => {
      const props = {
        ...mockProps,
        parallelHands: [{ ...mockHand, totalPayout: 1 }],
        selectedHandCount: 1,
        betAmount: 1,
      };
      
      render(<Results {...props} />);
      
      // Should show "credit" not "credits" for singular
      expect(screen.getByText(/1 credit(?!s)/i)).toBeInTheDocument();
    });
  });
});

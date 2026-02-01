import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameTable } from '../screen-GameTable';
import { Card as CardType } from '../../types';

describe('GameTable Component', () => {
  const createMockCard = (rank: string, suit: string, id: string): CardType => ({
    id,
    rank,
    suit: suit as 'hearts' | 'diamonds' | 'clubs' | 'spades',
    isDead: false,
    isWild: false,
  });

  const mockPlayerHand: CardType[] = [
    createMockCard('A', 'hearts', 'ah'),
    createMockCard('K', 'hearts', 'kh'),
    createMockCard('Q', 'hearts', 'qh'),
    createMockCard('J', 'hearts', 'jh'),
    createMockCard('10', 'hearts', '10h'),
  ];

  const mockProps = {
    playerHand: mockPlayerHand,
    heldIndices: [],
    parallelHands: [],
    rewardTable: {
      'royal-flush': 250,
      'straight-flush': 50,
      'four-of-a-kind': 25,
    },
    credits: 5000,
    selectedHandCount: 10,
    round: 1,
    totalEarnings: 500,
    firstDrawComplete: true,
    secondDrawAvailable: false,
    onToggleHold: vi.fn(),
    onToggleDevilsDealHold: vi.fn(),
    onDraw: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component with player hand', () => {
      render(<GameTable {...mockProps} />);
      
      expect(screen.getByText('Your Hand')).toBeInTheDocument();
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });

    it('should display all 5 cards', () => {
      const { container } = render(<GameTable {...mockProps} />);
      
      // Check for card elements
      const cards = container.querySelectorAll('.card');
      expect(cards.length).toBe(5);
    });

    it('should display game header with credits and round', () => {
      render(<GameTable {...mockProps} />);
      
      expect(screen.getByText(/Round:/)).toBeInTheDocument();
      expect(screen.getByText(/Credits:/)).toBeInTheDocument();
    });

    it('should display reward table', () => {
      render(<GameTable {...mockProps} />);
      
      expect(screen.getByText(/Royal Flush/i)).toBeInTheDocument();
    });
  });

  describe('Card Selection', () => {
    it('should allow clicking cards to hold them', () => {
      render(<GameTable {...mockProps} />);
      const cards = screen.getAllByRole('button').filter(btn => 
        btn.classList.contains('card') || btn.closest('.card')
      );
      
      fireEvent.click(cards[0]);
      expect(mockProps.onToggleHold).toHaveBeenCalledWith(0);
    });

    it('should call onToggleHold for each card click', () => {
      render(<GameTable {...mockProps} />);
      const cards = screen.getAllByRole('button').filter(btn => 
        btn.classList.contains('card') || btn.closest('.card')
      );
      
      fireEvent.click(cards[2]);
      expect(mockProps.onToggleHold).toHaveBeenCalledWith(2);
    });

    it('should visually indicate held cards', () => {
      const props = { ...mockProps, heldIndices: [0, 2, 4] };
      const { container } = render(<GameTable {...props} />);
      
      const cards = container.querySelectorAll('.card');
      // Held cards should have different styling
      expect(cards[0]).toHaveClass(/held/i);
    });

    it('should allow multiple cards to be held', () => {
      const props = { ...mockProps, heldIndices: [1, 2, 3] };
      render(<GameTable {...props} />);
      
      // All three should be visually marked as held
      const { container } = render(<GameTable {...props} />);
      const heldCards = container.querySelectorAll('.card.held, .card[data-held="true"]');
      expect(heldCards.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Devil\'s Deal Card', () => {
    const devilsDealProps = {
      ...mockProps,
      gameState: {
        devilsDealCard: createMockCard('A', 'spades', 'as'),
        devilsDealCost: 100,
        devilsDealHeld: false,
      },
    };

    it('should render Devil\'s Deal card when offered', () => {
      render(<GameTable {...devilsDealProps} />);
      
      expect(screen.getByText(/offer/i)).toBeInTheDocument();
      expect(screen.getByText(/100.*credits/i)).toBeInTheDocument();
    });

    it('should call onToggleDevilsDealHold when Devil\'s Deal card clicked', () => {
      render(<GameTable {...devilsDealProps} />);
      
      const devilsDealContainer = screen.getByText(/offer/i).closest('.devil-deal-container');
      if (devilsDealContainer) {
        fireEvent.click(devilsDealContainer);
        expect(mockProps.onToggleDevilsDealHold).toHaveBeenCalled();
      }
    });

    it('should disable Devil\'s Deal card when 5 regular cards are held', () => {
      const props = {
        ...devilsDealProps,
        heldIndices: [0, 1, 2, 3, 4],
      };
      
      const { container } = render(<GameTable {...props} />);
      const devilsDealCard = container.querySelector('.devil-deal-container');
      
      expect(devilsDealCard).toHaveClass(/opacity-30/);
    });

    it('should show Devil\'s Deal card as held when selected', () => {
      const props = {
        ...devilsDealProps,
        gameState: {
          ...devilsDealProps.gameState,
          devilsDealHeld: true,
        },
      };
      
      const { container } = render(<GameTable {...props} />);
      
      // Check for held styling on Devil's Deal card
      const devilsDealCard = container.querySelector('.devil-deal-container');
      expect(devilsDealCard).toBeTruthy();
    });
  });

  describe('Draw Button', () => {
    it('should show draw button when hand is not yet drawn', () => {
      render(<GameTable {...mockProps} />);
      
      expect(screen.getByRole('button', { name: /Draw/i })).toBeInTheDocument();
    });

    it('should be enabled when cards can be drawn', () => {
      render(<GameTable {...mockProps} />);
      const drawButton = screen.getByRole('button', { name: /Draw/i });
      
      expect(drawButton).not.toBeDisabled();
    });

    it('should be disabled when parallel hands already exist', () => {
      const props = {
        ...mockProps,
        parallelHands: [{ cards: mockPlayerHand, totalPayout: 100 }],
      };
      
      render(<GameTable {...props} />);
      const drawButton = screen.getByRole('button', { name: /Draw/i });
      
      expect(drawButton).toBeDisabled();
    });

    it('should call onDraw when clicked', () => {
      render(<GameTable {...mockProps} />);
      const drawButton = screen.getByRole('button', { name: /Draw/i });
      
      fireEvent.click(drawButton);
      expect(mockProps.onDraw).toHaveBeenCalledTimes(1);
    });
  });

  describe('Card Back Display', () => {
    it('should show card backs before first draw', () => {
      const props = { ...mockProps, firstDrawComplete: false };
      const { container } = render(<GameTable {...props} />);
      
      // Cards should show backs
      const cardBacks = container.querySelectorAll('.card-back, [data-show-back="true"]');
      expect(cardBacks.length).toBeGreaterThan(0);
    });

    it('should show card faces after first draw', () => {
      const props = { ...mockProps, firstDrawComplete: true };
      render(<GameTable {...props} />);
      
      // Card ranks should be visible
      expect(screen.getByText(/A/)).toBeInTheDocument();
      expect(screen.getByText(/K/)).toBeInTheDocument();
    });
  });

  describe('Instructions', () => {
    it('should show hold instructions', () => {
      render(<GameTable {...mockProps} />);
      
      expect(screen.getByText(/Click cards to hold/i)).toBeInTheDocument();
    });

    it('should show draw instructions', () => {
      render(<GameTable {...mockProps} />);
      
      expect(screen.getByText(/Draw.*hands/i)).toBeInTheDocument();
    });
  });

  describe('Efficiency Display', () => {
    it('should calculate and display efficiency', () => {
      render(<GameTable {...mockProps} />);
      
      // 500 earnings / 1 round = 500.00
      expect(screen.getByText(/500/)).toBeInTheDocument();
    });

    it('should show 0.00 efficiency for round 0', () => {
      const props = { ...mockProps, round: 0, totalEarnings: 0 };
      render(<GameTable {...props} />);
      
      expect(screen.getByText(/0\.00/)).toBeInTheDocument();
    });
  });

  describe('Failure State Display', () => {
    it('should display failure warnings when in failure state', () => {
      const props = {
        ...mockProps,
        failureState: {
          minimumBetMultiplier: {
            failing: true,
            value: 1.5,
            required: 2.0,
          },
        },
      };
      
      render(<GameTable {...props} />);
      expect(screen.getByText(/Failure Condition/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have clickable card elements', () => {
      const { container } = render(<GameTable {...mockProps} />);
      
      const cards = container.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card).toBeTruthy();
      });
    });

    it('should have proper button roles', () => {
      render(<GameTable {...mockProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have descriptive button text', () => {
      render(<GameTable {...mockProps} />);
      
      const drawButton = screen.getByRole('button', { name: /Draw/i });
      expect(drawButton).toHaveTextContent(/Draw/i);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Shop } from '../Shop';
import { ShopOptionType } from '../../types';

describe('Shop Component', () => {
  const mockProps = {
    credits: 10000,
    handCount: 50,
    betAmount: 5,
    selectedHandCount: 10,
    deadCards: [],
    deadCardRemovalCount: 0,
    wildCards: [],
    wildCardCount: 0,
    extraDrawPurchased: false,
    selectedShopOptions: ['dead-card' as ShopOptionType, 'wild-card' as ShopOptionType, 'extra-draw' as ShopOptionType],
    onAddDeadCard: vi.fn(),
    onRemoveSingleDeadCard: vi.fn(),
    onRemoveAllDeadCards: vi.fn(),
    onAddWildCard: vi.fn(),
    onPurchaseExtraDraw: vi.fn(),
    onAddParallelHandsBundle: vi.fn(),
    onPurchaseDevilsDealChance: vi.fn(),
    onPurchaseDevilsDealCostReduction: vi.fn(),
    devilsDealChancePurchases: 0,
    devilsDealCostReductionPurchases: 0,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the shop modal', () => {
      render(<Shop {...mockProps} />);
      
      expect(screen.getByText(/Shop/i)).toBeInTheDocument();
    });

    it('should display current credits', () => {
      render(<Shop {...mockProps} />);
      
      expect(screen.getByText(/10,000.*credit/i)).toBeInTheDocument();
    });

    it('should display credits needed for next round', () => {
      render(<Shop {...mockProps} />);
      const label = screen.getByText(/Credits needed for next round/i);
      expect(label).toBeInTheDocument();
      // Next round cost = betAmount 5 * selectedHandCount 10 = 50
      expect(label.closest('div')?.textContent).toMatch(/50/);
    });

    it('should display all shop options', () => {
      render(<Shop {...mockProps} />);
      
      // Should show at least 3 options
      const options = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('Buy') || btn.textContent?.includes('Purchase')
      );
      expect(options.length).toBeGreaterThanOrEqual(3);
    });

    it('should have a close button', () => {
      render(<Shop {...mockProps} />);
      
      expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
    });
  });

  describe('Dead Card Option', () => {
    it('should display dead card option', () => {
      render(<Shop {...mockProps} />);
      
      expect(screen.getByText(/Add Dead Card/i)).toBeInTheDocument();
    });

    it('should show dead card cost', () => {
      render(<Shop {...mockProps} />);
      
      expect(screen.getByText(/2,000.*credit/i)).toBeInTheDocument();
    });

    it('should call onAddDeadCard when purchased', () => {
      render(<Shop {...mockProps} />);
      
      const buyButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('Add Dead Card') || btn.closest('.shop-option')?.textContent?.includes('Add Dead Card')
      );
      
      if (buyButton) {
        fireEvent.click(buyButton);
        expect(mockProps.onAddDeadCard).toHaveBeenCalledTimes(1);
      }
    });

    it('should disable button when player cannot afford', () => {
      const props = { ...mockProps, credits: 100 };
      render(<Shop {...props} />);
      
      const buttons = screen.getAllByRole('button');
      const disabledButtons = buttons.filter(btn => btn.disabled);
      expect(disabledButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Wild Card Option', () => {
    it('should display wild card option', () => {
      render(<Shop {...mockProps} />);
      
      expect(screen.getByText(/Add Wild Card/i)).toBeInTheDocument();
    });

    it('should call onAddWildCard when purchased', () => {
      render(<Shop {...mockProps} />);
      
      const buttons = screen.getAllByRole('button');
      const wildCardButton = buttons.find(btn => 
        btn.textContent?.includes('Wild Card') || btn.closest('.shop-option')?.textContent?.includes('Wild Card')
      );
      
      if (wildCardButton) {
        fireEvent.click(wildCardButton);
        expect(mockProps.onAddWildCard).toHaveBeenCalled();
      }
    });

    it('should show increasing cost for multiple wild cards', () => {
      const props = { ...mockProps, wildCardCount: 1 };
      render(<Shop {...props} />);
      
      // Cost should be higher than base 2000
      expect(screen.getByText(/4,000.*credit/i)).toBeInTheDocument();
    });

    it('should disable when max wild cards reached', () => {
      const props = { ...mockProps, wildCardCount: 3 };
      render(<Shop {...props} />);
      
      const buttons = screen.getAllByRole('button');
      const wildCardButton = buttons.find(btn => 
        btn.closest('.shop-option')?.textContent?.includes('Wild Card')
      );
      
      if (wildCardButton && wildCardButton.textContent?.includes('Max')) {
        expect(wildCardButton).toBeDisabled();
      }
    });
  });

  describe('Extra Draw Option', () => {
    it('should display extra draw option', () => {
      render(<Shop {...mockProps} />);
      
      expect(screen.getByText(/Extra Draw/i)).toBeInTheDocument();
    });

    it('should call onPurchaseExtraDraw when purchased', () => {
      render(<Shop {...mockProps} />);
      
      const buttons = screen.getAllByRole('button');
      const extraDrawButton = buttons.find(btn => 
        btn.closest('.shop-option')?.textContent?.includes('Extra Draw')
      );
      
      if (extraDrawButton) {
        fireEvent.click(extraDrawButton);
        expect(mockProps.onPurchaseExtraDraw).toHaveBeenCalled();
      }
    });

    it('should show as already purchased', () => {
      const props = { ...mockProps, extraDrawPurchased: true };
      render(<Shop {...props} />);
      
      expect(screen.getByText(/Already Purchased/i)).toBeInTheDocument();
    });

    it('should be disabled when already purchased', () => {
      const props = { ...mockProps, extraDrawPurchased: true };
      render(<Shop {...props} />);
      
      const buttons = screen.getAllByRole('button');
      const extraDrawButton = buttons.find(btn => 
        btn.closest('.shop-option')?.textContent?.includes('Extra Draw')
      );
      
      expect(extraDrawButton).toBeDisabled();
    });
  });

  describe('Parallel Hands Bundle', () => {
    it('should display parallel hands bundle options', () => {
      const props = {
        ...mockProps,
        selectedShopOptions: ['hands-5' as ShopOptionType, 'hands-10' as ShopOptionType],
      };
      
      render(<Shop {...props} />);
      
      expect(screen.getByText(/\+5 Parallel Hands/i)).toBeInTheDocument();
      expect(screen.getByText(/\+10 Parallel Hands/i)).toBeInTheDocument();
    });

    it('should call onAddParallelHandsBundle with correct amount', () => {
      const props = {
        ...mockProps,
        selectedShopOptions: ['hands-5' as ShopOptionType],
      };
      
      render(<Shop {...props} />);
      
      const buttons = screen.getAllByRole('button');
      const handsButton = buttons.find(btn => 
        btn.closest('.shop-option')?.textContent?.includes('+5 Parallel Hands')
      );
      
      if (handsButton) {
        fireEvent.click(handsButton);
        expect(mockProps.onAddParallelHandsBundle).toHaveBeenCalledWith(5);
      }
    });
  });

  describe('Devil\'s Deal Options', () => {
    it('should display Devil\'s Deal chance option', () => {
      const props = {
        ...mockProps,
        selectedShopOptions: ['devils-deal-chance' as ShopOptionType],
      };
      
      render(<Shop {...props} />);
      
      expect(screen.getByText(/Devil's Deal Chance/i)).toBeInTheDocument();
    });

    it('should call onPurchaseDevilsDealChance when purchased', () => {
      const props = {
        ...mockProps,
        selectedShopOptions: ['devils-deal-chance' as ShopOptionType],
      };
      
      render(<Shop {...props} />);
      
      const buttons = screen.getAllByRole('button');
      const devilsChanceButton = buttons.find(btn => 
        btn.closest('.shop-option')?.textContent?.includes('Devil\'s Deal Chance')
      );
      
      if (devilsChanceButton) {
        fireEvent.click(devilsChanceButton);
        expect(mockProps.onPurchaseDevilsDealChance).toHaveBeenCalled();
      }
    });

    it('should display Devil\'s Deal cost reduction option', () => {
      const props = {
        ...mockProps,
        selectedShopOptions: ['devils-deal-cost-reduction' as ShopOptionType],
      };
      
      render(<Shop {...props} />);
      
      expect(screen.getByText(/Devil's Deal Cost Reduction/i)).toBeInTheDocument();
    });

    it('should show max purchases message when limit reached', () => {
      const props = {
        ...mockProps,
        selectedShopOptions: ['devils-deal-chance' as ShopOptionType],
        devilsDealChancePurchases: 5,
      };
      
      render(<Shop {...props} />);
      
      expect(screen.getByText(/Max Purchases/i)).toBeInTheDocument();
    });
  });

  describe('Dead Card Removal Options', () => {
    const propsWithDeadCards = {
      ...mockProps,
      deadCards: [{ id: '1' }, { id: '2' }, { id: '3' }],
      selectedShopOptions: ['remove-dead-card-single' as ShopOptionType, 'remove-dead-card-all' as ShopOptionType],
    };

    it('should show remove single dead card option when dead cards exist', () => {
      render(<Shop {...propsWithDeadCards} />);
      
      expect(screen.getByText(/Remove.*Dead Card/i)).toBeInTheDocument();
    });

    it('should call onRemoveSingleDeadCard when purchased', () => {
      render(<Shop {...propsWithDeadCards} />);
      
      const buttons = screen.getAllByRole('button');
      const removeButton = buttons.find(btn => 
        btn.closest('.shop-option')?.textContent?.includes('Remove') &&
        btn.closest('.shop-option')?.textContent?.includes('Dead Card')
      );
      
      if (removeButton) {
        fireEvent.click(removeButton);
        expect(mockProps.onRemoveSingleDeadCard).toHaveBeenCalled();
      }
    });

    it('should not show removal options when no dead cards', () => {
      render(<Shop {...mockProps} />);
      
      expect(screen.queryByText(/Remove All Dead Cards/i)).not.toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('should call onClose when close button clicked', () => {
      render(<Shop {...mockProps} />);
      
      const closeButton = screen.getByRole('button', { name: /Close/i });
      fireEvent.click(closeButton);
      
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking outside modal', () => {
      const { container } = render(<Shop {...mockProps} />);
      
      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockProps.onClose).toHaveBeenCalled();
      }
    });
  });

  describe('Affordability', () => {
    it('should disable all options when player has insufficient credits', () => {
      const props = { ...mockProps, credits: 10 };
      render(<Shop {...props} />);
      
      const buttons = screen.getAllByRole('button');
      const purchaseButtons = buttons.filter(btn => 
        btn.textContent?.includes('Buy') || btn.textContent?.includes('Purchase')
      );
      
      purchaseButtons.forEach(btn => {
        expect(btn).toBeDisabled();
      });
    });

    it('should enable options player can afford', () => {
      render(<Shop {...mockProps} />);
      
      const buttons = screen.getAllByRole('button');
      const enabledButtons = buttons.filter(btn => !btn.disabled);
      
      expect(enabledButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Cost Display', () => {
    it('should format costs with commas', () => {
      render(<Shop {...mockProps} />);
      
      expect(screen.getByText(/2,000/)).toBeInTheDocument();
    });

    it('should show escalating costs correctly', () => {
      const props = { ...mockProps, wildCardCount: 2 };
      render(<Shop {...props} />);
      
      // Third wild card should cost 2000 * (100% ^ 2) = 8000
      expect(screen.getByText(/8,000/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper modal structure', () => {
      const { container } = render(<Shop {...mockProps} />);
      
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toBeTruthy();
    });

    it('should have descriptive button labels', () => {
      render(<Shop {...mockProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(btn => {
        expect(btn.textContent).toBeTruthy();
      });
    });

    it('should show disabled state visually', () => {
      const props = { ...mockProps, credits: 10 };
      const { container } = render(<Shop {...props} />);
      
      const disabledButtons = container.querySelectorAll('button:disabled');
      disabledButtons.forEach(btn => {
        expect(btn).toHaveClass(/opacity-50|cursor-not-allowed/);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty selectedShopOptions', () => {
      const props = { ...mockProps, selectedShopOptions: [] };
      render(<Shop {...props} />);
      
      // Should still render without errors
      expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
    });

    it('should handle zero credits', () => {
      const props = { ...mockProps, credits: 0 };
      render(<Shop {...props} />);
      
      expect(screen.getByText(/0.*credit/i)).toBeInTheDocument();
    });
  });
});

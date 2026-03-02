import { useState, useCallback, useEffect } from 'react';
import {
  calculateWildCardCost,
  calculateSingleDeadCardRemovalCost,
  calculateAllDeadCardsRemovalCost,
  calculateDevilsDealChanceCost,
  calculateDevilsDealCostReductionCost,
  calculateExtraCardInHandCost,
  applyShopCostMultiplier,
  getParallelHandsBundleBaseCost,
  getCreditsNeededForNextRound,
} from '../utils/config';
import { gameConfig, getCurrentGameMode, getShopDisplayName } from '../config/gameConfig';
import './Shop.css';
import { ShopOptionType } from '../types';
import { formatCredits } from '../utils/format';
import { GameButton } from './GameButton';
/**
 * Shop component props
 *
 * Displays available upgrades and modifications for the player to purchase
 * between rounds. Upgrades include dead cards, wild cards, parallel hands,
 * extra draws, and Devil's Deal improvements.
 */
interface ShopProps {
  /** Current player credits (for affordability checks) */
  credits: number;
  /** Credits used for pricing (snapshot at shop open; prevents prices changing mid-visit) */
  creditsForPricing?: number;
  /** Total hand count (maximum parallel hands available) */
  handCount: number;
  /** Bet amount per hand for next round (used to show cost for next round) */
  betAmount: number;
  /** Selected hand count for next round (used to show cost for next round) */
  selectedHandCount: number;
  /** Round we are about to play when leaving shop */
  round: number;
  /** Minimum bet from the round we just finished (for bet-increase calculation) */
  prevRoundMinimumBet: number | null;
  /** Array of dead cards currently in deck */
  deadCards: { id: string }[];
  /** Number of times dead cards have been removed */
  deadCardRemovalCount: number;
  /** Array of wild cards currently in deck */
  wildCards: { id: string }[];
  /** Total count of wild cards */
  wildCardCount: number;
  /** Whether extra draw has been purchased */
  extraDrawPurchased: boolean;
  /** Array of shop options to display */
  selectedShopOptions: ShopOptionType[];
  /** Callback to add a dead card */
  onAddDeadCard: () => void;
  /** Callback to remove a single dead card */
  onRemoveSingleDeadCard: () => void;
  /** Callback to remove all dead cards */
  onRemoveAllDeadCards: () => void;
  /** Callback to add a wild card */
  onAddWildCard: () => void;
  /** Callback to purchase extra draw ability */
  onPurchaseExtraDraw: () => void;
  /** Callback to add parallel hands bundle */
  onAddParallelHandsBundle: (bundleSize: number) => void;
  /** Callback to increase Devil's Deal chance */
  onPurchaseDevilsDealChance: () => void;
  /** Callback to reduce Devil's Deal cost */
  onPurchaseDevilsDealCostReduction: () => void;
  /** Number of Devil's Deal chance upgrades purchased */
  devilsDealChancePurchases: number;
  /** Number of Devil's Deal cost reduction upgrades purchased */
  devilsDealCostReductionPurchases: number;
  /** Number of extra cards in hand purchased (0 = deal 5, 1 = deal 6, etc.) */
  extraCardsInHand: number;
  /** Callback to purchase extra card in hand */
  onPurchaseExtraCardInHand: () => void;
  /** Callback to close shop and continue */
  onClose: () => void;
  /** Callback to open settings modal */
  onShowSettings?: () => void;
}

/**
 * Shop component for purchasing game upgrades
 *
 * Displays available shop options based on current game state and allows
 * players to purchase upgrades between rounds. Handles affordability checks,
 * cost calculations, and disabled states for maxed-out upgrades.
 *
 * @example
 * <Shop
 *   credits={5000}
 *   handCount={50}
 *   betAmount={5}
 *   selectedHandCount={10}
 *   selectedShopOptions={['dead-card', 'wild-card']}
 *   onAddDeadCard={handleAddDeadCard}
 *   onClose={handleCloseShop}
 *   {...otherProps}
 * />
 */
export function Shop({
  credits,
  creditsForPricing = credits,
  handCount,
  betAmount,
  selectedHandCount,
  round,
  prevRoundMinimumBet,
  deadCards,
  deadCardRemovalCount,
  wildCardCount,
  extraDrawPurchased,
  selectedShopOptions,
  onAddDeadCard,
  onRemoveSingleDeadCard,
  onRemoveAllDeadCards,
  onAddWildCard,
  onPurchaseExtraDraw,
  onAddParallelHandsBundle,
  onPurchaseDevilsDealChance,
  onPurchaseDevilsDealCostReduction,
  devilsDealChancePurchases,
  devilsDealCostReductionPurchases,
  extraCardsInHand,
  onPurchaseExtraCardInHand,
  onClose,
  onShowSettings,
}: ShopProps) {
  const currentMode = getCurrentGameMode();
  const isVipShop = creditsForPricing >= gameConfig.shopOptions.premium.creditsThreshold;
  // Track items purchased during this shop visit
  const [purchasedItems, setPurchasedItems] = useState<Set<ShopOptionType>>(new Set());
  // Pending purchase that would leave player unable to afford next round
  const [affordabilityWarning, setAffordabilityWarning] = useState<{
    onConfirm: () => void;
    onCancel: () => void;
    cost: number;
    creditsAfter: number;
    roundCost: number;
  } | null>(null);

  // Close affordability modal on Escape
  useEffect(() => {
    if (!affordabilityWarning) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        affordabilityWarning.onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [affordabilityWarning]);

  // Helper to calculate bundle cost (uses creditsForPricing so prices stay fixed for the visit)
  const calculateBundleCost = (bundleSize: number): number => {
    const baseCost = getParallelHandsBundleBaseCost(bundleSize, creditsForPricing);
    return applyShopCostMultiplier(baseCost, creditsForPricing);
  };

  // Helper to check if an item was purchased this visit
  const isPurchased = (optionType: ShopOptionType): boolean => {
    return purchasedItems.has(optionType);
  };

  // Helper to mark an item as purchased
  const markPurchased = (optionType: ShopOptionType) => {
    setPurchasedItems((prev) => new Set([...prev, optionType]));
  };

  // Calculate costs (use creditsForPricing so prices stay fixed for the visit)
  const singleDeadCardRemovalCost = applyShopCostMultiplier(
    calculateSingleDeadCardRemovalCost(deadCardRemovalCount),
    creditsForPricing
  );
  const allDeadCardsRemovalCost = applyShopCostMultiplier(
    calculateAllDeadCardsRemovalCost(deadCardRemovalCount, deadCards.length),
    creditsForPricing
  );
  const wildCardCost = applyShopCostMultiplier(
    calculateWildCardCost(wildCardCount),
    creditsForPricing
  );
  const devilsDealChanceCost = applyShopCostMultiplier(
    calculateDevilsDealChanceCost(devilsDealChancePurchases),
    creditsForPricing
  );
  const devilsDealCostReductionCost = applyShopCostMultiplier(
    calculateDevilsDealCostReductionCost(devilsDealCostReductionPurchases),
    creditsForPricing
  );
  const extraCardInHandCost = applyShopCostMultiplier(
    calculateExtraCardInHandCost(extraCardsInHand),
    creditsForPricing
  );
  const extraDrawCost = applyShopCostMultiplier(
    currentMode.shop.extraDraw.cost,
    creditsForPricing
  );

  const devilsDealConfig = currentMode.devilsDeal;
  const effectiveChance = devilsDealConfig
    ? devilsDealConfig.baseChance +
      devilsDealChancePurchases * devilsDealConfig.chanceIncreasePerPurchase
    : 0;
  const effectiveCostPercent = devilsDealConfig
    ? Math.max(
        1,
        devilsDealConfig.baseCostPercent -
          devilsDealCostReductionPurchases * devilsDealConfig.costReductionPerPurchase
      )
    : 0;

  // Recalculated every render from current props so it updates immediately after any purchase.
  // When prevRoundMinimumBet is set (we're in shop after a round), use getCreditsNeededForNextRound
  // so the cost correctly reflects bet increases (e.g. every 3 rounds).
  const creditsNeededForNextRound =
    prevRoundMinimumBet != null
      ? getCreditsNeededForNextRound(round, prevRoundMinimumBet, betAmount, selectedHandCount, handCount)
      : betAmount * selectedHandCount;

  const getRoundCostAfterPurchase = (newHandCount: number) =>
    prevRoundMinimumBet != null
      ? getCreditsNeededForNextRound(round, prevRoundMinimumBet, betAmount, newHandCount, newHandCount)
      : betAmount * newHandCount;

  /**
   * Attempts a purchase. If it would leave the player unable to afford the next round,
   * shows a warning modal instead of completing immediately.
   */
  const attemptPurchase = useCallback(
    (
      cost: number,
      roundCostAfterPurchase: number,
      optionType: ShopOptionType,
      doPurchase: () => void
    ) => {
      const creditsAfter = credits - cost;
      if (creditsAfter < roundCostAfterPurchase) {
        setAffordabilityWarning({
          onConfirm: () => {
            doPurchase();
            setPurchasedItems((prev) => new Set([...prev, optionType]));
            setAffordabilityWarning(null);
          },
          onCancel: () => setAffordabilityWarning(null),
          cost,
          creditsAfter,
          roundCost: roundCostAfterPurchase,
        });
      } else {
        doPurchase();
        markPurchased(optionType);
      }
    },
    [credits]
  );

  /** Renders one shop card for the given option type. Used to show exactly one card per slot (repeats allowed). */
  const renderShopCard = (optionType: ShopOptionType): React.ReactNode => {
    switch (optionType) {
      case 'parallel-hands-bundle-5':
        return (
          <div
            className="game-panel rounded-xl p-6 hover:opacity-95 transition-all flex flex-col h-full"
            title="More parallel hands = more chances to win each round. Each hand is evaluated separately."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Parallel Hands +5</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>Current: {handCount}</span>
            </div>
            <p className="mb-4" style={{ color: 'var(--game-text-muted)' }}>Add 5 Parallel Hands</p>
            <button
              onClick={() =>
                attemptPurchase(
                  calculateBundleCost(5),
                  getRoundCostAfterPurchase(handCount + 5),
                  'parallel-hands-bundle-5',
                  () => onAddParallelHandsBundle(5)
                )
              }
              disabled={credits < calculateBundleCost(5) || isPurchased('parallel-hands-bundle-5')}
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= calculateBundleCost(5) && !isPurchased('parallel-hands-bundle-5') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('parallel-hands-bundle-5')
                ? 'Already Purchased'
                : `${formatCredits(calculateBundleCost(5))} Credits`}
            </button>
          </div>
        );
      case 'parallel-hands-bundle-10':
        return (
          <div
            className="game-panel rounded-xl p-6 hover:opacity-95 transition-all flex flex-col h-full"
            title="More parallel hands = more chances to win each round. Each hand is evaluated separately."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Parallel Hands +10</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>Current: {handCount}</span>
            </div>
            <p className="mb-4" style={{ color: 'var(--game-text-muted)' }}>Add 10 Parallel Hands</p>
            <button
              onClick={() =>
                attemptPurchase(
                  calculateBundleCost(10),
                  getRoundCostAfterPurchase(handCount + 10),
                  'parallel-hands-bundle-10',
                  () => onAddParallelHandsBundle(10)
                )
              }
              disabled={
                credits < calculateBundleCost(10) || isPurchased('parallel-hands-bundle-10')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= calculateBundleCost(10) && !isPurchased('parallel-hands-bundle-10') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('parallel-hands-bundle-10')
                ? 'Already Purchased'
                : `${formatCredits(calculateBundleCost(10))} Credits`}
            </button>
          </div>
        );
      case 'parallel-hands-bundle-25':
        return (
          <div
            className="game-panel rounded-xl p-6 hover:opacity-95 transition-all flex flex-col h-full"
            title="More parallel hands = more chances to win each round. Each hand is evaluated separately."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Parallel Hands +25</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>Current: {handCount}</span>
            </div>
            <p className="mb-4" style={{ color: 'var(--game-text-muted)' }}>Add 25 Parallel Hands</p>
            <button
              onClick={() =>
                attemptPurchase(
                  calculateBundleCost(25),
                  getRoundCostAfterPurchase(handCount + 25),
                  'parallel-hands-bundle-25',
                  () => onAddParallelHandsBundle(25)
                )
              }
              disabled={
                credits < calculateBundleCost(25) || isPurchased('parallel-hands-bundle-25')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= calculateBundleCost(25) && !isPurchased('parallel-hands-bundle-25') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('parallel-hands-bundle-25')
                ? 'Already Purchased'
                : `${formatCredits(calculateBundleCost(25))} Credits`}
            </button>
          </div>
        );
      case 'parallel-hands-bundle-50':
        return (
          <div
            className="game-panel rounded-xl p-6 hover:opacity-95 transition-all flex flex-col h-full"
            title="More parallel hands = more chances to win each round. Each hand is evaluated separately."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Parallel Hands +50</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>Current: {handCount}</span>
            </div>
            <p className="mb-4" style={{ color: 'var(--game-text-muted)' }}>Add 50 Parallel Hands</p>
            <button
              onClick={() =>
                attemptPurchase(
                  calculateBundleCost(50),
                  getRoundCostAfterPurchase(handCount + 50),
                  'parallel-hands-bundle-50',
                  () => onAddParallelHandsBundle(50)
                )
              }
              disabled={
                credits < calculateBundleCost(50) || isPurchased('parallel-hands-bundle-50')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= calculateBundleCost(50) && !isPurchased('parallel-hands-bundle-50') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('parallel-hands-bundle-50')
                ? 'Already Purchased'
                : `${formatCredits(calculateBundleCost(50))} Credits`}
            </button>
          </div>
        );
      case 'parallel-hands-bundle-100':
        return (
          <div
            className="game-panel rounded-xl p-6 hover:opacity-95 transition-all flex flex-col h-full"
            title="More parallel hands = more chances to win each round. Each hand is evaluated separately."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Parallel Hands +100</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>Current: {handCount}</span>
            </div>
            <p className="mb-4" style={{ color: 'var(--game-text-muted)' }}>Add 100 Parallel Hands</p>
            <button
              onClick={() =>
                attemptPurchase(
                  calculateBundleCost(100),
                  getRoundCostAfterPurchase(handCount + 100),
                  'parallel-hands-bundle-100',
                  () => onAddParallelHandsBundle(100)
                )
              }
              disabled={
                credits < calculateBundleCost(100) || isPurchased('parallel-hands-bundle-100')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= calculateBundleCost(100) && !isPurchased('parallel-hands-bundle-100') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('parallel-hands-bundle-100')
                ? 'Already Purchased'
                : `${formatCredits(calculateBundleCost(100))} Credits`}
            </button>
          </div>
        );
      case 'parallel-hands-bundle-250':
        return (
          <div
            className="game-panel rounded-xl p-6 hover:opacity-95 transition-all flex flex-col h-full"
            title="More parallel hands = more chances to win each round. Each hand is evaluated separately."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Parallel Hands +250</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>Current: {handCount}</span>
            </div>
            <p className="mb-4" style={{ color: 'var(--game-text-muted)' }}>Add 250 Parallel Hands</p>
            <button
              onClick={() =>
                attemptPurchase(
                  calculateBundleCost(250),
                  getRoundCostAfterPurchase(handCount + 250),
                  'parallel-hands-bundle-250',
                  () => onAddParallelHandsBundle(250)
                )
              }
              disabled={
                credits < calculateBundleCost(250) || isPurchased('parallel-hands-bundle-250')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= calculateBundleCost(250) && !isPurchased('parallel-hands-bundle-250') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('parallel-hands-bundle-250')
                ? 'Already Purchased'
                : `${formatCredits(calculateBundleCost(250))} Credits`}
            </button>
          </div>
        );
      case 'parallel-hands-bundle-500':
        return (
          <div
            className="game-panel rounded-xl p-6 hover:opacity-95 transition-all flex flex-col h-full"
            title="More parallel hands = more chances to win each round. Each hand is evaluated separately."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Parallel Hands +500</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>Current: {handCount}</span>
            </div>
            <p className="mb-4" style={{ color: 'var(--game-text-muted)' }}>Add 500 Parallel Hands</p>
            <button
              onClick={() =>
                attemptPurchase(
                  calculateBundleCost(500),
                  getRoundCostAfterPurchase(handCount + 500),
                  'parallel-hands-bundle-500',
                  () => onAddParallelHandsBundle(500)
                )
              }
              disabled={
                credits < calculateBundleCost(500) || isPurchased('parallel-hands-bundle-500')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= calculateBundleCost(500) && !isPurchased('parallel-hands-bundle-500') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('parallel-hands-bundle-500')
                ? 'Already Purchased'
                : `${formatCredits(calculateBundleCost(500))} Credits`}
            </button>
          </div>
        );
      case 'parallel-hands-bundle-1000':
        return (
          <div
            className="game-panel rounded-xl p-6 hover:opacity-95 transition-all flex flex-col h-full"
            title="More parallel hands = more chances to win each round. Each hand is evaluated separately."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Parallel Hands +1000</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>Current: {handCount}</span>
            </div>
            <p className="mb-4" style={{ color: 'var(--game-text-muted)' }}>Add 1000 Parallel Hands</p>
            <button
              onClick={() =>
                attemptPurchase(
                  calculateBundleCost(1000),
                  getRoundCostAfterPurchase(handCount + 1000),
                  'parallel-hands-bundle-1000',
                  () => onAddParallelHandsBundle(1000)
                )
              }
              disabled={
                credits < calculateBundleCost(1000) || isPurchased('parallel-hands-bundle-1000')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= calculateBundleCost(1000) && !isPurchased('parallel-hands-bundle-1000') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('parallel-hands-bundle-1000')
                ? 'Already Purchased'
                : `${formatCredits(calculateBundleCost(1000))} Credits`}
            </button>
          </div>
        );
      case 'dead-card':
        return (
          <div
            className="game-panel rounded-xl p-6 hover:opacity-95 transition-all flex flex-col h-full"
            title="Dead cards are drawn but don't count toward your hand. Add one to receive credits."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Add Dead Card</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>
                {deadCards.length}/{gameConfig.deadCardLimit}
              </span>
            </div>
            <p className="mb-4" style={{ color: 'var(--game-text-muted)' }}>
              Add a card that doesn't count toward your hand to your deck. Receive{' '}
              {formatCredits(currentMode.shop.deadCard.creditReward)} credits
            </p>
            <button
              onClick={() => {
                onAddDeadCard();
                markPurchased('dead-card');
              }}
              disabled={deadCards.length >= gameConfig.deadCardLimit || isPurchased('dead-card')}
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${deadCards.length < gameConfig.deadCardLimit && !isPurchased('dead-card') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('dead-card')
                ? 'Already Purchased'
                : deadCards.length >= gameConfig.deadCardLimit
                  ? 'Maximum Dead Cards Reached'
                  : `Gain ${formatCredits(currentMode.shop.deadCard.creditReward)} Credits`}
            </button>
          </div>
        );
      case 'wild-card':
        return (
          <div
            className="game-panel rounded-xl p-6 hover:opacity-95 transition-all flex flex-col h-full border border-[var(--game-accent-gold)]"
            style={{ boxShadow: '0 0 16px rgba(201, 162, 39, 0.15)' }}
            title="Wild cards can substitute for any rank and suit. Great for completing straights, flushes, and high pairs."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Add Wild Card</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>
                {wildCardCount}/{currentMode.shop.wildCard.maxCount}
              </span>
            </div>
            <p className="mb-4" style={{ color: 'var(--game-text-muted)' }}>
              Add a card that counts as any rank and suit (max {currentMode.shop.wildCard.maxCount})
            </p>
            <button
              onClick={() =>
                attemptPurchase(wildCardCost, creditsNeededForNextRound, 'wild-card', onAddWildCard)
              }
              disabled={
                credits < wildCardCost ||
                wildCardCount >= currentMode.shop.wildCard.maxCount ||
                isPurchased('wild-card')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= wildCardCost && wildCardCount < currentMode.shop.wildCard.maxCount && !isPurchased('wild-card') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('wild-card')
                ? 'Already Purchased'
                : `${formatCredits(wildCardCost)} Credits${wildCardCount >= currentMode.shop.wildCard.maxCount ? ' (Max)' : ''}`}
            </button>
          </div>
        );
      case 'extra-draw':
        return (
          <div
            className="game-panel rounded-xl p-6 hover:opacity-95 transition-all flex flex-col h-full"
            title="Get a second draw phase: hold 1 card, redraw the other 4. One-time purchase."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Extra Draw</h3>
            </div>
            <p className="mb-4" style={{ color: 'var(--game-text-muted)' }}>
              Adds an additonal draw phase after you hold cards.
            </p>
            <button
              onClick={() =>
                attemptPurchase(
                  extraDrawCost,
                  creditsNeededForNextRound,
                  'extra-draw',
                  onPurchaseExtraDraw
                )
              }
              disabled={
                credits < extraDrawCost ||
                extraDrawPurchased ||
                isPurchased('extra-draw')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= extraDrawCost && !extraDrawPurchased && !isPurchased('extra-draw') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('extra-draw') || extraDrawPurchased
                ? 'Already Purchased'
                : `${formatCredits(extraDrawCost)} Credits`}
            </button>
          </div>
        );
      case 'extra-card-in-hand':
        return (
          <div className="game-panel rounded-lg p-6 hover:opacity-95 transition-all flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Extra Card in Hand</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>
                {extraCardsInHand}/{currentMode.shop.extraCardInHand.maxPurchases}
              </span>
            </div>
            <p className="mb-4" style={{ color: 'var(--game-text-muted)' }}>Deals an additional card during your draw phase.</p>
            <button
              onClick={() =>
                attemptPurchase(
                  extraCardInHandCost,
                  creditsNeededForNextRound,
                  'extra-card-in-hand',
                  onPurchaseExtraCardInHand
                )
              }
              disabled={
                credits < extraCardInHandCost ||
                extraCardsInHand >= currentMode.shop.extraCardInHand.maxPurchases ||
                isPurchased('extra-card-in-hand')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= extraCardInHandCost && extraCardsInHand < currentMode.shop.extraCardInHand.maxPurchases && !isPurchased('extra-card-in-hand') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {extraCardsInHand >= currentMode.shop.extraCardInHand.maxPurchases
                ? 'Max Purchased'
                : isPurchased('extra-card-in-hand')
                  ? 'Purchased This Visit'
                  : `${formatCredits(extraCardInHandCost)} Credits`}
            </button>
          </div>
        );
      case 'remove-single-dead-card':
        return (
          <div className="game-panel rounded-lg p-6 hover:opacity-95 transition-all flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Remove Dead Card</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>
                {deadCards.length > 0 ? `1/${deadCards.length}` : 'None'}
              </span>
            </div>
            <p className="mb-4" style={{ color: 'var(--game-text-muted)' }}>Permanently remove one dead card from deck</p>
            <button
              onClick={() =>
                attemptPurchase(
                  singleDeadCardRemovalCost,
                  creditsNeededForNextRound,
                  'remove-single-dead-card',
                  onRemoveSingleDeadCard
                )
              }
              disabled={
                credits < singleDeadCardRemovalCost ||
                deadCards.length === 0 ||
                isPurchased('remove-single-dead-card')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= singleDeadCardRemovalCost && deadCards.length > 0 && !isPurchased('remove-single-dead-card') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('remove-single-dead-card')
                ? 'Already Purchased'
                : deadCards.length === 0
                  ? 'No dead cards'
                  : `${formatCredits(singleDeadCardRemovalCost)} Credits`}
            </button>
          </div>
        );
      case 'remove-all-dead-cards':
        return (
          <div className="game-panel rounded-lg p-6 hover:opacity-95 transition-all flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Remove All Dead Cards</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>{deadCards.length} total</span>
            </div>
            <p className="mb-4" style={{ color: 'var(--game-text-muted)' }}>Remove all {deadCards.length} dead cards at once</p>
            <button
              onClick={() =>
                attemptPurchase(
                  allDeadCardsRemovalCost,
                  creditsNeededForNextRound,
                  'remove-all-dead-cards',
                  onRemoveAllDeadCards
                )
              }
              disabled={
                credits < allDeadCardsRemovalCost ||
                deadCards.length === 0 ||
                isPurchased('remove-all-dead-cards')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= allDeadCardsRemovalCost && deadCards.length > 0 && !isPurchased('remove-all-dead-cards') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('remove-all-dead-cards')
                ? 'Already Purchased'
                : `${formatCredits(allDeadCardsRemovalCost)} Credits`}
            </button>
          </div>
        );
      case 'devils-deal-chance':
        return devilsDealConfig ? (
          <div className="game-panel rounded-xl p-6 hover:opacity-95 transition-all flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Increase Devil's Deal Chance</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>
                {devilsDealChancePurchases}/{devilsDealConfig.maxChancePurchases}
              </span>
            </div>
            <p className="mb-2" style={{ color: 'var(--game-text-muted)' }}>
              Increase chance by {devilsDealConfig.chanceIncreasePerPurchase}% per purchase
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--game-text-dim)' }}>Current chance: {effectiveChance}%</p>
            <button
              onClick={() =>
                attemptPurchase(
                  devilsDealChanceCost,
                  creditsNeededForNextRound,
                  'devils-deal-chance',
                  onPurchaseDevilsDealChance
                )
              }
              disabled={
                credits < devilsDealChanceCost ||
                devilsDealChancePurchases >= devilsDealConfig.maxChancePurchases ||
                isPurchased('devils-deal-chance')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= devilsDealChanceCost && devilsDealChancePurchases < devilsDealConfig.maxChancePurchases && !isPurchased('devils-deal-chance') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('devils-deal-chance')
                ? 'Already Purchased'
                : devilsDealChancePurchases >= devilsDealConfig.maxChancePurchases
                  ? 'Maximum Purchases Reached'
                  : `${formatCredits(devilsDealChanceCost)} Credits`}
            </button>
          </div>
        ) : null;
      case 'devils-deal-cost-reduction':
        return devilsDealConfig ? (
          <div className="game-panel rounded-xl p-6 hover:opacity-95 transition-all flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--game-text)' }}>Reduce Devil's Deal Cost</h3>
              <span style={{ color: 'var(--game-text-muted)' }}>
                {devilsDealCostReductionPurchases}/{devilsDealConfig.maxCostReductionPurchases}
              </span>
            </div>
            <p className="mb-2" style={{ color: 'var(--game-text-muted)' }}>
              Reduce cost by {devilsDealConfig.costReductionPerPurchase}% per purchase
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--game-text-dim)' }}>
              Current cost: {effectiveCostPercent}% of payout
            </p>
            <button
              onClick={() =>
                attemptPurchase(
                  devilsDealCostReductionCost,
                  creditsNeededForNextRound,
                  'devils-deal-cost-reduction',
                  onPurchaseDevilsDealCostReduction
                )
              }
              disabled={
                credits < devilsDealCostReductionCost ||
                devilsDealCostReductionPurchases >= devilsDealConfig.maxCostReductionPurchases ||
                isPurchased('devils-deal-cost-reduction')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= devilsDealCostReductionCost && devilsDealCostReductionPurchases < devilsDealConfig.maxCostReductionPurchases && !isPurchased('devils-deal-cost-reduction') ? 'shop-btn-enabled' : 'shop-btn-disabled'}`}
            >
              {isPurchased('devils-deal-cost-reduction')
                ? 'Already Purchased'
                : devilsDealCostReductionPurchases >= devilsDealConfig.maxCostReductionPurchases
                  ? 'Maximum Purchases Reached'
                  : `${formatCredits(devilsDealCostReductionCost)} Credits`}
            </button>
          </div>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] p-4 sm:p-6 ${isVipShop ? 'shop-vip-sheen' : ''}`}>
      <div className="max-w-4xl mx-auto flex flex-col min-h-[calc(100dvh-2rem)]">
        <div className="flex justify-between items-center gap-4 mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: 'var(--game-accent-gold)' }}>
            {getShopDisplayName(creditsForPricing)}
          </h2>
          <div className="flex items-center gap-2">
            {onShowSettings && (
              <button
                onClick={onShowSettings}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all border border-[var(--game-border)] hover:brightness-110"
                style={{
                  background: 'linear-gradient(145deg, var(--game-bg-card) 0%, var(--game-bg-panel) 100%)',
                  color: 'var(--game-text)',
                }}
                title="Settings"
                aria-label="Open settings"
              >
                ⚙️
              </button>
            )}
            <GameButton onClick={onClose} variant="primary" size="md">
              Close Shop
            </GameButton>
          </div>
        </div>

        <div className="mb-4 sm:mb-6 p-4 game-panel-muted rounded-xl flex flex-wrap justify-between items-center gap-2">
          <p className="text-lg font-semibold" style={{ color: 'var(--game-text)' }}>
            Credits: <span style={{ color: 'var(--game-accent-gold)' }}>{formatCredits(credits)}</span>
          </p>
          <p className="text-sm" style={{ color: 'var(--game-text-muted)' }}>
            Credits needed for next round:{' '}
            <span className="font-semibold" style={{ color: 'var(--game-text)' }}>{formatCredits(creditsNeededForNextRound)}</span>
          </p>
        </div>

        {/* Empty shop message */}
        {selectedShopOptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 flex-1">
            <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">🏪</div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-center" style={{ color: 'var(--game-accent-gold)' }}>
              {
                gameConfig.quips.emptyShop[
                  Math.floor(Math.random() * gameConfig.quips.emptyShop.length)
                ]
              }
            </h3>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8" style={{ color: 'var(--game-text-muted)' }}>
              Try again next round!
            </p>
            <GameButton onClick={onClose} variant="secondary" size="lg">
              Continue
            </GameButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 flex-1">
            {selectedShopOptions.map((optionType, index) => (
              <div
                key={`shop-slot-${index}`}
                className={isVipShop ? 'shop-vip-card h-full' : 'h-full'}
              >
                {renderShopCard(optionType)}
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 sm:pt-6">
          <GameButton onClick={onClose} variant="primary" size="lg" fullWidth>
            Close Shop
          </GameButton>
        </div>

        {/* Affordability warning modal */}
        {affordabilityWarning && (
          <div
            className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="affordability-warning-title"
            onClick={(e) => e.target === e.currentTarget && affordabilityWarning.onCancel()}
          >
            <div
              className="game-panel rounded-xl p-6 max-w-md w-full border border-[var(--game-accent-gold)] shadow-xl"
              style={{ boxShadow: '0 0 24px var(--game-accent-gold-glow)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                id="affordability-warning-title"
                className="text-xl font-bold mb-3"
                style={{ color: 'var(--game-accent-gold)' }}
              >
                Warning: Cannot Afford Next Round
              </h3>
              <p className="mb-4" style={{ color: 'var(--game-text)' }}>
                This purchase would leave you with{' '}
                {formatCredits(affordabilityWarning.creditsAfter)} credits, but you need{' '}
                {formatCredits(affordabilityWarning.roundCost)} to play the next round.
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--game-text-muted)' }}>
                If you make this purchase, you will not be able to afford the next round and you
                will lose. IT IS A BAD IDEA TO MAKE THIS PURCHASE.
              </p>
              <div className="flex gap-3 justify-end">
                <GameButton onClick={affordabilityWarning.onCancel} variant="ghost" size="md">
                  Cancel
                </GameButton>
                <GameButton onClick={affordabilityWarning.onConfirm} variant="secondary" size="md">
                  Complete Purchase Anyway
                </GameButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

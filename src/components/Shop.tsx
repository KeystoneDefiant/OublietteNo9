import { useState, Fragment, useCallback, useEffect } from 'react';
import {
  calculateWildCardCost,
  calculateSingleDeadCardRemovalCost,
  calculateAllDeadCardsRemovalCost,
  calculateDevilsDealChanceCost,
  calculateDevilsDealCostReductionCost,
  calculateExtraCardInHandCost,
} from '../utils/config';
import { gameConfig, getCurrentGameMode } from '../config/gameConfig';
import { ShopOptionType } from '../types';
import { formatCredits } from '../utils/format';
/**
 * Shop component props
 *
 * Displays available upgrades and modifications for the player to purchase
 * between rounds. Upgrades include dead cards, wild cards, parallel hands,
 * extra draws, and Devil's Deal improvements.
 */
interface ShopProps {
  /** Current player credits */
  credits: number;
  /** Total hand count (maximum parallel hands available) */
  handCount: number;
  /** Bet amount per hand for next round (used to show cost for next round) */
  betAmount: number;
  /** Selected hand count for next round (used to show cost for next round) */
  selectedHandCount: number;
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
  handCount,
  betAmount,
  selectedHandCount,
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
}: ShopProps) {
  const currentMode = getCurrentGameMode();
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

  // Helper to calculate bundle cost
  const calculateBundleCost = (bundleSize: number): number => {
    const basePricePerHand = currentMode.shop.parallelHandsBundles.basePricePerHand;
    return bundleSize * basePricePerHand;
  };

  // Helper to check if an item was purchased this visit
  const isPurchased = (optionType: ShopOptionType): boolean => {
    return purchasedItems.has(optionType);
  };

  // Helper to mark an item as purchased
  const markPurchased = (optionType: ShopOptionType) => {
    setPurchasedItems((prev) => new Set([...prev, optionType]));
  };

  // Calculate costs
  const singleDeadCardRemovalCost = calculateSingleDeadCardRemovalCost(deadCardRemovalCount);
  const allDeadCardsRemovalCost = calculateAllDeadCardsRemovalCost(
    deadCardRemovalCount,
    deadCards.length
  );
  const wildCardCost = calculateWildCardCost(wildCardCount);
  const devilsDealChanceCost = calculateDevilsDealChanceCost(devilsDealChancePurchases);
  const devilsDealCostReductionCost = calculateDevilsDealCostReductionCost(
    devilsDealCostReductionPurchases
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

  // Recalculated every render from current props so it updates immediately after any purchase
  const creditsNeededForNextRound = betAmount * selectedHandCount;

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
            className="border-2 border-white rounded-lg p-6 bg-blue-800 bg-opacity-50 hover:bg-opacity-70 transition-all flex flex-col h-full"
            title="More parallel hands = more chances to win each round. Each hand is evaluated separately."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Parallel Hands +5</h3>
              <span className="text-blue-200">Current: {handCount}</span>
            </div>
            <p className="text-blue-100 mb-4">Add 5 Parallel Hands</p>
            <button
              onClick={() =>
                attemptPurchase(
                  calculateBundleCost(5),
                  betAmount * (handCount + 5),
                  'parallel-hands-bundle-5',
                  () => onAddParallelHandsBundle(5)
                )
              }
              disabled={credits < calculateBundleCost(5) || isPurchased('parallel-hands-bundle-5')}
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= calculateBundleCost(5) && !isPurchased('parallel-hands-bundle-5') ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
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
            className="border-2 border-white rounded-lg p-6 bg-blue-800 bg-opacity-50 hover:bg-opacity-70 transition-all flex flex-col h-full"
            title="More parallel hands = more chances to win each round. Each hand is evaluated separately."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Parallel Hands +10</h3>
              <span className="text-blue-200">Current: {handCount}</span>
            </div>
            <p className="text-blue-100 mb-4">Add 10 Parallel Hands</p>
            <button
              onClick={() =>
                attemptPurchase(
                  calculateBundleCost(10),
                  betAmount * (handCount + 10),
                  'parallel-hands-bundle-10',
                  () => onAddParallelHandsBundle(10)
                )
              }
              disabled={
                credits < calculateBundleCost(10) || isPurchased('parallel-hands-bundle-10')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= calculateBundleCost(10) && !isPurchased('parallel-hands-bundle-10') ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
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
            className="border-2 border-white rounded-lg p-6 bg-blue-800 bg-opacity-50 hover:bg-opacity-70 transition-all flex flex-col h-full"
            title="More parallel hands = more chances to win each round. Each hand is evaluated separately."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Parallel Hands +25</h3>
              <span className="text-blue-200">Current: {handCount}</span>
            </div>
            <p className="text-blue-100 mb-4">Add 25 Parallel Hands</p>
            <button
              onClick={() =>
                attemptPurchase(
                  calculateBundleCost(25),
                  betAmount * (handCount + 25),
                  'parallel-hands-bundle-25',
                  () => onAddParallelHandsBundle(25)
                )
              }
              disabled={
                credits < calculateBundleCost(25) || isPurchased('parallel-hands-bundle-25')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= calculateBundleCost(25) && !isPurchased('parallel-hands-bundle-25') ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
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
            className="border-2 border-white rounded-lg p-6 bg-blue-800 bg-opacity-50 hover:bg-opacity-70 transition-all flex flex-col h-full"
            title="More parallel hands = more chances to win each round. Each hand is evaluated separately."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Parallel Hands +50</h3>
              <span className="text-blue-200">Current: {handCount}</span>
            </div>
            <p className="text-blue-100 mb-4">Add 50 Parallel Hands</p>
            <button
              onClick={() =>
                attemptPurchase(
                  calculateBundleCost(50),
                  betAmount * (handCount + 50),
                  'parallel-hands-bundle-50',
                  () => onAddParallelHandsBundle(50)
                )
              }
              disabled={
                credits < calculateBundleCost(50) || isPurchased('parallel-hands-bundle-50')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= calculateBundleCost(50) && !isPurchased('parallel-hands-bundle-50') ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
            >
              {isPurchased('parallel-hands-bundle-50')
                ? 'Already Purchased'
                : `${formatCredits(calculateBundleCost(50))} Credits`}
            </button>
          </div>
        );
      case 'dead-card':
        return (
          <div
            className="border-2 border-white rounded-lg p-6 bg-purple-800 bg-opacity-50 hover:bg-opacity-70 transition-all flex flex-col h-full"
            title="Dead cards are drawn but don't count toward your hand. Add one to receive credits."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Add Dead Card</h3>
              <span className="text-purple-200">
                {deadCards.length}/{gameConfig.deadCardLimit}
              </span>
            </div>
            <p className="text-purple-100 mb-4">
              Add a card that doesn't count toward your hand to your deck. Receive{' '}
              {formatCredits(currentMode.shop.deadCard.creditReward)} credits
            </p>
            <button
              onClick={() => {
                onAddDeadCard();
                markPurchased('dead-card');
              }}
              disabled={deadCards.length >= gameConfig.deadCardLimit || isPurchased('dead-card')}
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${deadCards.length < gameConfig.deadCardLimit && !isPurchased('dead-card') ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
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
            className="border-2 border-white rounded-lg p-6 bg-orange-800 bg-opacity-50 hover:bg-opacity-70 transition-all flex flex-col h-full"
            title="Wild cards can substitute for any rank and suit. Great for completing straights, flushes, and high pairs."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Add Wild Card</h3>
              <span className="text-orange-200">
                {wildCardCount}/{currentMode.shop.wildCard.maxCount}
              </span>
            </div>
            <p className="text-orange-100 mb-4">
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
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= wildCardCost && wildCardCount < currentMode.shop.wildCard.maxCount && !isPurchased('wild-card') ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
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
            className="border-2 border-white rounded-lg p-6 bg-indigo-800 bg-opacity-50 hover:bg-opacity-70 transition-all flex flex-col h-full"
            title="Get a second draw phase: hold 1 card, redraw the other 4. One-time purchase."
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Extra Draw</h3>
            </div>
            <p className="text-indigo-100 mb-4">
              Adds an additonal draw phase after you hold cards.
            </p>
            <button
              onClick={() =>
                attemptPurchase(
                  currentMode.shop.extraDraw.cost,
                  creditsNeededForNextRound,
                  'extra-draw',
                  onPurchaseExtraDraw
                )
              }
              disabled={
                credits < currentMode.shop.extraDraw.cost ||
                extraDrawPurchased ||
                isPurchased('extra-draw')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= currentMode.shop.extraDraw.cost && !extraDrawPurchased && !isPurchased('extra-draw') ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
            >
              {isPurchased('extra-draw') || extraDrawPurchased
                ? 'Already Purchased'
                : `${formatCredits(currentMode.shop.extraDraw.cost)} Credits`}
            </button>
          </div>
        );
      case 'extra-card-in-hand':
        return (
          <div className="border-2 border-white rounded-lg p-6 bg-amber-800 bg-opacity-50 hover:bg-opacity-70 transition-all flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Extra Card in Hand</h3>
              <span className="text-amber-200">
                {extraCardsInHand}/{currentMode.shop.extraCardInHand.maxPurchases}
              </span>
            </div>
            <p className="text-amber-100 mb-4">Deals an additional card during your draw phase.</p>
            <button
              onClick={() =>
                attemptPurchase(
                  calculateExtraCardInHandCost(extraCardsInHand),
                  creditsNeededForNextRound,
                  'extra-card-in-hand',
                  onPurchaseExtraCardInHand
                )
              }
              disabled={
                credits < calculateExtraCardInHandCost(extraCardsInHand) ||
                extraCardsInHand >= currentMode.shop.extraCardInHand.maxPurchases ||
                isPurchased('extra-card-in-hand')
              }
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= calculateExtraCardInHandCost(extraCardsInHand) && extraCardsInHand < currentMode.shop.extraCardInHand.maxPurchases && !isPurchased('extra-card-in-hand') ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
            >
              {extraCardsInHand >= currentMode.shop.extraCardInHand.maxPurchases
                ? 'Max Purchased'
                : isPurchased('extra-card-in-hand')
                  ? 'Purchased This Visit'
                  : `${formatCredits(calculateExtraCardInHandCost(extraCardsInHand))} Credits`}
            </button>
          </div>
        );
      case 'remove-single-dead-card':
        return (
          <div className="border-2 border-white rounded-lg p-6 bg-red-800 bg-opacity-50 hover:bg-opacity-70 transition-all flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Remove Dead Card</h3>
              <span className="text-red-200">
                {deadCards.length > 0 ? `1/${deadCards.length}` : 'None'}
              </span>
            </div>
            <p className="text-red-100 mb-4">Permanently remove one dead card from deck</p>
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
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= singleDeadCardRemovalCost && deadCards.length > 0 && !isPurchased('remove-single-dead-card') ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
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
          <div className="border-2 border-white rounded-lg p-6 bg-red-800 bg-opacity-50 hover:bg-opacity-70 transition-all flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Remove All Dead Cards</h3>
              <span className="text-red-200">{deadCards.length} total</span>
            </div>
            <p className="text-red-100 mb-4">Remove all {deadCards.length} dead cards at once</p>
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
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= allDeadCardsRemovalCost && deadCards.length > 0 && !isPurchased('remove-all-dead-cards') ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
            >
              {isPurchased('remove-all-dead-cards')
                ? 'Already Purchased'
                : `${formatCredits(allDeadCardsRemovalCost)} Credits`}
            </button>
          </div>
        );
      case 'devils-deal-chance':
        return devilsDealConfig ? (
          <div className="border-2 border-white rounded-lg p-6 bg-purple-800 bg-opacity-50 hover:bg-opacity-70 transition-all flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Increase Devil's Deal Chance</h3>
              <span className="text-purple-200">
                {devilsDealChancePurchases}/{devilsDealConfig.maxChancePurchases}
              </span>
            </div>
            <p className="text-purple-100 mb-2">
              Increase chance by {devilsDealConfig.chanceIncreasePerPurchase}% per purchase
            </p>
            <p className="text-purple-200 text-sm mb-4">Current chance: {effectiveChance}%</p>
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
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= devilsDealChanceCost && devilsDealChancePurchases < devilsDealConfig.maxChancePurchases && !isPurchased('devils-deal-chance') ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
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
          <div className="border-2 border-white rounded-lg p-6 bg-purple-800 bg-opacity-50 hover:bg-opacity-70 transition-all flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Reduce Devil's Deal Cost</h3>
              <span className="text-purple-200">
                {devilsDealCostReductionPurchases}/{devilsDealConfig.maxCostReductionPurchases}
              </span>
            </div>
            <p className="text-purple-100 mb-2">
              Reduce cost by {devilsDealConfig.costReductionPerPurchase}% per purchase
            </p>
            <p className="text-purple-200 text-sm mb-4">
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
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors mt-auto ${credits >= devilsDealCostReductionCost && devilsDealCostReductionPurchases < devilsDealConfig.maxCostReductionPurchases && !isPurchased('devils-deal-cost-reduction') ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
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
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-white">Shop</h2>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Close Shop
          </button>
        </div>

        <div className="mb-6 p-4 bg-green-50 rounded-lg flex flex-wrap justify-between items-center gap-2">
          <p className="text-lg font-semibold text-gray-800">
            Credits: <span className="text-green-600">{formatCredits(credits)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Credits needed for next round:{' '}
            <span className="font-semibold">{formatCredits(creditsNeededForNextRound)}</span>
          </p>
        </div>

        {/* Empty shop message */}
        {selectedShopOptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-6">🏪</div>
            <h3 className="text-3xl font-bold text-white mb-4">
              {
                gameConfig.quips.emptyShop[
                  Math.floor(Math.random() * gameConfig.quips.emptyShop.length)
                ]
              }
            </h3>
            <p className="text-xl text-gray-300 mb-8">Try again next round!</p>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-xl"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedShopOptions.map((optionType, index) => (
              <Fragment key={`shop-slot-${index}`}>{renderShopCard(optionType)}</Fragment>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 justify-end py-6">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Close Shop
          </button>
        </div>

        {/* Affordability warning modal */}
        {affordabilityWarning && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="affordability-warning-title"
            onClick={(e) => e.target === e.currentTarget && affordabilityWarning.onCancel()}
          >
            <div
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border-2 border-amber-500 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                id="affordability-warning-title"
                className="text-xl font-bold text-amber-400 mb-3"
              >
                Warning: Cannot Afford Next Round
              </h3>
              <p className="text-gray-200 mb-4">
                This purchase would leave you with{' '}
                {formatCredits(affordabilityWarning.creditsAfter)} credits, but you need{' '}
                {formatCredits(affordabilityWarning.roundCost)} to play the next round.
              </p>
              <p className="text-gray-300 text-sm mb-6">
                If you make this purchase, you will not be able to afford the next round and you
                will lose. IT IS A BAD IDEA TO MAKE THIS PURCHASE.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={affordabilityWarning.onCancel}
                  className="px-4 py-2 rounded-lg font-semibold bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={affordabilityWarning.onConfirm}
                  className="px-4 py-2 rounded-lg font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                >
                  Complete Purchase Anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

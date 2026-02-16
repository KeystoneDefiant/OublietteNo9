import { useState } from 'react';
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

  // Helper function to check if an option should be shown
  const isOptionAvailable = (optionType: ShopOptionType): boolean => {
    return selectedShopOptions.includes(optionType);
  };

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
            Credits needed for next round: <span className="font-semibold">{formatCredits(betAmount * selectedHandCount)}</span>
          </p>
        </div>

        {/* Empty shop message */}
        {selectedShopOptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-6">🏪</div>
            <h3 className="text-3xl font-bold text-white mb-4">
              {gameConfig.quips.emptyShop[Math.floor(Math.random() * gameConfig.quips.emptyShop.length)]}
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
          {/* Parallel Hands Bundle - 5 hands */}
          {isOptionAvailable('parallel-hands-bundle-5') && (
            <div className="border-2 border-white rounded-lg p-6 bg-blue-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-white">Parallel Hands +5</h3>
                <span className="text-blue-200">Current: {handCount}</span>
              </div>
              <p className="text-blue-100 mb-4">Add 5 parallel hands to your deck</p>
              <button
                onClick={() => {
                  onAddParallelHandsBundle(5);
                  markPurchased('parallel-hands-bundle-5');
                }}
                disabled={
                  credits < calculateBundleCost(5) || isPurchased('parallel-hands-bundle-5')
                }
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= calculateBundleCost(5) && !isPurchased('parallel-hands-bundle-5')
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('parallel-hands-bundle-5')
                  ? 'Already Purchased'
                  : `${calculateBundleCost(5)} Credits`}
              </button>
            </div>
          )}

          {/* Parallel Hands Bundle - 10 hands */}
          {isOptionAvailable('parallel-hands-bundle-10') && (
            <div className="border-2 border-white rounded-lg p-6 bg-blue-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-white">Parallel Hands +10</h3>
                <span className="text-blue-200">Current: {handCount}</span>
              </div>
              <p className="text-blue-100 mb-4">Add 10 parallel hands to your deck</p>
              <button
                onClick={() => {
                  onAddParallelHandsBundle(10);
                  markPurchased('parallel-hands-bundle-10');
                }}
                disabled={
                  credits < calculateBundleCost(10) || isPurchased('parallel-hands-bundle-10')
                }
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= calculateBundleCost(10) && !isPurchased('parallel-hands-bundle-10')
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('parallel-hands-bundle-10')
                  ? 'Already Purchased'
                  : `${calculateBundleCost(10)} Credits`}
              </button>
            </div>
          )}

          {/* Parallel Hands Bundle - 25 hands */}
          {isOptionAvailable('parallel-hands-bundle-25') && (
            <div className="border-2 border-white rounded-lg p-6 bg-blue-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-white">Parallel Hands +25</h3>
                <span className="text-blue-200">Current: {handCount}</span>
              </div>
              <p className="text-blue-100 mb-4">Add 25 parallel hands to your deck</p>
              <button
                onClick={() => {
                  onAddParallelHandsBundle(25);
                  markPurchased('parallel-hands-bundle-25');
                }}
                disabled={
                  credits < calculateBundleCost(25) || isPurchased('parallel-hands-bundle-25')
                }
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= calculateBundleCost(25) && !isPurchased('parallel-hands-bundle-25')
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('parallel-hands-bundle-25')
                  ? 'Already Purchased'
                  : `${calculateBundleCost(25)} Credits`}
              </button>
            </div>
          )}

          {/* Parallel Hands Bundle - 50 hands */}
          {isOptionAvailable('parallel-hands-bundle-50') && (
            <div className="border-2 border-white rounded-lg p-6 bg-blue-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-white">Parallel Hands +50</h3>
                <span className="text-blue-200">Current: {handCount}</span>
              </div>
              <p className="text-blue-100 mb-4">Add 50 parallel hands to your deck</p>
              <button
                onClick={() => {
                  onAddParallelHandsBundle(50);
                  markPurchased('parallel-hands-bundle-50');
                }}
                disabled={
                  credits < calculateBundleCost(50) || isPurchased('parallel-hands-bundle-50')
                }
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= calculateBundleCost(50) && !isPurchased('parallel-hands-bundle-50')
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('parallel-hands-bundle-50')
                  ? 'Already Purchased'
                  : `${calculateBundleCost(50)} Credits`}
              </button>
            </div>
          )}

          {/* Add Dead Card */}
          {isOptionAvailable('dead-card') && (
            <div className="border-2 border-white rounded-lg p-6 bg-purple-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-white">Add Dead Card</h3>
                <span className="text-purple-200">
                  {deadCards.length}/{gameConfig.deadCardLimit}
                </span>
              </div>
              <p className="text-purple-100 mb-4">
                Add a non-counting card. Get {formatCredits(currentMode.shop.deadCard.creditReward)} credits
              </p>
              <button
                onClick={() => {
                  onAddDeadCard();
                  markPurchased('dead-card');
                }}
                disabled={deadCards.length >= gameConfig.deadCardLimit || isPurchased('dead-card')}
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    deadCards.length < gameConfig.deadCardLimit && !isPurchased('dead-card')
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('dead-card')
                  ? 'Already Purchased'
                  : deadCards.length >= gameConfig.deadCardLimit
                  ? 'Maximum Dead Cards Reached'
                  : `Gain ${formatCredits(currentMode.shop.deadCard.creditReward)} Credits`}
              </button>
            </div>
          )}

          {/* Wild Card */}
          {isOptionAvailable('wild-card') && (
            <div className="border-2 border-white rounded-lg p-6 bg-orange-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-white">Add Wild Card</h3>
                <span className="text-orange-200">{wildCardCount}/3</span>
              </div>
              <p className="text-orange-100 mb-4">
                Add a card that counts as any rank and suit (max 3)
              </p>
              <button
                onClick={() => {
                  onAddWildCard();
                  markPurchased('wild-card');
                }}
                disabled={
                  credits < wildCardCost ||
                  wildCardCount >= currentMode.shop.wildCard.maxCount ||
                  isPurchased('wild-card')
                }
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= wildCardCost &&
                    wildCardCount < currentMode.shop.wildCard.maxCount &&
                    !isPurchased('wild-card')
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('wild-card')
                  ? 'Already Purchased'
                  : `${wildCardCost} Credits${
                      wildCardCount >= currentMode.shop.wildCard.maxCount ? ' (Max)' : ''
                    }`}
              </button>
            </div>
          )}

          {/* Extra Draw */}
          {isOptionAvailable('extra-draw') && (
            <div className="border-2 border-white rounded-lg p-6 bg-indigo-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-white">Extra Draw</h3>
              </div>
              <p className="text-indigo-100 mb-4">
                Redraw 4 cards while holding 1 (one-time purchase)
              </p>
              <button
                onClick={() => {
                  onPurchaseExtraDraw();
                  markPurchased('extra-draw');
                }}
                disabled={
                  credits < currentMode.shop.extraDraw.cost ||
                  extraDrawPurchased ||
                  isPurchased('extra-draw')
                }
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= currentMode.shop.extraDraw.cost &&
                    !extraDrawPurchased &&
                    !isPurchased('extra-draw')
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('extra-draw') || extraDrawPurchased
                  ? 'Already Purchased'
                  : `${currentMode.shop.extraDraw.cost} Credits`}
              </button>
            </div>
          )}

          {/* Extra Card in Hand */}
          {isOptionAvailable('extra-card-in-hand') && (
            <div className="border-2 border-white rounded-lg p-6 bg-amber-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-white">Extra Card in Hand</h3>
                <span className="text-amber-200">
                  {extraCardsInHand}/{currentMode.shop.extraCardInHand.maxPurchases}
                </span>
              </div>
              <p className="text-amber-100 mb-4">
                Deal one more card to choose from (still play 5). More options each hand.
              </p>
              <button
                onClick={() => {
                  onPurchaseExtraCardInHand();
                  markPurchased('extra-card-in-hand');
                }}
                disabled={
                  credits < calculateExtraCardInHandCost(extraCardsInHand) ||
                  extraCardsInHand >= currentMode.shop.extraCardInHand.maxPurchases ||
                  isPurchased('extra-card-in-hand')
                }
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= calculateExtraCardInHandCost(extraCardsInHand) &&
                    extraCardsInHand < currentMode.shop.extraCardInHand.maxPurchases &&
                    !isPurchased('extra-card-in-hand')
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {extraCardsInHand >= currentMode.shop.extraCardInHand.maxPurchases
                  ? 'Max Purchased'
                  : isPurchased('extra-card-in-hand')
                    ? 'Purchased This Visit'
                    : `${formatCredits(calculateExtraCardInHandCost(extraCardsInHand))} Credits`}
              </button>
            </div>
          )}

          {/* Remove Single Dead Card */}
          {deadCards.length > 0 && isOptionAvailable('remove-single-dead-card') && (
            <div className="border-2 border-white rounded-lg p-6 bg-red-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-white">Remove Dead Card</h3>
                <span className="text-red-200">1/{deadCards.length}</span>
              </div>
              <p className="text-red-100 mb-4">Permanently remove one dead card from deck</p>
              <button
                onClick={() => {
                  onRemoveSingleDeadCard();
                  markPurchased('remove-single-dead-card');
                }}
                disabled={
                  credits < singleDeadCardRemovalCost || isPurchased('remove-single-dead-card')
                }
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= singleDeadCardRemovalCost && !isPurchased('remove-single-dead-card')
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('remove-single-dead-card')
                  ? 'Already Purchased'
                  : `${singleDeadCardRemovalCost} Credits`}
              </button>
            </div>
          )}

          {/* Remove All Dead Cards */}
          {deadCards.length > 0 && isOptionAvailable('remove-all-dead-cards') && (
            <div className="border-2 border-white rounded-lg p-6 bg-red-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-white">Remove All Dead Cards</h3>
                <span className="text-red-200">{deadCards.length} total</span>
              </div>
              <p className="text-red-100 mb-4">Remove all {deadCards.length} dead cards at once</p>
              <button
                onClick={() => {
                  onRemoveAllDeadCards();
                  markPurchased('remove-all-dead-cards');
                }}
                disabled={credits < allDeadCardsRemovalCost || isPurchased('remove-all-dead-cards')}
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= allDeadCardsRemovalCost && !isPurchased('remove-all-dead-cards')
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('remove-all-dead-cards')
                  ? 'Already Purchased'
                  : `${allDeadCardsRemovalCost} Credits`}
              </button>
            </div>
          )}

          {/* Increase Devil's Deal Chance */}
          {devilsDealConfig && isOptionAvailable('devils-deal-chance') && (
            <div className="border-2 border-white rounded-lg p-6 bg-purple-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
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
                onClick={() => {
                  onPurchaseDevilsDealChance();
                  markPurchased('devils-deal-chance');
                }}
                disabled={
                  credits < devilsDealChanceCost ||
                  devilsDealChancePurchases >= devilsDealConfig.maxChancePurchases ||
                  isPurchased('devils-deal-chance')
                }
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= devilsDealChanceCost &&
                    devilsDealChancePurchases < devilsDealConfig.maxChancePurchases &&
                    !isPurchased('devils-deal-chance')
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('devils-deal-chance')
                  ? 'Already Purchased'
                  : devilsDealChancePurchases >= devilsDealConfig.maxChancePurchases
                  ? 'Maximum Purchases Reached'
                  : `${devilsDealChanceCost} Credits`}
              </button>
            </div>
          )}

          {/* Reduce Devil's Deal Cost */}
          {devilsDealConfig && isOptionAvailable('devils-deal-cost-reduction') && (
            <div className="border-2 border-white rounded-lg p-6 bg-purple-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
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
                onClick={() => {
                  onPurchaseDevilsDealCostReduction();
                  markPurchased('devils-deal-cost-reduction');
                }}
                disabled={
                  credits < devilsDealCostReductionCost ||
                  devilsDealCostReductionPurchases >= devilsDealConfig.maxCostReductionPurchases ||
                  isPurchased('devils-deal-cost-reduction')
                }
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= devilsDealCostReductionCost &&
                    devilsDealCostReductionPurchases < devilsDealConfig.maxCostReductionPurchases &&
                    !isPurchased('devils-deal-cost-reduction')
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('devils-deal-cost-reduction')
                  ? 'Already Purchased'
                  : devilsDealCostReductionPurchases >= devilsDealConfig.maxCostReductionPurchases
                  ? 'Maximum Purchases Reached'
                  : `${devilsDealCostReductionCost} Credits`}
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

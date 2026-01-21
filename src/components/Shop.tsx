import { useState } from 'react';
import {
  calculateWildCardCost,
  calculateSingleDeadCardRemovalCost,
  calculateAllDeadCardsRemovalCost,
} from '../utils/config';
import { gameConfig, getCurrentGameMode } from '../config/gameConfig';
import { ShopOptionType } from '../types';

interface ShopProps {
  credits: number;
  handCount: number;
  deadCards: { id: string }[];
  deadCardRemovalCount: number;
  wildCards: { id: string }[];
  wildCardCount: number;
  extraDrawPurchased: boolean;
  selectedShopOptions: ShopOptionType[];
  onAddDeadCard: () => void;
  onRemoveSingleDeadCard: () => void;
  onRemoveAllDeadCards: () => void;
  onAddWildCard: () => void;
  onPurchaseExtraDraw: () => void;
  onAddParallelHandsBundle: (bundleSize: number) => void;
  onClose: () => void;
}

export function Shop({
  credits,
  handCount,
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

  // Helper function to check if an option should be shown
  const isOptionAvailable = (optionType: ShopOptionType): boolean => {
    return selectedShopOptions.includes(optionType);
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

        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-800">
            Credits: <span className="text-green-600">{credits}</span>
          </p>
        </div>

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
                disabled={credits < calculateBundleCost(5) || isPurchased('parallel-hands-bundle-5')}
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= calculateBundleCost(5) && !isPurchased('parallel-hands-bundle-5')
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('parallel-hands-bundle-5') ? 'Already Purchased' : `${calculateBundleCost(5)} Credits`}
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
                disabled={credits < calculateBundleCost(10) || isPurchased('parallel-hands-bundle-10')}
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= calculateBundleCost(10) && !isPurchased('parallel-hands-bundle-10')
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('parallel-hands-bundle-10') ? 'Already Purchased' : `${calculateBundleCost(10)} Credits`}
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
                disabled={credits < calculateBundleCost(25) || isPurchased('parallel-hands-bundle-25')}
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= calculateBundleCost(25) && !isPurchased('parallel-hands-bundle-25')
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('parallel-hands-bundle-25') ? 'Already Purchased' : `${calculateBundleCost(25)} Credits`}
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
                disabled={credits < calculateBundleCost(50) || isPurchased('parallel-hands-bundle-50')}
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= calculateBundleCost(50) && !isPurchased('parallel-hands-bundle-50')
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('parallel-hands-bundle-50') ? 'Already Purchased' : `${calculateBundleCost(50)} Credits`}
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
                Add a non-counting card. Get {currentMode.shop.deadCard.creditReward} credits
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
                  : `Gain ${currentMode.shop.deadCard.creditReward} Credits`}
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
                  credits < wildCardCost || wildCardCount >= currentMode.shop.wildCard.maxCount || isPurchased('wild-card')
                }
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= wildCardCost && wildCardCount < currentMode.shop.wildCard.maxCount && !isPurchased('wild-card')
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('wild-card')
                  ? 'Already Purchased'
                  : `${wildCardCost} Credits${wildCardCount >= currentMode.shop.wildCard.maxCount ? ' (Max)' : ''}`}
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
                disabled={credits < currentMode.shop.extraDraw.cost || extraDrawPurchased || isPurchased('extra-draw')}
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= currentMode.shop.extraDraw.cost && !extraDrawPurchased && !isPurchased('extra-draw')
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
                disabled={credits < singleDeadCardRemovalCost || isPurchased('remove-single-dead-card')}
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= singleDeadCardRemovalCost && !isPurchased('remove-single-dead-card')
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased('remove-single-dead-card') ? 'Already Purchased' : `${singleDeadCardRemovalCost} Credits`}
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
                {isPurchased('remove-all-dead-cards') ? 'Already Purchased' : `${allDeadCardsRemovalCost} Credits`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

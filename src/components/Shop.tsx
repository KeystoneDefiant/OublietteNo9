import {
  calculateWildCardCost,
  calculateSingleDeadCardRemovalCost,
  calculateAllDeadCardsRemovalCost,
  calculateHandCountCost,
  calculateParallelHandsBundleCost,
} from '../utils/config';
import { gameConfig, getCurrentGameMode } from '../config/gameConfig';

interface ShopProps {
  credits: number;
  handCount: number;
  deadCards: { id: string }[];
  deadCardRemovalCount: number;
  wildCards: { id: string }[];
  wildCardCount: number;
  extraDrawPurchased: boolean;
  onUpgradeHandCount: (cost: number) => void;
  onAddDeadCard: () => void;
  onRemoveSingleDeadCard: () => void;
  onRemoveAllDeadCards: () => void;
  onAddWildCard: () => void;
  onPurchaseExtraDraw: () => void;
  onAddParallelHandsBundle: () => void;
  onClose: () => void;
}

export function Shop({
  credits,
  handCount,
  deadCards,
  deadCardRemovalCount,
  wildCardCount,
  extraDrawPurchased,
  onUpgradeHandCount,
  onAddDeadCard,
  onRemoveSingleDeadCard,
  onRemoveAllDeadCards,
  onAddWildCard,
  onPurchaseExtraDraw,
  onAddParallelHandsBundle,
  onClose,
}: ShopProps) {
  const currentMode = getCurrentGameMode();

  // Calculate costs
  const handCountCost = calculateHandCountCost(handCount);
  const singleDeadCardRemovalCost = calculateSingleDeadCardRemovalCost(deadCardRemovalCount);
  const allDeadCardsRemovalCost = calculateAllDeadCardsRemovalCost(
    deadCardRemovalCount,
    deadCards.length
  );
  const wildCardCost = calculateWildCardCost(wildCardCount);
  const parallelHandsBundleCost = calculateParallelHandsBundleCost(handCount);

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
          {/* Parallel Hands Upgrade */}
          <div className="border-2 border-white rounded-lg p-6 bg-blue-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Parallel Hands (+1)</h3>
              <span className="text-blue-200">Current: {handCount}</span>
            </div>
            <p className="text-blue-100 mb-4">
              Increase the number of parallel hands drawn per round
            </p>
            <button
              onClick={() => onUpgradeHandCount(handCountCost)}
              disabled={credits < handCountCost}
              className={`
                w-full py-3 px-4 rounded-lg font-bold transition-colors
                ${
                  credits >= handCountCost
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {handCountCost} Credits
            </button>
          </div>

          {/* Parallel Hands Bundle */}
          <div className="border-2 border-white rounded-lg p-6 bg-blue-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">
                Parallel Hands Bundle (+{gameConfig.gameRules.bundleHandCount})
              </h3>
              <span className="text-blue-200">Bulk Save</span>
            </div>
            <p className="text-blue-100 mb-4">
              Add {gameConfig.gameRules.bundleHandCount} hands at a bundled discount
            </p>
            <button
              onClick={onAddParallelHandsBundle}
              disabled={credits < parallelHandsBundleCost}
              className={`
                w-full py-3 px-4 rounded-lg font-bold transition-colors
                ${
                  credits >= parallelHandsBundleCost
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {parallelHandsBundleCost} Credits
            </button>
          </div>

          {/* Add Dead Card */}
          <div className="border-2 border-white rounded-lg p-6 bg-purple-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Add Dead Card</h3>
            </div>
            <p className="text-purple-100 mb-4">
              Add a non-counting card. Get {currentMode.shop.deadCard.creditReward} credits
            </p>
            <button
              onClick={onAddDeadCard}
              className="w-full py-3 px-4 rounded-lg font-bold transition-colors bg-purple-600 hover:bg-purple-700 text-white"
            >
              Gain {currentMode.shop.deadCard.creditReward} Credits
            </button>
          </div>

          {/* Wild Card */}
          <div className="border-2 border-white rounded-lg p-6 bg-orange-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Add Wild Card</h3>
              <span className="text-orange-200">{wildCardCount}/3</span>
            </div>
            <p className="text-orange-100 mb-4">
              Add a card that counts as any rank and suit (max 3)
            </p>
            <button
              onClick={onAddWildCard}
              disabled={
                credits < wildCardCost || wildCardCount >= currentMode.shop.wildCard.maxCount
              }
              className={`
                w-full py-3 px-4 rounded-lg font-bold transition-colors
                ${
                  credits >= wildCardCost && wildCardCount < currentMode.shop.wildCard.maxCount
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {wildCardCost} Credits{' '}
              {wildCardCount >= currentMode.shop.wildCard.maxCount && '(Max)'}
            </button>
          </div>

          {/* Extra Draw */}
          <div className="border-2 border-white rounded-lg p-6 bg-indigo-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Extra Draw</h3>
            </div>
            <p className="text-indigo-100 mb-4">
              Redraw 4 cards while holding 1 (one-time purchase)
            </p>
            <button
              onClick={onPurchaseExtraDraw}
              disabled={credits < currentMode.shop.extraDraw.cost || extraDrawPurchased}
              className={`
                w-full py-3 px-4 rounded-lg font-bold transition-colors
                ${
                  credits >= currentMode.shop.extraDraw.cost && !extraDrawPurchased
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {extraDrawPurchased
                ? 'Already Purchased'
                : `${currentMode.shop.extraDraw.cost} Credits`}
            </button>
          </div>

          {/* Remove Single Dead Card */}
          {deadCards.length > 0 && (
            <div className="border-2 border-white rounded-lg p-6 bg-red-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-white">Remove Dead Card</h3>
                <span className="text-red-200">1/{deadCards.length}</span>
              </div>
              <p className="text-red-100 mb-4">Permanently remove one dead card from deck</p>
              <button
                onClick={onRemoveSingleDeadCard}
                disabled={credits < singleDeadCardRemovalCost}
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= singleDeadCardRemovalCost
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {singleDeadCardRemovalCost} Credits
              </button>
            </div>
          )}

          {/* Remove All Dead Cards */}
          {deadCards.length > 0 && (
            <div className="border-2 border-white rounded-lg p-6 bg-red-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-white">Remove All Dead Cards</h3>
                <span className="text-red-200">{deadCards.length} total</span>
              </div>
              <p className="text-red-100 mb-4">Remove all {deadCards.length} dead cards at once</p>
              <button
                onClick={onRemoveAllDeadCards}
                disabled={credits < allDeadCardsRemovalCost}
                className={`
                  w-full py-3 px-4 rounded-lg font-bold transition-colors
                  ${
                    credits >= allDeadCardsRemovalCost
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {allDeadCardsRemovalCost} Credits
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

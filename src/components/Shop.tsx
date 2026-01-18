import { useState } from 'react';
import { HandRank, RewardTable, Card } from '../types';
import { CardSelector } from './CardSelector';
import {
  config,
  calculateWildCardCost,
  calculateCardRemovalCost,
  calculateRewardUpgradeCost,
  calculateHandCountCost,
} from '../utils/config';

interface ShopProps {
  credits: number;
  handCount: number;
  rewardTable: RewardTable;
  removedCards: Card[];
  deadCards: Card[];
  wildCards: Card[];
  cardRemovalCount: number;
  wildCardCount: number;
  random2xChance: number;
  minimumBet: number;
  selectedHandCount: number;
  extraDrawPurchased: boolean;
  onUpgradeHandCount: (cost: number) => void;
  onUpgradeReward: (rank: HandRank, cost: number) => void;
  onAddDeadCard: () => void;
  onRemoveCard: (card: Card) => void;
  onAddWildCard: () => void;
  onIncrease2xChance: () => void;
  onPurchaseExtraDraw: () => void;
  onClose: () => void;
}

const RANK_LABELS: { [key in HandRank]: string } = {
  'royal-flush': 'Royal Flush',
  'straight-flush': 'Straight Flush',
  'four-of-a-kind': 'Four of a Kind',
  'full-house': 'Full House',
  flush: 'Flush',
  straight: 'Straight',
  'three-of-a-kind': 'Three of a Kind',
  'two-pair': 'Two Pair',
  'one-pair': 'One Pair',
  'high-card': 'High Card',
};

const RANK_ORDER: HandRank[] = [
  'royal-flush',
  'straight-flush',
  'four-of-a-kind',
  'full-house',
  'flush',
  'straight',
  'three-of-a-kind',
  'two-pair',
  'one-pair',
  'high-card',
];

export function Shop({
  credits,
  handCount,
  rewardTable,
  removedCards,
  deadCards,
  wildCards,
  cardRemovalCount,
  wildCardCount,
  random2xChance,
  minimumBet,
  selectedHandCount,
  extraDrawPurchased,
  onUpgradeHandCount,
  onUpgradeReward,
  onAddDeadCard,
  onRemoveCard,
  onAddWildCard,
  onIncrease2xChance,
  onPurchaseExtraDraw,
  onClose,
}: ShopProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const handCountCost = calculateHandCountCost(handCount);

  // Check if purchase would cause game over
  const canAffordPurchase = (cost: number): boolean => {
    const newCredits = credits - cost;
    return newCredits >= minimumBet * selectedHandCount;
  };

  const handleUpgradeReward = (rank: HandRank, cost: number) => {
    if (!canAffordPurchase(cost)) {
      setPurchaseError(
        `This purchase would leave you unable to afford a hand at the minimum bet (${minimumBet * selectedHandCount} credits required).`
      );
      return;
    }
    setPurchaseError(null);
    onUpgradeReward(rank, cost);
  };

  // Calculate costs using config
  const removalCost = calculateCardRemovalCost(cardRemovalCount);
  const wildCardCost = calculateWildCardCost(wildCardCount);

  // Generate all cards for selection (standard + dead + wild)
  const allCards: Card[] = [];
  const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = [
    'hearts',
    'diamonds',
    'clubs',
    'spades',
  ];
  const ranks: Array<'2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'> =
    ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  // Add standard 52 cards
  for (const suit of suits) {
    for (const rank of ranks) {
      allCards.push({
        suit,
        rank,
        id: `${suit}-${rank}`,
      });
    }
  }

  // Add dead cards and wild cards so they can be removed
  allCards.push(...deadCards);
  allCards.push(...wildCards);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Shop</h2>
        </div>

        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-800">
            Credits: <span className="text-green-600">{credits}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* Hand Count Upgrade */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-800">Parallel Hands</h3>
              <span className="text-gray-600">Current: {handCount}</span>
            </div>
            <p className="text-gray-600 mb-3">Increase the number of parallel hands drawn</p>
            <button
              onClick={() => onUpgradeHandCount(handCountCost)}
              disabled={credits < handCountCost}
              className={`
                w-full py-3 px-4 rounded-lg font-bold transition-colors
                ${
                  credits >= handCountCost
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Upgrade (+1 Hand) - {handCountCost} Credits
            </button>
          </div>

          {/* Dead Card */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-800">Add Dead Card</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Add a card to the deck that does not count toward any poker hand. You receive{' '}
              {config.shop.deadCard.baseCost} credits.
            </p>
            <button
              onClick={onAddDeadCard}
              className="w-full py-3 px-4 rounded-lg font-bold transition-colors bg-purple-600 hover:bg-purple-700 text-white"
            >
              Add Dead Card - Receive {config.shop.deadCard.baseCost} Credits
            </button>
          </div>

          {/* Wild Card */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-800">Add Wild Card</h3>
              <span className="text-gray-600">Current: {wildCardCount}/3</span>
            </div>
            <p className="text-gray-600 mb-3">
              Add a card that counts as all suits and all ranks (max 3)
            </p>
            <button
              onClick={onAddWildCard}
              disabled={credits < wildCardCost || wildCardCount >= config.shop.wildCard.maxCount}
              className={`
                w-full py-3 px-4 rounded-lg font-bold transition-colors
                ${
                  credits >= wildCardCost && wildCardCount < config.shop.wildCard.maxCount
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Add Wild Card - {wildCardCost} Credits{' '}
              {wildCardCount >= config.shop.wildCard.maxCount ? '(Max Reached)' : ''}
            </button>
          </div>

          {/* Card Removal */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-800">Remove Card</h3>
              <span className="text-gray-600">Cost: {removalCost} Credits</span>
            </div>
            <p className="text-gray-600 mb-3">
              Permanently remove a card from the deck (cost increases by 5% per removal)
            </p>
            <CardSelector
              cards={allCards}
              selectedCard={selectedCard}
              onSelectCard={setSelectedCard}
              removedCards={removedCards}
            />
            <button
              onClick={() => {
                if (selectedCard) {
                  onRemoveCard(selectedCard);
                  setSelectedCard(null);
                }
              }}
              disabled={credits < removalCost || !selectedCard}
              className={`
                w-full mt-3 py-3 px-4 rounded-lg font-bold transition-colors
                ${
                  credits >= removalCost && selectedCard
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Remove Selected Card - {removalCost} Credits
            </button>
          </div>

          {/* Extra Draw */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-800">Extra Draw</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Purchase the ability to draw twice per hand. After the first draw, you can re-hold
              cards and draw again. (One-time purchase)
            </p>
            <button
              onClick={onPurchaseExtraDraw}
              disabled={credits < config.shop.extraDraw.cost || extraDrawPurchased}
              className={`
                w-full py-3 px-4 rounded-lg font-bold transition-colors
                ${
                  credits >= config.shop.extraDraw.cost && !extraDrawPurchased
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {extraDrawPurchased
                ? 'Already Purchased'
                : `Buy Extra Draw - ${config.shop.extraDraw.cost} Credits`}
            </button>
          </div>

          {/* 2x Chance Upgrade */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-800">Increase 2x Payout Chance</h3>
              <span className="text-gray-600">Current: {random2xChance}%</span>
            </div>
            <p className="text-gray-600 mb-3">
              Increase chance for 2x payout on any hand (+5% per purchase, max 25%)
            </p>
            <button
              onClick={onIncrease2xChance}
              disabled={
                credits < config.shop['2xChance'].baseCost ||
                random2xChance >= config.shop['2xChance'].maxChance
              }
              className={`
                w-full py-3 px-4 rounded-lg font-bold transition-colors
                ${
                  credits >= config.shop['2xChance'].baseCost &&
                  random2xChance < config.shop['2xChance'].maxChance
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Increase 2x Chance (+{config.shop['2xChance'].increaseAmount}%) -{' '}
              {config.shop['2xChance'].baseCost} Credits{' '}
              {random2xChance >= config.shop['2xChance'].maxChance ? '(Max Reached)' : ''}
            </button>
          </div>

          {/* Reward Table Upgrades */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reward Upgrades</h3>
            {purchaseError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{purchaseError}</p>
              </div>
            )}
            <div className="space-y-2">
              {RANK_ORDER.filter((rank) => rank !== 'high-card').map((rank) => {
                const currentMultiplier = rewardTable[rank] || 0;
                const cost = calculateRewardUpgradeCost(currentMultiplier);
                const canAfford = credits >= cost && canAffordPurchase(cost);
                return (
                  <div
                    key={rank}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-700">{RANK_LABELS[rank]}</span>
                      <span className="ml-2 text-gray-500">(Current: ×{currentMultiplier})</span>
                    </div>
                    <button
                      onClick={() => handleUpgradeReward(rank, cost)}
                      disabled={!canAfford}
                      className={`
                        px-4 py-2 rounded-lg font-bold text-sm transition-colors
                        ${
                          canAfford
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      +1 ({cost})
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

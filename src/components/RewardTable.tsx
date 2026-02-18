import { useState, useEffect, useRef } from 'react';
import { RewardTable as RewardTableType, HandRank } from '../types';

interface RewardTableProps {
  rewardTable: RewardTableType;
  highlightedRank?: HandRank | null;
  payoutAmount?: number;
  wildCardCount?: number;
}

const RANK_LABELS: { [key in HandRank]: string } = {
  'royal-flush': 'Royal Flush',
  'straight-flush': 'Straight Flush',
  'five-of-a-kind': 'Five of a Kind',
  'four-of-a-kind': 'Four of a Kind',
  'full-house': 'Full House',
  flush: 'Flush',
  straight: 'Straight',
  'three-of-a-kind': 'Three of a Kind',
  'two-pair': 'Two Pair',
  'one-pair': 'One Pair (Jacks or Better)',
  'high-card': 'High Card',
};

const RANK_ORDER: HandRank[] = [
  'royal-flush',
  'straight-flush',
  'five-of-a-kind',
  'four-of-a-kind',
  'full-house',
  'flush',
  'straight',
  'three-of-a-kind',
  'two-pair',
  'one-pair',
  'high-card',
];

export function RewardTable({
  rewardTable,
  highlightedRank,
  payoutAmount,
  wildCardCount = 0,
}: RewardTableProps) {
  const [showPopup, setShowPopup] = useState(false);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightedRank && payoutAmount) {
      setShowPopup(true);
      const timer = setTimeout(() => setShowPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightedRank, payoutAmount]);

  // Filter ranks: only show five-of-a-kind if player has wild cards
  const visibleRanks =
    wildCardCount > 0 ? RANK_ORDER : RANK_ORDER.filter((rank) => rank !== 'five-of-a-kind');

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full overflow-y-auto relative">
      <div className="space-y-2">
        {visibleRanks.map((rank) => {
          const multiplier = rewardTable[rank] || 0;
          const isHighlighted = highlightedRank === rank;
          return (
            <div
              key={rank}
              ref={isHighlighted ? highlightRef : null}
              className={`
                flex justify-between items-center p-3 rounded-lg transition-all relative
                ${
                  isHighlighted
                    ? 'bg-green-200 border-2 border-green-500 payout-highlight'
                    : 'bg-gray-50 hover:bg-gray-100'
                }
              `}
            >
              <span className="font-medium text-gray-700">{RANK_LABELS[rank]}</span>
              <span className="font-bold text-green-600">
                {multiplier > 0 ? `×${multiplier}` : '—'}
              </span>
              {isHighlighted && showPopup && payoutAmount && (
                <div
                  className="credit-popup absolute left-1/2 -top-12 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg whitespace-nowrap"
                  style={{
                    animation: 'creditFloat 1s ease-out forwards',
                  }}
                >
                  +{payoutAmount} Credits
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

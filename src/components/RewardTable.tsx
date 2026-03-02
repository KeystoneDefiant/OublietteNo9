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

const RANK_TOOLTIPS: { [key in HandRank]: string } = {
  'royal-flush': '10, J, Q, K, A of same suit',
  'straight-flush': '5 consecutive cards of same suit',
  'five-of-a-kind': '5 of same rank (requires wild cards)',
  'four-of-a-kind': '4 cards of same rank',
  'full-house': '3 of a kind + pair',
  flush: '5 cards of same suit',
  straight: '5 consecutive cards (any suit)',
  'three-of-a-kind': '3 cards of same rank',
  'two-pair': '2 pairs of same rank',
  'one-pair': '2 cards of same rank (Jacks or higher)',
  'high-card': 'Highest card when no other hand',
};

const RANK_ORDER: HandRank[] = [
  'royal-flush',
  'five-of-a-kind',
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
    <div className="game-panel rounded-xl p-4 sm:p-6 h-full overflow-y-auto relative">
      <div className="space-y-2">
        {visibleRanks.map((rank) => {
          const multiplier = rewardTable[rank] || 0;
          const isHighlighted = highlightedRank === rank;
          return (
            <div
              key={rank}
              ref={isHighlighted ? highlightRef : null}
              title={RANK_TOOLTIPS[rank]}
              className={`
                flex justify-between items-center p-3 rounded-lg transition-all relative
                ${
                  isHighlighted
                    ? 'border-2 payout-highlight'
                    : 'game-panel-muted hover:opacity-90'
                }
              `}
            >
              <span className="font-medium" style={{ color: 'var(--game-text)' }}>{RANK_LABELS[rank]}</span>
              <span className="font-bold" style={{ color: 'var(--game-accent-gold)' }}>
                {multiplier > 0 ? `×${multiplier}` : '—'}
              </span>
              {isHighlighted && showPopup && payoutAmount && (
                <div
                  className="credit-popup absolute left-1/2 -top-12 transform -translate-x-1/2 px-4 py-2 rounded-lg font-bold shadow-lg whitespace-nowrap"
                  style={{
                    backgroundColor: 'var(--game-accent-gold-dim)',
                    color: 'var(--game-text)',
                    border: '2px solid var(--game-accent-gold)',
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

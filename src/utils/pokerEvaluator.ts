import { Card, HandResult } from '../types';
import { gameConfig } from '../config/gameConfig';

const RANK_VALUES: { [key: string]: number } = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

export class PokerEvaluator {
  /**
   * Evaluates a 5-card hand and returns the hand result
   */
  static evaluate(hand: Card[]): HandResult {
    if (hand.length !== 5) {
      throw new Error('Hand must contain exactly 5 cards');
    }

    // Filter out dead cards before evaluation - dead cards don't invalidate the hand,
    // they're simply ignored and don't count toward hand calculation
    const activeHand = hand.filter((card) => !card.isDead);

    // If we have no active cards, return high card
    if (activeHand.length === 0) {
      return {
        rank: 'high-card',
        multiplier: 0,
        score: 0,
        winningCards: [],
      };
    }

    // Separate wild cards from regular cards
    const wildCards = activeHand.filter((card) => card.isWild);
    const regularCards = activeHand.filter((card) => !card.isWild);

    // If we have wild cards, evaluate with best possible hand
    if (wildCards.length > 0) {
      return this.evaluateWithWildCards(regularCards, wildCards);
    }

    const sortedHand = [...activeHand].sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank]);

    const rankCounts = this.getRankCounts(sortedHand);
    const suitCounts = this.getSuitCounts(sortedHand);
    const ranks = sortedHand.map((c) => RANK_VALUES[c.rank]);
    // Flush requires all cards to be same suit (only check if we have 5 active cards)
    const isFlush =
      activeHand.length === 5 && Object.values(suitCounts).some((count) => count === 5);
    // Straight requires 5 cards in sequence (only check if we have 5 active cards)
    const isStraight = activeHand.length === 5 && this.isStraight(ranks);
    const isRoyal = isStraight && ranks.length === 5 && ranks[0] === 10 && ranks[4] === 14;

    // Royal Flush
    if (isRoyal && isFlush) {
      return {
        rank: 'royal-flush',
        multiplier: 0, // Set by reward table
        score: 10000,
        winningCards: sortedHand,
      };
    }

    // Straight Flush
    if (isStraight && isFlush) {
      return {
        rank: 'straight-flush',
        multiplier: 0,
        score: 9000 + ranks[4],
        winningCards: sortedHand,
      };
    }

    // Four of a Kind
    const fourKind = Object.entries(rankCounts).find(([_, count]) => count === 4);
    if (fourKind) {
      const quadRank = parseInt(fourKind[0]);
      return {
        rank: 'four-of-a-kind',
        multiplier: 0,
        score: 8000 + quadRank,
        winningCards: sortedHand,
      };
    }

    // Full House
    const threeKind = Object.entries(rankCounts).find(([_, count]) => count === 3);
    const pair = Object.entries(rankCounts).find(([_, count]) => count === 2);
    if (threeKind && pair) {
      return {
        rank: 'full-house',
        multiplier: 0,
        score: 7000 + parseInt(threeKind[0]),
        winningCards: sortedHand,
      };
    }

    // Flush
    if (isFlush) {
      return {
        rank: 'flush',
        multiplier: 0,
        score: 6000 + ranks[4],
        winningCards: sortedHand,
      };
    }

    // Straight
    if (isStraight) {
      return {
        rank: 'straight',
        multiplier: 0,
        score: 5000 + ranks[4],
        winningCards: sortedHand,
      };
    }

    // Three of a Kind
    if (threeKind) {
      return {
        rank: 'three-of-a-kind',
        multiplier: 0,
        score: 4000 + parseInt(threeKind[0]),
        winningCards: sortedHand,
      };
    }

    // Two Pair
    const pairs = Object.entries(rankCounts).filter(([_, count]) => count === 2);
    if (pairs.length === 2) {
      const highPair = Math.max(parseInt(pairs[0][0]), parseInt(pairs[1][0]));
      return {
        rank: 'two-pair',
        multiplier: 0,
        score: 3000 + highPair,
        winningCards: sortedHand,
      };
    }

    // One Pair (jacks or better only)
    if (pair) {
      const pairRank = parseInt(pair[0]);
      // Only score pairs at or above the minimum pair rank (e.g., Jacks or Better)
      if (pairRank >= gameConfig.gameRules.minimumPairRank) {
        return {
          rank: 'one-pair',
          multiplier: 0,
          score: 2000 + pairRank,
          winningCards: sortedHand,
        };
      }
      // Lower pairs fall through to high card
    }

    // High Card
    const highestRank = ranks.length > 0 ? ranks[ranks.length - 1] : 0;
    return {
      rank: 'high-card',
      multiplier: 0,
      score: 1000 + highestRank,
      winningCards: sortedHand,
    };
  }

  /**
   * Evaluates a regular hand (no wild cards)
   */
  private static evaluateRegularHand(hand: Card[]): HandResult {
    const sortedHand = [...hand].sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank]);

    const rankCounts = this.getRankCounts(sortedHand);
    const suitCounts = this.getSuitCounts(sortedHand);
    const ranks = sortedHand.map((c) => RANK_VALUES[c.rank]);
    const isFlush = Object.values(suitCounts).some((count) => count === 5);
    const isStraight = this.isStraight(ranks);
    const isRoyal = isStraight && ranks[0] === 10 && ranks[4] === 14;

    // Royal Flush
    if (isRoyal && isFlush) {
      return {
        rank: 'royal-flush',
        multiplier: 0,
        score: 10000,
        winningCards: sortedHand,
      };
    }

    // Straight Flush
    if (isStraight && isFlush) {
      return {
        rank: 'straight-flush',
        multiplier: 0,
        score: 9000 + ranks[4],
        winningCards: sortedHand,
      };
    }

    // Four of a Kind
    const fourKind = Object.entries(rankCounts).find(([_, count]) => count === 4);
    if (fourKind) {
      const quadRank = parseInt(fourKind[0]);
      return {
        rank: 'four-of-a-kind',
        multiplier: 0,
        score: 8000 + quadRank,
        winningCards: sortedHand,
      };
    }

    // Full House
    const threeKind = Object.entries(rankCounts).find(([_, count]) => count === 3);
    const pair = Object.entries(rankCounts).find(([_, count]) => count === 2);
    if (threeKind && pair) {
      return {
        rank: 'full-house',
        multiplier: 0,
        score: 7000 + parseInt(threeKind[0]),
        winningCards: sortedHand,
      };
    }

    // Flush
    if (isFlush) {
      return {
        rank: 'flush',
        multiplier: 0,
        score: 6000 + ranks[4],
        winningCards: sortedHand,
      };
    }

    // Straight
    if (isStraight) {
      return {
        rank: 'straight',
        multiplier: 0,
        score: 5000 + ranks[4],
        winningCards: sortedHand,
      };
    }

    // Three of a Kind
    if (threeKind) {
      return {
        rank: 'three-of-a-kind',
        multiplier: 0,
        score: 4000 + parseInt(threeKind[0]),
        winningCards: sortedHand,
      };
    }

    // Two Pair
    const pairs = Object.entries(rankCounts).filter(([_, count]) => count === 2);
    if (pairs.length === 2) {
      const highPair = Math.max(parseInt(pairs[0][0]), parseInt(pairs[1][0]));
      return {
        rank: 'two-pair',
        multiplier: 0,
        score: 3000 + highPair,
        winningCards: sortedHand,
      };
    }

    // One Pair (jacks or better only)
    if (pair) {
      const pairRank = parseInt(pair[0]);
      if (pairRank >= 11) {
        return {
          rank: 'one-pair',
          multiplier: 0,
          score: 2000 + pairRank,
          winningCards: sortedHand,
        };
      }
    }

    // High Card
    return {
      rank: 'high-card',
      multiplier: 0,
      score: 1000 + ranks[4],
      winningCards: sortedHand,
    };
  }

  private static getRankCounts(hand: Card[]): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    for (const card of hand) {
      const rankValue = RANK_VALUES[card.rank].toString();
      counts[rankValue] = (counts[rankValue] || 0) + 1;
    }
    return counts;
  }

  private static getSuitCounts(hand: Card[]): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    for (const card of hand) {
      counts[card.suit] = (counts[card.suit] || 0) + 1;
    }
    return counts;
  }

  private static isStraight(ranks: number[]): boolean {
    // Check for regular straight
    for (let i = 1; i < ranks.length; i++) {
      if (ranks[i] !== ranks[i - 1] + 1) {
        // Check for A-2-3-4-5 straight (wheel)
        if (
          ranks[0] === 2 &&
          ranks[1] === 3 &&
          ranks[2] === 4 &&
          ranks[3] === 5 &&
          ranks[4] === 14
        ) {
          return true;
        }
        return false;
      }
    }
    return true;
  }

  /**
   * Applies reward table multipliers to hand results
   */
  static applyRewards(result: HandResult, rewardTable: { [key: string]: number }): HandResult {
    return {
      ...result,
      multiplier: rewardTable[result.rank] || 0,
    };
  }

  /**
   * Evaluates hand with wild cards by trying to form the best possible hand
   */
  private static evaluateWithWildCards(regularCards: Card[], wildCards: Card[]): HandResult {
    const numWilds = wildCards.length;
    const numRegular = regularCards.length;

    // Try to form the best possible hand
    // Strategy: Try royal flush, straight flush, four of a kind, etc.

    // For simplicity, we'll try a few key patterns
    // Royal Flush attempt (A, K, Q, J, 10 of same suit)
    if (numRegular + numWilds === 5) {
      const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = [
        'hearts',
        'diamonds',
        'clubs',
        'spades',
      ];
      const royalRanks: Array<'10' | 'J' | 'Q' | 'K' | 'A'> = ['10', 'J', 'Q', 'K', 'A'];

      for (const suit of suits) {
        const needed = royalRanks.filter(
          (r) => !regularCards.some((c) => c.rank === r && c.suit === suit)
        );
        if (needed.length <= numWilds) {
          const expanded: Card[] = [...regularCards];
          for (let i = 0; i < needed.length; i++) {
            expanded.push({
              suit,
              rank: needed[i],
              id: `wild-${i}`,
              isWild: true,
            });
          }
          // Fill remaining wilds with any card
          for (let i = needed.length; i < numWilds; i++) {
            expanded.push({
              suit,
              rank: 'A',
              id: `wild-${i}`,
              isWild: true,
            });
          }
          const result = this.evaluateRegularHand(expanded);
          if (result.rank === 'royal-flush') {
            return result;
          }
        }
      }
    }

    // Try four of a kind
    if (numRegular > 0) {
      const rankCounts = this.getRankCounts(regularCards);
      for (const [rank, count] of Object.entries(rankCounts)) {
        if (count + numWilds >= 4) {
          const expanded: Card[] = [...regularCards];
          const needed = 4 - count;
          for (let i = 0; i < needed && i < numWilds; i++) {
            expanded.push({
              suit: 'hearts',
              rank: Object.keys(RANK_VALUES).find((r) => RANK_VALUES[r] === parseInt(rank)) as any,
              id: `wild-${i}`,
              isWild: true,
            });
          }
          // Fill remaining
          for (let i = needed; i < numWilds; i++) {
            expanded.push({
              suit: 'hearts',
              rank: 'A',
              id: `wild-${i}`,
              isWild: true,
            });
          }
          const result = this.evaluateRegularHand(expanded);
          if (result.rank === 'four-of-a-kind') {
            return result;
          }
        }
      }
    }

    // Try flush
    const suitCounts = this.getSuitCounts(regularCards);
    const mostCommonSuit = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0];
    if (mostCommonSuit && mostCommonSuit[1] + numWilds >= 5) {
      const expanded: Card[] = [...regularCards];
      const suit = mostCommonSuit[0] as 'hearts' | 'diamonds' | 'clubs' | 'spades';
      const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
      for (let i = 0; i < numWilds; i++) {
        const availableRank = ranks.find(
          (r) => !expanded.some((c) => c.rank === r && c.suit === suit)
        );
        expanded.push({
          suit,
          rank: availableRank || 'A',
          id: `wild-${i}`,
          isWild: true,
        });
      }
      const result = this.evaluateRegularHand(expanded);
      if (
        result.rank === 'flush' ||
        result.rank === 'straight-flush' ||
        result.rank === 'royal-flush'
      ) {
        return result;
      }
    }

    // Default: use wilds as high cards
    const expanded: Card[] = [...regularCards];
    for (let i = 0; i < numWilds; i++) {
      expanded.push({
        suit: 'hearts',
        rank: 'A',
        id: `wild-${i}`,
        isWild: true,
      });
    }
    return this.evaluateRegularHand(expanded);
  }
}

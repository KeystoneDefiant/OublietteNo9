import { describe, it, expect } from 'vitest';
import { PokerEvaluator } from '../pokerEvaluator';
import { Card } from '../../types';

// Helper function to create a card
function createCard(rank: Card['rank'], suit: Card['suit'], options?: Partial<Card>): Card {
  return {
    rank,
    suit,
    id: `${rank}-${suit}-${Math.random()}`,
    ...options,
  };
}

describe('PokerEvaluator', () => {
  describe('Royal Flush', () => {
    it('should identify a royal flush', () => {
      const hand: Card[] = [
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createCard('10', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('royal-flush');
      expect(result.winningCards.length).toBe(5);
    });

    it('should identify royal flush in different suit', () => {
      const hand: Card[] = [
        createCard('10', 'spades'),
        createCard('J', 'spades'),
        createCard('Q', 'spades'),
        createCard('K', 'spades'),
        createCard('A', 'spades'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('royal-flush');
    });
  });

  describe('Straight Flush', () => {
    it('should identify a straight flush', () => {
      const hand: Card[] = [
        createCard('5', 'diamonds'),
        createCard('6', 'diamonds'),
        createCard('7', 'diamonds'),
        createCard('8', 'diamonds'),
        createCard('9', 'diamonds'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('straight-flush');
      expect(result.winningCards.length).toBe(5);
    });

    it('should identify a low straight flush (wheel)', () => {
      const hand: Card[] = [
        createCard('A', 'clubs'),
        createCard('2', 'clubs'),
        createCard('3', 'clubs'),
        createCard('4', 'clubs'),
        createCard('5', 'clubs'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('straight-flush');
    });
  });

  describe('Four of a Kind', () => {
    it('should identify four of a kind', () => {
      const hand: Card[] = [
        createCard('7', 'hearts'),
        createCard('7', 'diamonds'),
        createCard('7', 'clubs'),
        createCard('7', 'spades'),
        createCard('K', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('four-of-a-kind');
      expect(result.winningCards.length).toBe(4);
    });

    it('should identify four aces', () => {
      const hand: Card[] = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('A', 'spades'),
        createCard('2', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('four-of-a-kind');
    });
  });

  describe('Full House', () => {
    it('should identify a full house', () => {
      const hand: Card[] = [
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('5', 'spades'),
        createCard('5', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('full-house');
      expect(result.winningCards.length).toBe(5);
    });

    it('should identify full house with different combinations', () => {
      const hand: Card[] = [
        createCard('2', 'hearts'),
        createCard('2', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('Q', 'spades'),
        createCard('Q', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('full-house');
    });
  });

  describe('Flush', () => {
    it('should identify a flush', () => {
      const hand: Card[] = [
        createCard('2', 'hearts'),
        createCard('5', 'hearts'),
        createCard('8', 'hearts'),
        createCard('J', 'hearts'),
        createCard('K', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('flush');
      expect(result.winningCards.length).toBe(5);
    });

    it('should identify flush in spades', () => {
      const hand: Card[] = [
        createCard('3', 'spades'),
        createCard('6', 'spades'),
        createCard('9', 'spades'),
        createCard('Q', 'spades'),
        createCard('A', 'spades'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('flush');
    });
  });

  describe('Straight', () => {
    it('should identify a straight', () => {
      const hand: Card[] = [
        createCard('5', 'hearts'),
        createCard('6', 'diamonds'),
        createCard('7', 'clubs'),
        createCard('8', 'spades'),
        createCard('9', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('straight');
      expect(result.winningCards.length).toBe(5);
    });

    it('should identify a low straight (wheel)', () => {
      const hand: Card[] = [
        createCard('A', 'hearts'),
        createCard('2', 'diamonds'),
        createCard('3', 'clubs'),
        createCard('4', 'spades'),
        createCard('5', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('straight');
    });

    it('should identify a high straight', () => {
      const hand: Card[] = [
        createCard('10', 'hearts'),
        createCard('J', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('K', 'spades'),
        createCard('A', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('straight');
    });
  });

  describe('Three of a Kind', () => {
    it('should identify three of a kind', () => {
      const hand: Card[] = [
        createCard('9', 'hearts'),
        createCard('9', 'diamonds'),
        createCard('9', 'clubs'),
        createCard('K', 'spades'),
        createCard('2', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('three-of-a-kind');
      expect(result.winningCards.length).toBe(3);
    });

    it('should identify three aces', () => {
      const hand: Card[] = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('7', 'spades'),
        createCard('3', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('three-of-a-kind');
    });
  });

  describe('Two Pair', () => {
    it('should identify two pair', () => {
      const hand: Card[] = [
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('5', 'clubs'),
        createCard('5', 'spades'),
        createCard('2', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('two-pair');
      expect(result.winningCards.length).toBe(4);
    });

    it('should identify two pair with aces', () => {
      const hand: Card[] = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('3', 'clubs'),
        createCard('3', 'spades'),
        createCard('7', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('two-pair');
    });
  });

  describe('One Pair', () => {
    it('should identify one pair', () => {
      const hand: Card[] = [
        createCard('J', 'hearts'),
        createCard('J', 'diamonds'),
        createCard('5', 'clubs'),
        createCard('8', 'spades'),
        createCard('2', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('one-pair');
      expect(result.winningCards.length).toBe(2);
    });

    it('should identify pair of aces', () => {
      const hand: Card[] = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('5', 'clubs'),
        createCard('8', 'spades'),
        createCard('2', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('one-pair');
    });
  });

  describe('High Card', () => {
    it('should identify high card', () => {
      const hand: Card[] = [
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('7', 'clubs'),
        createCard('5', 'spades'),
        createCard('2', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('high-card');
      expect(result.winningCards.length).toBeGreaterThan(0);
    });

    it('should handle high card with mixed ranks', () => {
      const hand: Card[] = [
        createCard('9', 'hearts'),
        createCard('7', 'diamonds'),
        createCard('5', 'clubs'),
        createCard('3', 'spades'),
        createCard('2', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('high-card');
    });
  });

  describe('Wild Cards', () => {
    it('should use wild card to create four of a kind', () => {
      const hand: Card[] = [
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('A', 'spades', { isWild: true }),
        createCard('2', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('four-of-a-kind');
    });

    it('should use wild card to create royal flush', () => {
      const hand: Card[] = [
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createCard('2', 'spades', { isWild: true }),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('royal-flush');
    });

    it('should use wild card to create straight flush', () => {
      const hand: Card[] = [
        createCard('5', 'diamonds'),
        createCard('6', 'diamonds'),
        createCard('7', 'diamonds'),
        createCard('8', 'diamonds'),
        createCard('A', 'spades', { isWild: true }),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('straight-flush');
    });

    it('should handle multiple wild cards', () => {
      const hand: Card[] = [
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('A', 'spades', { isWild: true }),
        createCard('2', 'clubs', { isWild: true }),
        createCard('3', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('four-of-a-kind');
    });

    it('should create five of a kind with wild cards', () => {
      const hand: Card[] = [
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('K', 'spades'),
        createCard('A', 'hearts', { isWild: true }),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('five-of-a-kind');
    });
  });

  describe('Dead Cards', () => {
    it('should ignore dead cards in evaluation', () => {
      const hand: Card[] = [
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('5', 'spades', { isDead: true }),
        createCard('2', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('three-of-a-kind');
    });

    it('should handle multiple dead cards', () => {
      const hand: Card[] = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('5', 'clubs', { isDead: true }),
        createCard('8', 'spades', { isDead: true }),
        createCard('2', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('one-pair');
    });

    it('should handle all cards being dead', () => {
      const hand: Card[] = [
        createCard('A', 'hearts', { isDead: true }),
        createCard('K', 'diamonds', { isDead: true }),
        createCard('Q', 'clubs', { isDead: true }),
        createCard('J', 'spades', { isDead: true }),
        createCard('10', 'hearts', { isDead: true }),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('high-card');
      expect(result.score).toBe(0);
      expect(result.winningCards.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should throw error for hands with less than 5 cards', () => {
      const hand: Card[] = [
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('Q', 'clubs'),
      ];
      expect(() => PokerEvaluator.evaluate(hand)).toThrow('Hand must contain exactly 5 cards');
    });

    it('should throw error for hands with more than 5 cards', () => {
      const hand: Card[] = [
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('J', 'spades'),
        createCard('10', 'hearts'),
        createCard('9', 'diamonds'),
      ];
      expect(() => PokerEvaluator.evaluate(hand)).toThrow('Hand must contain exactly 5 cards');
    });

    it('should handle combination of wild and dead cards', () => {
      const hand: Card[] = [
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('5', 'clubs', { isDead: true }),
        createCard('A', 'spades', { isWild: true }),
        createCard('2', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('three-of-a-kind');
    });

    it('should evaluate hand with sequential ranks correctly', () => {
      const hand: Card[] = [
        createCard('2', 'hearts'),
        createCard('3', 'diamonds'),
        createCard('4', 'clubs'),
        createCard('5', 'spades'),
        createCard('6', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.rank).toBe('straight');
    });
  });

  describe('Score Calculation', () => {
    it('should calculate higher score for better hands', () => {
      const royalFlush: Card[] = [
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createCard('10', 'hearts'),
      ];
      const pair: Card[] = [
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('5', 'clubs'),
        createCard('8', 'spades'),
        createCard('2', 'hearts'),
      ];
      
      const royalResult = PokerEvaluator.evaluate(royalFlush);
      const pairResult = PokerEvaluator.evaluate(pair);
      
      expect(royalResult.score).toBeGreaterThan(pairResult.score);
    });

    it('should calculate score for high card', () => {
      const hand: Card[] = [
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('J', 'spades'),
        createCard('9', 'hearts'),
      ];
      const result = PokerEvaluator.evaluate(hand);
      expect(result.score).toBeGreaterThan(0);
    });
  });
});

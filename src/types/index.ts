export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // Unique identifier for React keys
  isWild?: boolean; // Wild card flag
  isDead?: boolean; // Dead card flag
  has2xBonus?: boolean; // 2x payout bonus (per-hand)
}

export interface Hand {
  cards: Card[];
  id: string;
}

export type HandRank = 
  | 'royal-flush'
  | 'straight-flush'
  | 'four-of-a-kind'
  | 'full-house'
  | 'flush'
  | 'straight'
  | 'three-of-a-kind'
  | 'two-pair'
  | 'one-pair'
  | 'high-card';

export interface HandResult {
  rank: HandRank;
  multiplier: number;
  score: number;
  winningCards: Card[];
}

export interface RewardTable {
  [key: string]: number; // HandRank -> multiplier
}

export type GameScreen = 'menu' | 'game' | 'shop' | 'gameOver' | 'credits' | 'rules';

export interface DeckModifications {
  deadCards: Card[];
  wildCards: Card[];
  removedCards: Card[];
  cardRemovalCount: number; // Track number of removals for cost calculation
}

export interface GameState {
  screen: GameScreen;
  playerHand: Card[];
  heldIndices: number[];
  parallelHands: Hand[];
  handCount: number;
  rewardTable: RewardTable;
  credits: number;
  currentRun: number;
  additionalHandsBought: number;
  betAmount: number;
  selectedHandCount: number;
  minimumBet: number;
  round: number;
  totalEarnings: number;
  deckModifications: DeckModifications;
  extraDrawPurchased: boolean;
  hasExtraDraw: boolean;
  firstDrawComplete: boolean;
  secondDrawAvailable: boolean;
  random2xChance: number;
  wildCardCount: number;
  gameOver: boolean;
}

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

export type GamePhase = 'preDraw' | 'playing' | 'results';

export interface DeckModifications {
  deadCards: Card[];
  wildCards: Card[];
  removedCards: Card[];
  cardRemovalCount: number; // Track number of removals for cost calculation
}

export interface ThemeBackgroundAnimation {
  html?: string; // HTML markup for background elements
  css?: string; // CSS styles for background animation
  fromFiles?: boolean; // Load HTML and CSS from background.html and background.css files in theme directory
}

export interface ThemeConfig {
  name: string; // Internal name (lowercase, no spaces)
  displayName: string; // Human-readable display name
  description?: string; // Theme description
  backgroundAnimation?: ThemeBackgroundAnimation; // Optional custom background animations
}

export interface GameState {
  screen: GameScreen;
  gamePhase: GamePhase;
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

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // Unique identifier for React keys
  isWild?: boolean; // Wild card flag
  isDead?: boolean; // Dead card flag
}

export interface Hand {
  cards: Card[];
  id: string;
}

export type HandRank =
  | 'royal-flush'
  | 'straight-flush'
  | 'five-of-a-kind'
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

export type GameScreen =
  | 'menu'
  | 'game'
  | 'shop'
  | 'parallelHandsAnimation'
  | 'gameOver'
  | 'credits'
  | 'rules';

export type ShopOptionType =
  | 'parallel-hands-bundle-5'
  | 'parallel-hands-bundle-10'
  | 'parallel-hands-bundle-25'
  | 'parallel-hands-bundle-50'
  | 'dead-card'
  | 'wild-card'
  | 'extra-draw'
  | 'remove-single-dead-card'
  | 'remove-all-dead-cards'
  | 'devils-deal-chance'
  | 'devils-deal-cost-reduction';

export type GamePhase = 'preDraw' | 'playing' | 'parallelHandsAnimation' | 'results';

export interface DeckModifications {
  deadCards: Card[];
  wildCards: Card[];
  removedCards: Card[];
  deadCardRemovalCount: number; // Track total dead card removals (single + bulk) for cost calculation
}

export interface ThemeBackgroundAnimation {
  html?: string; // HTML markup for background elements
  css?: string; // CSS styles for background animation
  fromFiles?: boolean; // Load HTML and CSS from background.html and background.css files in theme directory
}

export interface ThemeAnimationConfig {
  transitionDuration: number; // Duration in milliseconds for screen transitions (fade in/out)
}

export interface ThemeSoundConfig {
  buttonClick?: string; // Path relative to theme/sounds/ directory
  shopPurchase?: string;
  screenTransition?: string;
  returnToPreDraw?: string;
  handScoring?: {
    [key: string]: string; // HandRank -> sound file path
  };
}

export interface ThemeMusicConfig {
  backgroundMusic?: string; // Path relative to theme/sounds/ directory
}

export interface ThemeConfig {
  name: string; // Internal name (lowercase, no spaces)
  displayName: string; // Human-readable display name
  description?: string; // Theme description
  backgroundAnimation?: ThemeBackgroundAnimation; // Optional custom background animations
  animation?: ThemeAnimationConfig; // Animation settings
  sounds?: ThemeSoundConfig; // Optional sound effects
  music?: ThemeMusicConfig; // Optional background music
}

export type FailureStateType =
  | 'minimum-bet-multiplier'
  | 'minimum-credit-efficiency'
  | 'minimum-winning-hands'
  | null;

export interface GameState {
  screen: GameScreen;
  gamePhase: GamePhase;
  isGeneratingHands: boolean; // Loading state for parallel hands generation
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
  baseMinimumBet: number; // Base minimum bet for endless mode multiplier calculations
  round: number;
  totalEarnings: number;
  deckModifications: DeckModifications;
  extraDrawPurchased: boolean;
  hasExtraDraw: boolean;
  firstDrawComplete: boolean;
  secondDrawAvailable: boolean;
  wildCardCount: number;
  gameOver: boolean;
  showShopNextRound: boolean; // Flag to show shop after results
  selectedShopOptions: ShopOptionType[]; // Selected shop options for this round
  isEndlessMode: boolean; // Whether endless mode is active
  currentFailureState: FailureStateType; // Current active failure condition
  winningHandsLastRound: number; // Number of winning hands from last round
  devilsDealCard: Card | null; // The offered card (null if no deal)
  devilsDealCost: number; // Calculated cost for this deal
  devilsDealHeld: boolean; // Whether the deal card is currently held
  devilsDealChancePurchases: number; // Number of chance upgrades purchased
  devilsDealCostReductionPurchases: number; // Number of cost reduction upgrades purchased
}

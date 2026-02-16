export const gameConfig = {
  // Global configuration
  deadCardLimit: 10,
  shopOptionCount: 3, // Number of options to display in shop

  // Animation timing configuration (in milliseconds)
  animation: {
    cardFlip: 500, // Card flip animation delay
  },

  // Parallel hands grid thresholds (switch to 2 columns early to avoid stall at 20–21)
  parallelHandsGrid: {
    singleColumn: { max: 12 },
    twoColumn: { min: 13, max: 50 },
    fourColumn: { min: 51, max: 100 },
    eightColumn: { min: 101 },
  },

  // Audio configuration
  audio: {
    musicVolume: 0.7, // Background music volume multiplier (0.0 to 1.0)
  },

  // Streak multiplier configuration
  streakMultiplier: {
    enabled: true,
    baseThreshold: 5, // First bonus at 5 streak
    thresholdIncrement: 10, // Base increment value
    exponentialGrowth: 1.5, // Exponential growth factor (1.0 = linear, >1.0 = exponential)
    baseMultiplier: 1.5, // 1.5x at first tier
    multiplierIncrement: 0.5, // +0.5x per tier (2.0x, 2.5x, 3.0x, etc.)
  },

  // Quips for UI elements
  quips: {
    maxBet: [
      'Max Bet',
      'All In!',
      'Go Big!',
      'YOLO!',
      'Maximum Power!',
      'Full Send!',
      'Bet It All!',
      'Maximum Overdrive!',
      'Ride or Die!',
      'Full Throttle!',
      'Maximum Effort!',
      'All or Nothing!',
      'Bet the Farm!',
      'Maximum Stakes!',
      'Fuck it, we ball',
    ],
    devilsDeal: [
      'Can I offer you a deal?',
      'Make a deal with me?',
      'Interested in a proposition?',
      'Care to make a deal?',
      'What say you to a bargain?',
      'A tempting offer awaits...',
      'Shall we make a deal?',
      'An opportunity presents itself...',
    ],
    emptyShop: [
      'Shop is empty',
      'Nothing available today',
      'Come back next round',
      'No items in stock',
      'Sold out!',
      'Shop closed for restocking',
      'Check back later',
      'Fresh out of options',
      'Nothing to see here',
      'The shelves are bare',
    ],
  },

  /**
   * Default game mode: full config used as the base for all modes.
   * Each entry in gameModes is merged over this (deep merge); empty {} = use default as-is.
   */
  defaultGameMode: {
    displayName: 'Normal Game',
    startingCredits: 5000,
    startingBet: 2,
    startingHandCount: 10,
    minimumBetIncreasePercent: 95,
    minimumBetIncreaseInterval: 5,
    shopOptionCount: 4,
    shopFrequency: 2,
    minimumPairRank: 11,
    devilsDeal: {
      baseChance: 15,
      baseCostPercent: 300,
      chanceIncreasePerPurchase: 20,
      maxChancePurchases: 3,
      costReductionPerPurchase: 6,
      maxCostReductionPurchases: 5,
    },
    endlessMode: {
      startRound: 30,
      failureConditions: {
        minimumBetMultiplier: { enabled: true, value: 2.0 },
        minimumCreditEfficiency: { enabled: true, value: 100 },
        minimumWinningHandsPerRound: { enabled: true, value: 20 },
        minimumWinPercent: {
          enabled: true,
          startPercent: 25,
          incrementPerRound: 5,
          maxPercent: 105,
        },
      },
    },
    shop: {
      deadCard: { creditReward: 2500 },
      wildCard: { baseCost: 5000, increasePercent: 100, maxCount: 3 },
      singleDeadCardRemoval: { baseCost: 5000, increasePercent: 10 },
      parallelHandsBundles: { basePricePerHand: 10, bundles: [5, 10, 25, 50] },
      extraDraw: { cost: 10000 },
      extraCardInHand: { baseCost: 10000, increasePercent: 125, maxPurchases: 3 },
      devilsDealChance: { baseCost: 5000, increasePercent: 50 },
      devilsDealCostReduction: { baseCost: 10000, increasePercent: 25 },
    },
    rewards: {
      'royal-flush': 250,
      'five-of-a-kind': 100,
      'straight-flush': 50,
      'four-of-a-kind': 25,
      'full-house': 9,
      flush: 6,
      straight: 4,
      'three-of-a-kind': 3,
      'two-pair': 2,
      'one-pair': 1,
      'high-card': 0,
    },
    // Rarity 1 = common, 4 = rare. Slots define max rarity per slot and chance per rarity.
    shopSlots: [
      { maxRarity: 1 }, // Slot 1: common only (100%)
      { maxRarity: 2, rarityChances: [0.6, 0.4] }, // Slot 2: 60% common, 40% uncommon
      { maxRarity: 3, rarityChances: [0.2, 0.5, 0.3] }, // Slot 3: 20% common, 50% uncommon, 30% rare
      { maxRarity: 4, rarityChances: [0.1, 0.5, 0.3, 0.1] }, // Slot 3: 20% common, 50% uncommon, 30% rare
    ],
    shopItems: {
      'dead-card': { rarity: 1 },
      'single-dead-card-removal': { rarity: 2 },
      'all-dead-cards-removal': { rarity: 3 },
      'parallel-hands-bundle-5': { rarity: 1 },
      'parallel-hands-bundle-10': { rarity: 1 },
      'parallel-hands-bundle-25': { rarity: 2 },
      'parallel-hands-bundle-50': { rarity: 3 },
      'wild-card': { rarity: 3 },
      'extra-draw': { rarity: 3 },
      'extra-card-in-hand': { rarity: 3 },
      'devils-deal-chance': { rarity: 2 },
      'devils-deal-cost-reduction': { rarity: 2 },
    },
  },

  // Mode overrides keyed by mode id. Empty object = use defaultGameMode as-is.
  gameModes: {
    normalGame: {},
    // Example future mode: hardMode: { startingCredits: 3000, displayName: 'Hard' },
  },

  // Default deck contents (standard 52-card deck)
  defaultDeck: {
    suits: ['hearts', 'diamonds', 'clubs', 'spades'],
    ranks: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
  },
} as const;

export type GameConfig = typeof gameConfig;

/** Type of the resolved game mode (default + overrides). */
export type GameModeConfig = (typeof gameConfig)['defaultGameMode'];

/** Deep-merge mode overrides onto default. Arrays and primitives in overrides replace defaults. */
function mergeGameMode<T extends Record<string, unknown>>(
  defaults: T,
  overrides: Partial<T> | Record<string, unknown>
): T {
  const result = { ...defaults } as Record<string, unknown>;
  const over = overrides as Record<string, unknown>;
  for (const key of Object.keys(over)) {
    if (!(key in over) || over[key] === undefined) continue;
    const defVal = (defaults as Record<string, unknown>)[key];
    const ovVal = over[key];
    if (
      ovVal !== null &&
      typeof ovVal === 'object' &&
      !Array.isArray(ovVal) &&
      defVal !== null &&
      typeof defVal === 'object' &&
      !Array.isArray(defVal)
    ) {
      (result as Record<string, unknown>)[key] = mergeGameMode(
        defVal as Record<string, unknown>,
        ovVal as Record<string, unknown>
      );
    } else {
      (result as Record<string, unknown>)[key] = ovVal;
    }
  }
  return result as T;
}

/** Returns the active game mode: defaultGameMode merged with current mode overrides. */
export function getCurrentGameMode(): GameModeConfig {
  const overrides = gameConfig.gameModes.normalGame as Partial<GameModeConfig>;
  return mergeGameMode(
    gameConfig.defaultGameMode as unknown as Record<string, unknown>,
    overrides as Record<string, unknown>
  ) as GameModeConfig;
}

/** Get a specific mode by id (for future mode selection). */
export function getGameMode(modeId: keyof typeof gameConfig.gameModes): GameModeConfig {
  const overrides = (gameConfig.gameModes[modeId] ?? {}) as Partial<GameModeConfig>;
  return mergeGameMode(
    gameConfig.defaultGameMode as unknown as Record<string, unknown>,
    overrides as Record<string, unknown>
  ) as GameModeConfig;
}

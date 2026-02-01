export const gameConfig = {
  // Global configuration
  deadCardLimit: 10,
  shopOptionCount: 3, // Number of options to display in shop

  // Animation timing configuration (in milliseconds)
  animation: {
    cardFlip: 500, // Card flip animation delay
  },

  // Parallel hands grid thresholds
  parallelHandsGrid: {
    singleColumn: { max: 20 },
    twoColumn: { min: 21, max: 50 },
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
    thresholdIncrement: 5, // Base increment value
    exponentialGrowth: 1.3, // Exponential growth factor (1.0 = linear, >1.0 = exponential)
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

  // Game modes define starting conditions and scaling rules
  gameModes: {
    normalGame: {
      displayName: 'Normal Game',
      startingCredits: 5000,
      startingBet: 2,
      startingHandCount: 10,
      minimumBetIncreasePercent: 95,
      minimumBetIncreaseInterval: 5, // Increase minimum bet every N rounds (1 = every round)
      shopOptionCount: 3, // Number of options to display in shop
      shopFrequency: 2, // Show shop every N turns
      minimumPairRank: 11, // Minimum rank for a pair to be valid (11 = Jacks or Better)
      // Devil's Deal configuration
      devilsDeal: {
        baseChance: 15, // Base percentage chance (0-100)
        baseCostPercent: 10, // Base cost as percentage of potential payout
        chanceIncreasePerPurchase: 20, // Percentage increase per shop purchase
        maxChancePurchases: 3, // Maximum times chance can be purchased
        costReductionPerPurchase: 6, // Percentage reduction per shop purchase
        maxCostReductionPurchases: 5, // Maximum times cost can be reduced
      },
      // Endless mode configuration (starts after endlessModeStartRound)
      endlessMode: {
        startRound: 30, // Start endless mode after this round
        failureConditions: {
          // Minimum bet multiplier (must bet at least this many times the base minimum bet)
          minimumBetMultiplier: {
            enabled: false,
            value: 2.0, // Must bet at least 2x the base minimum bet
          },
          // Minimum credit efficiency (credits earned per round on average)
          minimumCreditEfficiency: {
            enabled: false,
            value: 100, // Must average at least 100 credits per round
          },
          // Minimum winning hands per round (hands that pay out > 0)
          minimumWinningHandsPerRound: {
            enabled: true,
            value: 20, // Must win at least 20 hands per round
          },
        },
      },
      shop: {
        deadCard: {
          creditReward: 2500,
        },
        wildCard: {
          baseCost: 3000,
          increasePercent: 100,
          maxCount: 3,
        },
        singleDeadCardRemoval: {
          baseCost: 5000,
          increasePercent: 10,
        },
        parallelHandsBundles: {
          basePricePerHand: 10,
          bundles: [5, 10, 25, 50],
        },
        extraDraw: {
          cost: 10000,
        },
        devilsDealChance: {
          baseCost: 3000, // Configurable per game mode
          increasePercent: 50, // Configurable per game mode
        },
        devilsDealCostReduction: {
          baseCost: 10000, // Configurable per game mode
          increasePercent: 25, // Configurable per game mode
        },
      },
      rewards: {
        'royal-flush': 250,
        'straight-flush': 50,
        'five-of-a-kind': 100,
        'four-of-a-kind': 25,
        'full-house': 9,
        flush: 6,
        straight: 4,
        'three-of-a-kind': 3,
        'two-pair': 2,
        'one-pair': 1,
        'high-card': 0,
      },
      shopWeights: {
        'dead-card': 20,
        'single-dead-card-removal': 15,
        'all-dead-cards-removal': 15,
        'parallel-hands-bundle-5': 10,
        'parallel-hands-bundle-10': 15,
        'parallel-hands-bundle-25': 12,
        'parallel-hands-bundle-50': 8,
        'wild-card': 15,
        'devils-deal-chance': 8,
        'devils-deal-cost-reduction': 8,
      },
    },
  },

  // Default deck contents (standard 52-card deck)
  defaultDeck: {
    suits: ['hearts', 'diamonds', 'clubs', 'spades'],
    ranks: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
  },
} as const;

export type GameConfig = typeof gameConfig;

// Helper function to get current game mode (can be extended for mode selection)
export function getCurrentGameMode() {
  return gameConfig.gameModes.normalGame;
}

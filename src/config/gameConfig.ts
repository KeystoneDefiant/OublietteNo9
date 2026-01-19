export const gameConfig = {
  // Global configuration
  deadCardLimit: 10,
  shopFrequency: 5, // Show shop every N turns
  shopOptionCount: 3, // Number of options to display in shop
  defaultTransitionDuration: 300, // Default screen transition duration in milliseconds

  // Animation timing configuration (in milliseconds)
  animation: {
    parallelHandsFloat: 2000, // Parallel hands floating animation duration (increased from 1250ms for slower animation)
    cardFlip: 500, // Card flip animation delay
    payoutPopup: 2000, // Payout popup display duration
  },

  // Audio configuration
  audio: {
    musicVolume: 0.7, // Background music volume multiplier (0.0 to 1.0)
  },

  // Game rules configuration
  gameRules: {
    minimumPairRank: 11, // Minimum rank for a pair to be valid (11 = Jacks or Better)
    bundleHandCount: 10, // Number of hands in a parallel hands bundle
  },

  // Game modes define starting conditions and scaling rules
  gameModes: {
    normalGame: {
      displayName: 'Normal Game',
      startingCredits: 5000,
      startingBet: 1,
      startingHandCount: 10,
      minimumBetIncreasePercent: 5,
      shopOptionCount: 3, // Number of options to display in shop
      shopFrequency: 2, // Show shop every N turns
      shop: {
        deadCard: {
          creditReward: 2000,
        },
        wildCard: {
          baseCost: 2000,
          increasePercent: 100,
          maxCount: 3,
        },
        singleDeadCardRemoval: {
          baseCost: 5000,
          increasePercent: 10,
        },
        handCount: {
          baseCost: 100,
        },
        parallelHandsBundle: {
          handCount: 10, // Number of hands added in bundle (can be overridden per mode)
        },
        rewardUpgrade: {
          baseCost: 400,
          increasePercent: 150,
        },
        extraDraw: {
          cost: 5000,
        },
      },
      rewards: {
        'royal-flush': 250,
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
      shopWeights: {
        'dead-card': 20,
        'single-dead-card-removal': 15,
        'all-dead-cards-removal': 15,
        'parallel-hands-bundle': 25,
        'wild-card': 15,
        'reward-upgrade': 10,
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

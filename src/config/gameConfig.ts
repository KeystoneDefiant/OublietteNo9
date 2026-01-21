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
      // Endless mode configuration (starts after endlessModeStartRound)
      endlessMode: {
        startRound: 20, // Start endless mode after this round
        failureConditions: {
          // Minimum bet multiplier (must bet at least this many times the base minimum bet)
          minimumBetMultiplier: {
            enabled: true,
            value: 2.0, // Must bet at least 2x the base minimum bet
          },
          // Minimum credit efficiency (credits earned per round on average)
          minimumCreditEfficiency: {
            enabled: true,
            value: 100, // Must average at least 100 credits per round
          },
          // Minimum winning hands per round (hands that pay out > 0)
          minimumWinningHandsPerRound: {
            enabled: true,
            value: 3, // Must win at least 3 hands per round
          },
        },
      },
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
          basePricePerHand: 100,
        },
        parallelHandsBundles: {
          basePricePerHand: 10,
          bundles: [5, 10, 25, 50],
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

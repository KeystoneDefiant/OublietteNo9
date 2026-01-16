export const gameConfig = {
  shop: {
    deadCard: {
      baseCost: 20,
    },
    wildCard: {
      baseCost: 2000,
      increasePercent: 100,
      maxCount: 3,
    },
    cardRemoval: {
      baseCost: 25,
      increasePercent: 45,
    },
    extraDraw: {
      cost: 5000,
    },
    handCount: {
      baseCost: 100,
    },
    rewardUpgrade: {
      baseCost: 400,
      increasePercent: 150,
    },
    '2xChance': {
      baseCost: 100,
      maxChance: 25,
      increaseAmount: 5,
    },
  },
  gameplay: {
    startingCredits: 1000,
    startingBet: 1,
    startingMinimumBet: 1,
    minimumBetIncreasePercent: 5,
    startingHandCount: 1,
    starting2xChance: 5,
  },
  rewards: {
    defaultTable: {
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
  },
  percentages: {
    minimumBetIncrease: 5,
    wildCardIncrease: 100,
    cardRemovalIncrease: 45,
    rewardUpgradeIncrease: 150,
  },
} as const;

export type GameConfig = typeof gameConfig;

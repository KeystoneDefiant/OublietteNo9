import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { MainMenu } from './components/MainMenu';
import { GameTable } from './components/GameTable';
import { Shop } from './components/Shop';
import { GameOver } from './components/GameOver';
import { Credits } from './components/Credits';
import { Rules } from './components/Rules';
import { Settings } from './components/Settings';
import { initializeTheme } from './utils/themeManager';

function App() {
  const [showCredits, setShowCredits] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    initializeTheme();
  }, []);
  
  const {
    state,
    dealHand,
    toggleHold,
    drawParallelHands,
    openShop,
    closeShop,
    upgradeHandCount,
    upgradeRewardTable,
    returnToMenu,
    startNewRun,
    buyAnotherHand,
    setBetAmount,
    setSelectedHandCount,
    addDeadCard,
    removeCard,
    addWildCard,
    increase2xChance,
    purchaseExtraDraw,
  } = useGameState();

  return (
    <div className="min-h-screen">
      {state.screen === 'menu' && (
        <MainMenu
          onStartRun={startNewRun}
          onCredits={() => setShowCredits(true)}
          onRules={() => setShowRules(true)}
          onSettings={() => setShowSettings(true)}
        />
      )}

      {showCredits && (
        <Credits onClose={() => setShowCredits(false)} />
      )}

      {showRules && (
        <Rules onClose={() => setShowRules(false)} />
      )}

      {state.screen === 'game' && (
        <GameTable
          playerHand={state.playerHand}
          heldIndices={state.heldIndices}
          parallelHands={state.parallelHands}
          rewardTable={state.rewardTable}
          credits={state.credits}
          handCount={state.handCount}
          selectedHandCount={state.selectedHandCount}
          betAmount={state.betAmount}
          minimumBet={state.minimumBet}
          round={state.round}
          totalEarnings={state.totalEarnings}
          additionalHandsBought={state.additionalHandsBought}
          firstDrawComplete={state.firstDrawComplete}
          secondDrawAvailable={state.secondDrawAvailable}
          onToggleHold={toggleHold}
          onDraw={drawParallelHands}
          onDealHand={dealHand}
          onOpenShop={openShop}
          onBuyAnotherHand={buyAnotherHand}
          onSetBetAmount={setBetAmount}
          onSetSelectedHandCount={setSelectedHandCount}
        />
      )}

      {state.screen === 'shop' && (
        <>
          <GameTable
            playerHand={state.playerHand}
            heldIndices={state.heldIndices}
            parallelHands={state.parallelHands}
            rewardTable={state.rewardTable}
            credits={state.credits}
            handCount={state.handCount}
            selectedHandCount={state.selectedHandCount}
            betAmount={state.betAmount}
            minimumBet={state.minimumBet}
            round={state.round}
            totalEarnings={state.totalEarnings}
            additionalHandsBought={state.additionalHandsBought}
            firstDrawComplete={state.firstDrawComplete}
            secondDrawAvailable={state.secondDrawAvailable}
            onToggleHold={toggleHold}
            onDraw={drawParallelHands}
            onDealHand={dealHand}
            onOpenShop={openShop}
            onBuyAnotherHand={buyAnotherHand}
            onSetBetAmount={setBetAmount}
            onSetSelectedHandCount={setSelectedHandCount}
          />
          <Shop
            credits={state.credits}
            handCount={state.handCount}
            rewardTable={state.rewardTable}
            removedCards={state.deckModifications.removedCards}
            deadCards={state.deckModifications.deadCards}
            wildCards={state.deckModifications.wildCards}
            cardRemovalCount={state.deckModifications.cardRemovalCount}
            wildCardCount={state.wildCardCount}
            random2xChance={state.random2xChance}
            minimumBet={state.minimumBet}
            selectedHandCount={state.selectedHandCount}
            extraDrawPurchased={state.extraDrawPurchased}
            onUpgradeHandCount={upgradeHandCount}
            onUpgradeReward={upgradeRewardTable}
            onAddDeadCard={addDeadCard}
            onRemoveCard={removeCard}
            onAddWildCard={addWildCard}
            onIncrease2xChance={increase2xChance}
            onPurchaseExtraDraw={purchaseExtraDraw}
            onClose={closeShop}
          />
        </>
      )}

      {state.screen === 'gameOver' && (
        <GameOver
          round={state.round}
          totalEarnings={state.totalEarnings}
          credits={state.credits}
          onReturnToMenu={returnToMenu}
        />
      )}

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useThemeBackgroundAnimation } from './hooks/useThemeBackgroundAnimation';
import { MainMenu } from './components/MainMenu';
import { PreDraw } from './components/PreDraw';
import { GameTable } from './components/GameTable';
import { Results } from './components/Results';
import { Shop } from './components/Shop';
import { GameOver } from './components/GameOver';
import { Credits } from './components/Credits';
import { Rules } from './components/Rules';
import { Settings } from './components/Settings';
import { initializeTheme, getSelectedTheme, loadThemeConfig } from './utils/themeManager';
import { ThemeConfig } from './types/index';

function App() {
  const [showCredits, setShowCredits] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    initializeTheme();

    // Load the initial theme config for background animation
    const theme = getSelectedTheme();
    loadThemeConfig(theme).then((config) => {
      setThemeConfig(config);
    });
  }, []);

  // Apply theme background animation
  useThemeBackgroundAnimation(themeConfig);

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
    returnToPreDraw,
    startNewRun,
    setBetAmount,
    setSelectedHandCount,
    addDeadCard,
    removeCard,
    addWildCard,
    increase2xChance,
    purchaseExtraDraw,
    cheatAddCredits,
    cheatAddHands,
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

      {showCredits && <Credits onClose={() => setShowCredits(false)} />}

      {showRules && <Rules onClose={() => setShowRules(false)} />}

      {state.screen === 'game' && state.gamePhase === 'preDraw' && (
        <PreDraw
          credits={state.credits}
          handCount={state.handCount}
          selectedHandCount={state.selectedHandCount}
          betAmount={state.betAmount}
          minimumBet={state.minimumBet}
          rewardTable={state.rewardTable}
          gameOver={state.gameOver}
          onSetBetAmount={setBetAmount}
          onSetSelectedHandCount={setSelectedHandCount}
          onDealHand={dealHand}
          onOpenShop={openShop}
          onCheatAddCredits={cheatAddCredits}
          onCheatAddHands={cheatAddHands}
        />
      )}

      {state.screen === 'game' && state.gamePhase === 'playing' && (
        <GameTable
          playerHand={state.playerHand}
          heldIndices={state.heldIndices}
          parallelHands={state.parallelHands}
          rewardTable={state.rewardTable}
          credits={state.credits}
          selectedHandCount={state.selectedHandCount}
          round={state.round}
          totalEarnings={state.totalEarnings}
          firstDrawComplete={state.firstDrawComplete}
          secondDrawAvailable={state.secondDrawAvailable}
          onToggleHold={toggleHold}
          onDraw={drawParallelHands}
        />
      )}

      {state.screen === 'game' && state.gamePhase === 'results' && (
        <Results
          playerHand={state.playerHand}
          heldIndices={state.heldIndices}
          parallelHands={state.parallelHands}
          rewardTable={state.rewardTable}
          betAmount={state.betAmount}
          onReturnToPreDraw={returnToPreDraw}
        />
      )}

      {state.screen === 'shop' && (
        <>
          {state.gamePhase === 'preDraw' && (
            <PreDraw
              credits={state.credits}
              handCount={state.handCount}
              selectedHandCount={state.selectedHandCount}
              betAmount={state.betAmount}
              minimumBet={state.minimumBet}
              rewardTable={state.rewardTable}
              gameOver={state.gameOver}
              onSetBetAmount={setBetAmount}
              onSetSelectedHandCount={setSelectedHandCount}
              onDealHand={dealHand}
              onOpenShop={openShop}
              onCheatAddCredits={cheatAddCredits}
              onCheatAddHands={cheatAddHands}
            />
          )}
          {state.gamePhase === 'playing' && (
            <GameTable
              playerHand={state.playerHand}
              heldIndices={state.heldIndices}
              parallelHands={state.parallelHands}
              rewardTable={state.rewardTable}
              credits={state.credits}
              selectedHandCount={state.selectedHandCount}
              round={state.round}
              totalEarnings={state.totalEarnings}
              firstDrawComplete={state.firstDrawComplete}
              secondDrawAvailable={state.secondDrawAvailable}
              onToggleHold={toggleHold}
              onDraw={drawParallelHands}
            />
          )}
          {state.gamePhase === 'results' && (
            <Results
              playerHand={state.playerHand}
              heldIndices={state.heldIndices}
              parallelHands={state.parallelHands}
              rewardTable={state.rewardTable}
              betAmount={state.betAmount}
              onReturnToPreDraw={returnToPreDraw}
            />
          )}
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

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;

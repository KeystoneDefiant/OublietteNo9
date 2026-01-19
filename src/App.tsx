import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useThemeBackgroundAnimation } from './hooks/useThemeBackgroundAnimation';
import { MainMenu } from './components/MainMenu';
import { PreDraw } from './components/screen-PreDraw';
import { GameTable } from './components/screen-GameTable';
import { Results } from './components/screen-Results';
import { ParallelHandsAnimation } from './components/screen-ParallelHandsAnimation';
import { Shop } from './components/Shop';
import { GameOver } from './components/screen-GameOver';
import { Credits } from './components/Credits';
import { Rules } from './components/Rules';
import { Settings } from './components/Settings';
import { initializeTheme, getSelectedTheme, loadThemeConfig } from './utils/themeManager';
import { ThemeConfig } from './types/index';
import './styles/screen-transitions.css';

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

      // Set theme transition duration as CSS custom property
      const transitionDuration = config?.animation?.transitionDuration ?? 300;
      document.documentElement.style.setProperty(
        '--transition-duration',
        `${transitionDuration}ms`
      );
    });
  }, []);

  // Apply theme background animation
  useThemeBackgroundAnimation(themeConfig);

  const {
    state,
    dealHand,
    toggleHold,
    drawParallelHands,
    upgradeHandCount,
    returnToMenu,
    returnToPreDraw,
    startNewRun,
    setBetAmount,
    setSelectedHandCount,
    addDeadCard,
    removeSingleDeadCard,
    removeAllDeadCards,
    addWildCard,
    purchaseExtraDraw,
    addParallelHandsBundle,
    moveToNextScreen,
    proceedFromResults,
    cheatAddCredits,
    cheatAddHands,
  } = useGameState();

  return (
    <div className="min-h-screen">
      {state.screen === 'menu' && (
        <div key="menu" className="screen-enter">
          <MainMenu
            onStartRun={startNewRun}
            onCredits={() => setShowCredits(true)}
            onRules={() => setShowRules(true)}
            onSettings={() => setShowSettings(true)}
          />
        </div>
      )}

      {showCredits && (
        <div className="modal-enter">
          <Credits onClose={() => setShowCredits(false)} />
        </div>
      )}

      {showRules && (
        <div className="modal-enter">
          <Rules onClose={() => setShowRules(false)} />
        </div>
      )}

      {state.screen === 'game' && state.gamePhase === 'preDraw' && !state.showShopNextRound && (
        <div key="preDraw" className="screen-enter">
          <PreDraw
            credits={state.credits}
            handCount={state.handCount}
            selectedHandCount={state.selectedHandCount}
            betAmount={state.betAmount}
            minimumBet={state.minimumBet}
            rewardTable={state.rewardTable}
            gameOver={state.gameOver}
            round={state.round}
            totalEarnings={state.totalEarnings}
            onSetBetAmount={setBetAmount}
            onSetSelectedHandCount={setSelectedHandCount}
            onDealHand={dealHand}
            onCheatAddCredits={cheatAddCredits}
            onCheatAddHands={cheatAddHands}
          />
        </div>
      )}

      {state.screen === 'game' && state.gamePhase === 'playing' && (
        <div key="gameTable" className="screen-enter">
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
        </div>
      )}

      {state.screen === 'game' && state.gamePhase === 'parallelHandsAnimation' && (
        <div key="animation" className="screen-enter">
          <ParallelHandsAnimation
            parallelHands={state.parallelHands}
            rewardTable={state.rewardTable}
            selectedHandCount={state.selectedHandCount}
            onAnimationComplete={moveToNextScreen}
          />
        </div>
      )}

      {state.screen === 'game' && state.gamePhase === 'results' && (
        <div key="results" className="screen-enter">
          <Results
            playerHand={state.playerHand}
            heldIndices={state.heldIndices}
            parallelHands={state.parallelHands}
            rewardTable={state.rewardTable}
            betAmount={state.betAmount}
            credits={state.credits}
            round={state.round}
            totalEarnings={state.totalEarnings}
            selectedHandCount={state.selectedHandCount}
            onReturnToPreDraw={returnToPreDraw}
            showShopNextRound={state.showShopNextRound}
          />
        </div>
      )}

      {state.screen === 'game' && state.showShopNextRound && (
        <div key="shop" className="screen-enter">
          <Shop
            credits={state.credits}
            handCount={state.handCount}
            deadCards={state.deckModifications.deadCards}
            deadCardRemovalCount={state.deckModifications.deadCardRemovalCount}
            wildCards={state.deckModifications.wildCards}
            wildCardCount={state.wildCardCount}
            extraDrawPurchased={state.extraDrawPurchased}
            onUpgradeHandCount={upgradeHandCount}
            onAddDeadCard={addDeadCard}
            onRemoveSingleDeadCard={removeSingleDeadCard}
            onRemoveAllDeadCards={removeAllDeadCards}
            onAddWildCard={addWildCard}
            onPurchaseExtraDraw={purchaseExtraDraw}
            onAddParallelHandsBundle={addParallelHandsBundle}
            onClose={proceedFromResults}
          />
        </div>
      )}

      {state.screen === 'gameOver' && (
        <div key="gameOver" className="screen-enter">
          <GameOver
            round={state.round}
            totalEarnings={state.totalEarnings}
            credits={state.credits}
            onReturnToMenu={returnToMenu}
          />
        </div>
      )}

      {showSettings && (
        <div className="modal-enter">
          <Settings onClose={() => setShowSettings(false)} />
        </div>
      )}
    </div>
  );
}

export default App;

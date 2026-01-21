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
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { initializeTheme, getSelectedTheme, loadThemeConfig } from './utils/themeManager';
import { ThemeConfig } from './types/index';
import './styles/screen-transitions.css';

function App() {
  const [showCredits, setShowCredits] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        setIsThemeLoading(true);
        initializeTheme();

        // Load the initial theme config for background animation
        const theme = getSelectedTheme();
        const config = await loadThemeConfig(theme);
        setThemeConfig(config);

        // Set theme transition duration as CSS custom property
        const transitionDuration = config?.animation?.transitionDuration ?? 300;
        document.documentElement.style.setProperty(
          '--transition-duration',
          `${transitionDuration}ms`
        );
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsThemeLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Apply theme background animation
  useThemeBackgroundAnimation(themeConfig);

  const {
    state,
    dealHand,
    toggleHold,
    drawParallelHands,
    returnToMenu,
    returnToPreDraw,
    startNewRun,
    endRun,
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
    cheatSetDevilsDeal,
    toggleDevilsDealHold,
    purchaseDevilsDealChance,
    purchaseDevilsDealCostReduction,
  } = useGameState();

  // Show loading spinner while theme is loading
  if (isThemeLoading) {
    return <LoadingSpinner message="Loading theme..." fullScreen />;
  }

  return (
    <div className="min-h-screen">
      {state.screen === 'menu' && (
        <ErrorBoundary>
          <div key="menu" className="screen-enter">
            <MainMenu
              onStartRun={startNewRun}
              onCredits={() => setShowCredits(true)}
              onRules={() => setShowRules(true)}
              onSettings={() => setShowSettings(true)}
            />
          </div>
        </ErrorBoundary>
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
        <ErrorBoundary>
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
              failureState={state.currentFailureState}
              gameState={state}
              onSetBetAmount={setBetAmount}
              onSetSelectedHandCount={setSelectedHandCount}
              onDealHand={dealHand}
              onEndRun={endRun}
              onCheatAddCredits={cheatAddCredits}
              onCheatAddHands={cheatAddHands}
              onCheatSetDevilsDeal={cheatSetDevilsDeal}
            />
          </div>
        </ErrorBoundary>
      )}

      {state.screen === 'game' && state.gamePhase === 'playing' && (
        <ErrorBoundary>
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
              failureState={state.currentFailureState}
              gameState={state}
              onToggleHold={toggleHold}
              onToggleDevilsDealHold={toggleDevilsDealHold}
              onDraw={drawParallelHands}
            />
          </div>
        </ErrorBoundary>
      )}

      {state.screen === 'game' && state.gamePhase === 'parallelHandsAnimation' && (
        <ErrorBoundary>
          <div key="animation" className="screen-enter">
            <ParallelHandsAnimation
              parallelHands={state.parallelHands}
              rewardTable={state.rewardTable}
              selectedHandCount={state.selectedHandCount}
              betAmount={state.betAmount}
              onAnimationComplete={moveToNextScreen}
            />
          </div>
        </ErrorBoundary>
      )}

      {state.screen === 'game' && state.gamePhase === 'results' && (
        <ErrorBoundary>
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
              failureState={state.currentFailureState}
              gameState={state}
              onReturnToPreDraw={returnToPreDraw}
              showShopNextRound={state.showShopNextRound}
            />
          </div>
        </ErrorBoundary>
      )}

      {state.screen === 'game' && state.showShopNextRound && (
        <ErrorBoundary>
          <div key="shop" className="screen-enter">
            <Shop
              credits={state.credits}
              handCount={state.handCount}
              deadCards={state.deckModifications.deadCards}
              deadCardRemovalCount={state.deckModifications.deadCardRemovalCount}
              wildCards={state.deckModifications.wildCards}
              wildCardCount={state.wildCardCount}
              extraDrawPurchased={state.extraDrawPurchased}
              selectedShopOptions={state.selectedShopOptions}
              onAddDeadCard={addDeadCard}
              onRemoveSingleDeadCard={removeSingleDeadCard}
              onRemoveAllDeadCards={removeAllDeadCards}
              onAddWildCard={addWildCard}
              onPurchaseExtraDraw={purchaseExtraDraw}
              onAddParallelHandsBundle={addParallelHandsBundle}
              onPurchaseDevilsDealChance={purchaseDevilsDealChance}
              onPurchaseDevilsDealCostReduction={purchaseDevilsDealCostReduction}
              devilsDealChancePurchases={state.devilsDealChancePurchases}
              devilsDealCostReductionPurchases={state.devilsDealCostReductionPurchases}
              onClose={proceedFromResults}
            />
          </div>
        </ErrorBoundary>
      )}

      {state.screen === 'gameOver' && (
        <ErrorBoundary>
          <div key="gameOver" className="screen-enter">
            <GameOver
              round={state.round}
              totalEarnings={state.totalEarnings}
              credits={state.credits}
              onReturnToMenu={returnToMenu}
            />
          </div>
        </ErrorBoundary>
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

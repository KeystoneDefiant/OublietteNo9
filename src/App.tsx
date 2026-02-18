import { useState, useEffect, lazy, Suspense } from 'react';
import { useGameState } from './hooks/useGameState';
import { useThemeBackgroundAnimation } from './hooks/useThemeBackgroundAnimation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { RewardTable } from './components/RewardTable';
import { initializeTheme, getSelectedTheme, loadThemeConfig } from './utils/themeManager';
import { ThemeConfig } from './types/index';

// Code splitting: Lazy load screen components for better performance
const MainMenu = lazy(() => import('./components/MainMenu').then(m => ({ default: m.MainMenu })));
const PreDraw = lazy(() => import('./components/screen-PreDraw').then(m => ({ default: m.PreDraw })));
const GameTable = lazy(() => import('./components/screen-GameTable').then(m => ({ default: m.GameTable })));
const Results = lazy(() => import('./components/screen-Results').then(m => ({ default: m.Results })));
const ParallelHandsAnimation = lazy(() => import('./components/screen-ParallelHandsAnimation').then(m => ({ default: m.ParallelHandsAnimation })));
const Shop = lazy(() => import('./components/Shop').then(m => ({ default: m.Shop })));
const GameOver = lazy(() => import('./components/screen-GameOver').then(m => ({ default: m.GameOver })));
const Credits = lazy(() => import('./components/Credits').then(m => ({ default: m.Credits })));
const Tutorial = lazy(() => import('./components/Tutorial').then(m => ({ default: m.Tutorial })));
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));

function App() {
  const [showCredits, setShowCredits] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPayoutTable, setShowPayoutTable] = useState(false);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  // Preload logo so it's cached before any screen needs it
  useEffect(() => {
    const img = new Image();
    img.src = `${import.meta.env.BASE_URL}images/logos/number9.png`;
  }, []);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        setIsThemeLoading(true);
        initializeTheme();

        // Load the initial theme config for background animation
        const theme = getSelectedTheme();
        let config = await loadThemeConfig(theme);

        // Fallback to Classic theme if selected theme fails to load
        if (!config && theme !== 'Classic') {
          console.warn(`Failed to load theme "${theme}", falling back to Classic theme`);
          config = await loadThemeConfig('Classic');
          if (config) {
            // Update saved theme to Classic since original failed
            initializeTheme(); // Apply Classic theme to body
          }
        }

        setThemeConfig(config);

        // Set theme transition duration as CSS custom property
        const transitionDuration = config?.animation?.transitionDuration ?? 300;
        document.documentElement.style.setProperty(
          '--transition-duration',
          `${transitionDuration}ms`
        );
      } catch (error) {
        console.error('Failed to load theme:', error);
        // Continue with null theme config - app will still function
      } finally {
        setIsThemeLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Apply theme background animation
  useThemeBackgroundAnimation(themeConfig);

  // Close payout table on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPayoutTable) {
        setShowPayoutTable(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showPayoutTable]);

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
    purchaseExtraCardInHand,
    updateStreakCounter,
    toggleMusic,
    toggleSoundEffects,
    cycleAnimationSpeed,
    setMusicVolume,
    setSoundEffectsVolume,
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
              onTutorial={() => setShowTutorial(true)}
              onCredits={() => setShowCredits(true)}
              onSettings={() => setShowSettings(true)}
            />
          </div>
        </ErrorBoundary>
      )}

      {showCredits && (
        <Suspense fallback={<LoadingSpinner />}>
          <div className="modal-enter">
            <Credits onClose={() => setShowCredits(false)} />
          </div>
        </Suspense>
      )}

      {showTutorial && (
        <Suspense fallback={<LoadingSpinner />}>
          <div className="modal-enter">
            <Tutorial onClose={() => setShowTutorial(false)} />
          </div>
        </Suspense>
      )}

      {state.screen === 'game' && state.gamePhase === 'preDraw' && !state.showShopNextRound && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
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
              musicEnabled={state.audioSettings.musicEnabled}
              soundEffectsEnabled={state.audioSettings.soundEffectsEnabled}
              onToggleMusic={toggleMusic}
              onToggleSoundEffects={toggleSoundEffects}
              onShowPayoutTable={() => setShowPayoutTable(true)}
              animationSpeedMode={state.animationSpeedMode}
              onCycleAnimationSpeed={cycleAnimationSpeed}
            />
          </div>
          </Suspense>
        </ErrorBoundary>
      )}

      {state.screen === 'game' && state.gamePhase === 'playing' && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <div key="gameTable" className="screen-enter">
              <GameTable
              playerHand={state.playerHand}
              heldIndices={state.heldIndices}
              parallelHands={state.parallelHands}
              credits={state.credits}
              selectedHandCount={state.selectedHandCount}
              round={state.round}
              totalEarnings={state.totalEarnings}
              firstDrawComplete={state.drawsCompletedThisRound > 0}
              nextActionIsDraw={state.maxDraws >= 2 && state.drawsCompletedThisRound < state.maxDraws}
              failureState={state.currentFailureState}
              gameState={state}
              onToggleHold={toggleHold}
              onToggleDevilsDealHold={toggleDevilsDealHold}
              onDraw={drawParallelHands}
              musicEnabled={state.audioSettings.musicEnabled}
              soundEffectsEnabled={state.audioSettings.soundEffectsEnabled}
              onToggleMusic={toggleMusic}
              onToggleSoundEffects={toggleSoundEffects}
              onShowPayoutTable={() => setShowPayoutTable(true)}
              animationSpeedMode={state.animationSpeedMode}
              onCycleAnimationSpeed={cycleAnimationSpeed}
            />
          </div>
          </Suspense>
        </ErrorBoundary>
      )}

      {state.screen === 'game' && state.gamePhase === 'parallelHandsAnimation' && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <div key="animation" className="screen-enter">
              <ParallelHandsAnimation
              parallelHands={state.parallelHands}
              playerHand={state.playerHand}
              heldIndices={state.heldIndices}
              rewardTable={state.rewardTable}
              selectedHandCount={state.selectedHandCount}
              betAmount={state.betAmount}
              initialStreakCounter={state.streakCounter}
              audioSettings={state.audioSettings}
              animationSpeedMode={state.animationSpeedMode}
              onToggleMusic={toggleMusic}
              onToggleSoundEffects={toggleSoundEffects}
              onCycleAnimationSpeed={cycleAnimationSpeed}
              onAnimationComplete={(finalStreakCount: number) => {
                updateStreakCounter(finalStreakCount);
                moveToNextScreen();
              }}
            />
            </div>
          </Suspense>
        </ErrorBoundary>
      )}

      {state.screen === 'game' && state.gamePhase === 'results' && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
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
                musicEnabled={state.audioSettings.musicEnabled}
                soundEffectsEnabled={state.audioSettings.soundEffectsEnabled}
                onToggleMusic={toggleMusic}
                onToggleSoundEffects={toggleSoundEffects}
                onShowPayoutTable={() => setShowPayoutTable(true)}
                animationSpeedMode={state.animationSpeedMode}
                onCycleAnimationSpeed={cycleAnimationSpeed}
              />
            </div>
          </Suspense>
        </ErrorBoundary>
      )}

      {state.screen === 'game' && state.showShopNextRound && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <div key="shop" className="screen-enter">
              <Shop
              credits={state.credits}
              handCount={state.handCount}
              betAmount={state.betAmount}
              selectedHandCount={state.selectedHandCount}
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
              extraCardsInHand={state.extraCardsInHand}
              onPurchaseExtraCardInHand={purchaseExtraCardInHand}
              onClose={proceedFromResults}
            />
          </div>
          </Suspense>
        </ErrorBoundary>
      )}

      {state.screen === 'gameOver' && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <div key="gameOver" className="screen-enter">
              <GameOver
              round={state.round}
              totalEarnings={state.totalEarnings}
              credits={state.credits}
              onReturnToMenu={returnToMenu}
            />
          </div>
          </Suspense>
        </ErrorBoundary>
      )}

      {showSettings && (
        <Suspense fallback={<LoadingSpinner />}>
          <div className="modal-enter">
            <Settings
              onClose={() => setShowSettings(false)}
              audioSettings={state.audioSettings}
              onMusicVolumeChange={setMusicVolume}
              onSoundEffectsVolumeChange={setSoundEffectsVolume}
            />
          </div>
        </Suspense>
      )}

      {showPayoutTable && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPayoutTable(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Payout Table</h2>
              <button
                onClick={() => setShowPayoutTable(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
                aria-label="Close payout table"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <RewardTable rewardTable={state.rewardTable} wildCardCount={state.wildCardCount} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

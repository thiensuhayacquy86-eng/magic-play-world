/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { AdultGateModal } from './components/AdultGateModal';
import { AppFooter } from './components/AppFooter';
import { HeaderBar } from './components/HeaderBar';
import { ACTIVE_GAMES, COMPANIONS, GAMES, WORLDS } from './data/worldData';
import { CharactersScreen } from './screens/CharactersScreen';
import { HomeScreen } from './screens/HomeScreen';
import { PlayGameScreen } from './screens/PlayGameScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { TeacherAdminScreen } from './screens/TeacherAdminScreen';
import { VictoryScreen } from './screens/VictoryScreen';
import { WorldGamesScreen } from './screens/WorldGamesScreen';
import {
  AgeGroup,
  AppSettings,
  AppState,
  BubbleLevelProgress,
  CompanionId,
  GameData,
  GameResult,
  PenguinProgress,
  ScreenId,
  WorldData,
} from './types/game';
import { bubbleMusic, penguinMusic, sfx, stopSpeech } from './utils/audio';
import { createDefaultBubbleProgress } from './games/bubbleStages';
import { createDefaultPenguinProgress } from './games/penguinStages';
import {
  createChildProfile,
  evaluateUnlocks,
  loadAppState,
  recordGameCompletion,
  saveAppState,
} from './utils/storage';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [screen, setScreen] = useState<ScreenId>('home');
  const [selectedWorld, setSelectedWorld] = useState<WorldData>(WORLDS[0]);
  const [activeGame, setActiveGame] = useState<GameData>(ACTIVE_GAMES[0] ?? GAMES[0]);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [isAdultGateOpen, setIsAdultGateOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setIsBooting(false), 380);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const activeProfile =
    appState.profiles.find((p) => p.id === appState.activeProfileId) ?? appState.profiles[0];

  const activeCompanion =
    COMPANIONS.find((c) => c.id === activeProfile.avatarCompanionId) ?? COMPANIONS[0];

  const navigateTo = (nextScreen: ScreenId) => {
    stopSpeech();
    setScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectWorld = (world: WorldData) => {
    setSelectedWorld(world);
    navigateTo('home');
  };

  const handleStartGame = (game: GameData) => {
    const matchingWorld = WORLDS.find((w) => w.id === game.worldId) ?? WORLDS[0];
    setSelectedWorld(matchingWorld);
    setActiveGame(game);
    navigateTo('play');
  };

  const handleGameComplete = (starsEarned: number) => {
    const { nextState, result } = recordGameCompletion(
      appState,
      activeGame.id,
      activeGame.worldId,
      starsEarned
    );
    setAppState(nextState);
    setLastResult(result);
    navigateTo('victory');
  };

  const handleRecordBubbleStars = (starsEarned: number) => {
    setAppState((prev) => {
      const { nextState, result } = recordGameCompletion(
        prev,
        'bubble-pop',
        'fun-island',
        starsEarned
      );
      setLastResult(result);
      return nextState;
    });
  };

  const handleUpdateBubbleProgress = (progress: BubbleLevelProgress) => {
    setAppState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === prev.activeProfileId ? { ...p, bubbleProgress: progress } : p
      ),
    }));
  };

  const handleRecordPenguinStars = (starsEarned: number) => {
    setAppState((prev) => {
      const { nextState, result } = recordGameCompletion(
        prev,
        'penguin-ice',
        'fun-island',
        starsEarned
      );
      setLastResult(result);
      return nextState;
    });
  };

  const handleUpdatePenguinProgress = (progress: PenguinProgress) => {
    setAppState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === prev.activeProfileId ? { ...p, penguinProgress: progress } : p
      ),
    }));
  };

  const handleToggleFavorite = (gameId: string) => {
    const exists = activeProfile.favoriteGameIds.includes(gameId);
    const nextFavs = exists
      ? activeProfile.favoriteGameIds.filter((id) => id !== gameId)
      : [...activeProfile.favoriteGameIds, gameId];

    setAppState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === activeProfile.id ? { ...p, favoriteGameIds: nextFavs } : p
      ),
    }));
    showToast(exists ? 'Đã bỏ khỏi mục yêu thích' : 'Đã thêm vào trò chơi bé yêu thích!');
  };

  const handleSelectCompanion = (companionId: CompanionId) => {
    setAppState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === activeProfile.id ? { ...p, avatarCompanionId: companionId } : p
      ),
    }));
    const comp = COMPANIONS.find((c) => c.id === companionId);
    showToast(`Bé đã chọn ${comp?.name ?? 'bạn mới'} làm người đồng hành!`);
  };

  const handleOpenTreasureChest = () => {
    setAppState((prev) => {
      const target = prev.profiles.find((p) => p.id === prev.activeProfileId);
      if (!target) return prev;
      const updated = {
        ...target,
        stars: target.stars + 5,
        chestsOpened: target.chestsOpened + 1,
        lastChestStars: target.stars + 5,
      };
      const { updatedProfile } = evaluateUnlocks(updated);
      return {
        ...prev,
        profiles: prev.profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)),
      };
    });
    showToast('Chúc mừng bé nhận +5 ngôi sao từ Rương Quà Bí Mật!');
  };

  const handleToggleSound = () => {
    const nextSound = !appState.settings.soundEnabled;
    if (!nextSound) {
      stopSpeech();
      bubbleMusic.stop();
      penguinMusic.stop();
    }
    setAppState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        soundEnabled: nextSound,
        voiceEnabled: nextSound,
      },
    }));
    if (nextSound) sfx.pop(true);
    showToast(nextSound ? 'Đã bật âm thanh & giọng nói' : 'Đã tắt âm thanh');
  };

  // Teacher Admin Actions
  const handleAddProfile = (name: string, ageGroup: AgeGroup) => {
    const created = createChildProfile(name, ageGroup);
    setAppState((prev) => ({
      ...prev,
      profiles: [...prev.profiles, created],
      activeProfileId: created.id,
    }));
    showToast(`Đã thêm hồ sơ mới cho ${created.name}`);
  };

  const handleUpdateProfile = (profileId: string, name: string, ageGroup: AgeGroup) => {
    setAppState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === profileId ? { ...p, name: name.trim() || p.name, ageGroup } : p
      ),
    }));
    showToast('Đã cập nhật thông tin của bé');
  };

  const handleResetProfileData = (profileId: string) => {
    setAppState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === profileId
          ? {
              ...p,
              stars: 0,
              totalPlays: 0,
              recentGameIds: [],
              unlockedCompanionIds: ['rabbit', 'bear'],
              unlockedBadgeIds: [],
              chestsOpened: 0,
              lastChestStars: 0,
              playedWorldIds: [],
              playHistory: [],
              bubbleProgress: createDefaultBubbleProgress(),
              penguinProgress: createDefaultPenguinProgress(),
            }
          : p
      ),
    }));
    showToast('Đã đặt lại dữ liệu tiến trình của bé');
  };

  const handleDeleteProfile = (profileId: string) => {
    setAppState((prev) => {
      const remaining = prev.profiles.filter((p) => p.id !== profileId);
      if (remaining.length === 0) return prev;
      const nextActive =
        prev.activeProfileId === profileId ? remaining[0].id : prev.activeProfileId;
      return {
        ...prev,
        profiles: remaining,
        activeProfileId: nextActive,
      };
    });
    showToast('Đã xóa hồ sơ bé');
  };

  const handleUpdateSettings = (nextSettings: AppSettings) => {
    if (!nextSettings.voiceEnabled) stopSpeech();
    setAppState((prev) => ({ ...prev, settings: nextSettings }));
    showToast('Đã lưu cài đặt âm thanh');
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg animate-companion-bounce mb-4">
          <Sparkles className="w-10 h-10" />
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
          MAGIC PLAY WORLD
        </h1>
        <p className="text-sm text-slate-600 mt-1">Đang mở cổng thế giới kỳ thú cho bé...</p>
      </div>
    );
  }

  const isFullViewportGame = screen === 'play' && activeGame.id === 'penguin-ice';

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-slate-900 flex flex-col">
      <HeaderBar
        activeScreen={screen}
        activeProfile={activeProfile}
        activeCompanion={activeCompanion}
        soundEnabled={appState.settings.soundEnabled}
        onNavigate={navigateTo}
        onToggleSound={handleToggleSound}
        onOpenTeacherGate={() => setIsAdultGateOpen(true)}
      />

      <main
        className={
          isFullViewportGame
            ? 'flex-1 w-full mx-auto px-2 sm:px-3 pt-2 pb-2'
            : 'flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8'
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${screen}-${selectedWorld.id}-${activeGame.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {screen === 'home' && (
              <HomeScreen
                profile={activeProfile}
                activeCompanion={activeCompanion}
                soundEnabled={appState.settings.soundEnabled}
                voiceEnabled={appState.settings.voiceEnabled}
                onSelectWorld={handleSelectWorld}
                onStartGame={handleStartGame}
                onToggleFavorite={handleToggleFavorite}
                onNavigate={navigateTo}
              />
            )}

            {screen === 'world' && (
              <WorldGamesScreen
                world={selectedWorld}
                profile={activeProfile}
                soundEnabled={appState.settings.soundEnabled}
                voiceEnabled={appState.settings.voiceEnabled}
                onBack={() => navigateTo('home')}
                onStartGame={handleStartGame}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {screen === 'play' && (
              <PlayGameScreen
                game={activeGame}
                activeCompanion={activeCompanion}
                soundEnabled={appState.settings.soundEnabled}
                voiceEnabled={appState.settings.voiceEnabled}
                bubbleProgress={activeProfile.bubbleProgress}
                onUpdateBubbleProgress={handleUpdateBubbleProgress}
                onRecordBubbleStars={handleRecordBubbleStars}
                penguinProgress={activeProfile.penguinProgress}
                onUpdatePenguinProgress={handleUpdatePenguinProgress}
                onRecordPenguinStars={handleRecordPenguinStars}
                onShowVictory={() => navigateTo('victory')}
                onExit={() => navigateTo('home')}
                onComplete={handleGameComplete}
              />
            )}

            {screen === 'victory' && lastResult && (
              <VictoryScreen
                result={lastResult}
                activeCompanion={activeCompanion}
                soundEnabled={appState.settings.soundEnabled}
                voiceEnabled={appState.settings.voiceEnabled}
                onReplay={() => navigateTo('play')}
                onBackToWorld={() => navigateTo('home')}
                onBackHome={() => navigateTo('home')}
              />
            )}

            {screen === 'rewards' && (
              <RewardsScreen
                profile={activeProfile}
                soundEnabled={appState.settings.soundEnabled}
                voiceEnabled={appState.settings.voiceEnabled}
                onOpenTreasureChest={handleOpenTreasureChest}
                onBack={() => navigateTo('home')}
              />
            )}

            {screen === 'characters' && (
              <CharactersScreen
                profile={activeProfile}
                soundEnabled={appState.settings.soundEnabled}
                voiceEnabled={appState.settings.voiceEnabled}
                onSelectCompanion={handleSelectCompanion}
                onBack={() => navigateTo('home')}
              />
            )}

            {screen === 'profile' && (
              <ProfileScreen
                profiles={appState.profiles}
                activeProfile={activeProfile}
                soundEnabled={appState.settings.soundEnabled}
                onSwitchProfile={(id) => {
                  setAppState((prev) => ({ ...prev, activeProfileId: id }));
                  const found = appState.profiles.find((p) => p.id === id);
                  showToast(`Xin chào ${found?.name ?? 'bé'}!`);
                }}
                onStartGame={handleStartGame}
                onBack={() => navigateTo('home')}
              />
            )}

            {screen === 'teacher' && (
              <TeacherAdminScreen
                profiles={appState.profiles}
                activeProfileId={appState.activeProfileId}
                settings={appState.settings}
                onAddProfile={handleAddProfile}
                onUpdateProfile={handleUpdateProfile}
                onResetProfileData={handleResetProfileData}
                onDeleteProfile={handleDeleteProfile}
                onUpdateSettings={handleUpdateSettings}
                onBack={() => navigateTo('home')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isFullViewportGame && <AppFooter />}

      <AdultGateModal
        isOpen={isAdultGateOpen}
        onClose={() => setIsAdultGateOpen(false)}
        onSuccess={() => {
          setIsAdultGateOpen(false);
          navigateTo('teacher');
        }}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

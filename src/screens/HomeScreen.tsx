import React, { useRef, useState } from 'react';
import { Gift, Heart, Play, Sparkles, Star, Trophy, Volume2 } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import {
  ACTIVE_GAMES,
  BADGES,
  COMPANIONS,
  MAGIC_PLAY_ISLAND_HERO,
  TREASURE_CHEST_IMAGE,
} from '../data/worldData';
import { ChildProfile, CompanionData, GameData, ScreenId, WorldData } from '../types/game';
import { sfx, speakVietnamese } from '../utils/audio';

interface HomeScreenProps {
  profile: ChildProfile;
  activeCompanion: CompanionData;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  onSelectWorld?: (world: WorldData) => void;
  onStartGame: (game: GameData) => void;
  onToggleFavorite: (gameId: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

type GameFilterKey = 'all' | 'favorite' | 'recent';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  activeCompanion,
  soundEnabled,
  voiceEnabled,
  onStartGame,
  onToggleFavorite,
  onNavigate,
}) => {
  const [activeFilter, setActiveFilter] = useState<GameFilterKey>('all');
  const [speechBubble, setSpeechBubble] = useState<string>(activeCompanion.voiceGreeting);
  const gamesSectionRef = useRef<HTMLElement | null>(null);

  const recentGames = profile.recentGameIds
    .map((id) => ACTIVE_GAMES.find((g) => g.id === id))
    .filter((g): g is GameData => Boolean(g));

  const favoriteGames = ACTIVE_GAMES.filter((g) => profile.favoriteGameIds.includes(g.id));

  const displayedGames =
    activeFilter === 'all'
      ? ACTIVE_GAMES
      : activeFilter === 'favorite'
      ? favoriteGames
      : recentGames;

  const canOpenChest = profile.stars - profile.lastChestStars >= 6 || profile.chestsOpened === 0;

  const handleCompanionTap = (companion: CompanionData) => {
    sfx.pop(soundEnabled);
    setSpeechBubble(companion.voiceGreeting);
    speakVietnamese(companion.voiceGreeting, voiceEnabled);
  };

  return (
    <div className="space-y-9 pb-12">
      {/* TRUNG TÂM: MỘT HÒN ĐẢO VUI CHƠI DUY NHẤT – ĐẢO VUI NHỘN */}
      <section aria-labelledby="island-hero-heading" className="space-y-5">
        <div className="relative rounded-[2rem] overflow-hidden border border-sky-200/80 shadow-md bg-sky-100">
          {/* Ảnh 3D toàn cảnh Đảo Vui Nhộn */}
          <div className="relative aspect-[16/10] sm:aspect-[16/8] lg:aspect-[16/7] w-full overflow-hidden">
            <ResilientImage
              src={MAGIC_PLAY_ISLAND_HERO}
              alt="Đảo Vui Nhộn – Magic Play Island"
              fallbackTitle="Đảo Vui Nhộn – Magic Play Island"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-sky-950/25" />

            {/* Tiêu đề chính trên đảo */}
            <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-7 sm:right-7 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="max-w-xl">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-300 drop-shadow">
                  Magic Play World · Khu Vui Chơi Dành Cho Bé 3–6 Tuổi
                </p>
                <h1
                  id="island-hero-heading"
                  className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight drop-shadow mt-0.5"
                >
                  Đảo Vui Nhộn – Magic Play Island
                </h1>
              </div>

              <button
                type="button"
                onClick={() => handleCompanionTap(activeCompanion)}
                className="self-start inline-flex items-center gap-2.5 bg-white/95 hover:bg-white text-slate-900 rounded-2xl px-3.5 py-2 shadow-lg border border-white/80 transition-transform active:scale-95 cursor-pointer max-w-xs"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 ring-2 ring-amber-300">
                  <ResilientImage
                    src={activeCompanion.image}
                    alt={activeCompanion.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-display font-bold text-xs text-sky-700 truncate">
                    {activeCompanion.name}
                  </div>
                  <div className="text-[11px] font-medium text-slate-600 line-clamp-1">
                    Chạm để nghe lời chào
                  </div>
                </div>
                <Volume2 className="w-4 h-4 text-sky-600 shrink-0" />
              </button>
            </div>

            {/* Thanh bạn đồng hành */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-6 sm:right-6">
              <div className="bg-slate-900/65 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs sm:text-sm font-semibold text-white/95 leading-snug">
                  {speechBubble}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  {COMPANIONS.map((c) => {
                    const isActive = c.id === activeCompanion.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleCompanionTap(c)}
                        title={c.name}
                        className={`w-10 h-10 rounded-xl overflow-hidden transition-transform hover:scale-105 cursor-pointer ${
                          isActive
                            ? 'ring-2 ring-amber-400 scale-105'
                            : 'ring-1 ring-white/60 opacity-90 hover:opacity-100'
                        }`}
                      >
                        <ResilientImage
                          src={c.image}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Lối vào nhanh trò chơi ngay trong Đảo Vui Nhộn */}
          <div className="bg-white/95 backdrop-blur-sm border-t border-sky-100 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACTIVE_GAMES.map((game) => (
              <button
                key={game.id}
                type="button"
                onClick={() => {
                  sfx.pop(soundEnabled);
                  onStartGame(game);
                }}
                className="text-left rounded-2xl p-3.5 border border-slate-200/90 hover:border-orange-400 hover:shadow-sm bg-gradient-to-br from-amber-50/60 to-sky-50/50 transition-all flex items-center gap-3 cursor-pointer"
              >
                <div
                  className="w-11 h-11 rounded-2xl text-2xl flex items-center justify-center shrink-0 shadow-xs bg-white"
                  aria-hidden="true"
                >
                  {game.emojiIcon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-orange-600">
                    {game.zoneLabel ?? 'Đảo Vui Nhộn'}
                  </p>
                  <h2 className="font-display font-extrabold text-sm sm:text-base text-slate-900 leading-tight truncate">
                    {game.title}
                  </h2>
                </div>
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: game.accentColor }}
                >
                  <Play className="w-4 h-4 fill-white" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PHÍA DƯỚI: DANH SÁCH TRÒ CHƠI DẠNG THẺ HÌNH ẢNH 3D */}
      <section
        ref={gamesSectionRef}
        aria-labelledby="island-games-heading"
        className="space-y-5 scroll-mt-24"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="island-games-heading"
              className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 flex items-center gap-2.5"
            >
              <Play className="w-7 h-7 text-orange-500 fill-orange-500" />
              <span>Trò Chơi Tại Đảo Vui Nhộn</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Chọn một trò chơi 3D vui nhộn bên dưới để bắt đầu thu thập sao vàng nhé!
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => {
                sfx.tap(soundEnabled);
                setActiveFilter('all');
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Tất cả ({ACTIVE_GAMES.length})
            </button>

            <button
              type="button"
              onClick={() => {
                sfx.tap(soundEnabled);
                setActiveFilter('favorite');
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeFilter === 'favorite'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              ❤️ Yêu thích ({favoriteGames.length})
            </button>

            <button
              type="button"
              onClick={() => {
                sfx.tap(soundEnabled);
                setActiveFilter('recent');
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeFilter === 'recent'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              🕒 Gần đây ({recentGames.length})
            </button>
          </div>
        </div>

        {displayedGames.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
            <p className="text-slate-600 font-medium">
              Chưa có trò chơi nào trong mục này. Bé nhấn nút bên dưới để xem toàn bộ trò chơi nhé!
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-display font-bold text-sm cursor-pointer"
            >
              Xem tất cả trò chơi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedGames.map((game) => {
              const isFav = profile.favoriteGameIds.includes(game.id);
              const cardImage = game.image ?? MAGIC_PLAY_ISLAND_HERO;
              return (
                <div
                  key={game.id}
                  className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <ResilientImage
                      src={cardImage}
                      alt={game.title}
                      fallbackTitle={game.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/10 to-transparent" />

                    <div className="absolute top-3 left-3 w-11 h-11 rounded-2xl bg-white/95 shadow-md flex items-center justify-center text-2xl">
                      {game.emojiIcon}
                    </div>

                    <button
                      type="button"
                      aria-label={isFav ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                      onClick={() => {
                        sfx.pop(soundEnabled);
                        onToggleFavorite(game.id);
                      }}
                      className="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-white/95 hover:bg-white shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                        }`}
                      />
                    </button>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      {game.zoneLabel && (
                        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-300">
                          {game.zoneLabel}
                        </p>
                      )}
                      <h3 className="font-display font-extrabold text-lg sm:text-xl leading-snug line-clamp-2">
                        {game.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col justify-between gap-4 flex-1">
                    <p className="text-sm text-slate-600 line-clamp-2 leading-snug">
                      {game.shortCue}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        sfx.pop(soundEnabled);
                        onStartGame(game);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-white font-display font-bold text-base shadow-sm cursor-pointer active:scale-95 transition-transform hover:opacity-95"
                      style={{ backgroundColor: game.accentColor }}
                    >
                      <Play className="w-5 h-5 fill-white" />
                      Chơi ngay
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* KHO BÁU & PHẦN THƯỞNG CỦA BÉ */}
      <section aria-labelledby="rewards-preview-heading" className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="rewards-preview-heading"
            className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 flex items-center gap-2.5"
          >
            <Trophy className="w-7 h-7 text-amber-500" />
            <span>Kho Báu & Phần Thưởng Của Bé</span>
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('rewards')}
            className="text-sm font-bold text-sky-700 hover:text-sky-900 cursor-pointer whitespace-nowrap"
          >
            Xem tất cả →
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <button
            type="button"
            onClick={() => {
              sfx.pop(soundEnabled);
              onNavigate('rewards');
            }}
            className="text-left bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-sm ring-2 ring-white">
              <ResilientImage
                src={TREASURE_CHEST_IMAGE}
                alt="Rương quà bí mật"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl text-slate-900">
                Rương Quà Bí Mật
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {canOpenChest
                  ? 'Rương quà đang phát sáng! Chạm để mở ngay!'
                  : `Thu thập thêm ${6 - (profile.stars - profile.lastChestStars)} sao để mở quà mới`}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-700 mt-2">
                <Gift className="w-4 h-4" />
                {canOpenChest ? 'Mở rương ngay' : 'Xem rương quà'}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('rewards')}
            className="text-left bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl text-slate-900">Sao & Huy Hiệu</h3>
              <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-6 my-3 tabular-nums">
              <div>
                <div className="font-display font-extrabold text-3xl text-amber-600">
                  {profile.stars}
                </div>
                <div className="text-xs text-slate-500 font-medium">Ngôi sao đã nhận</div>
              </div>
              <div>
                <div className="font-display font-extrabold text-3xl text-sky-600">
                  {profile.unlockedBadgeIds.length}/{BADGES.length}
                </div>
                <div className="text-xs text-slate-500 font-medium">Huy hiệu thành tích</div>
              </div>
            </div>
            <p className="text-xs text-slate-500">Không bao giờ bị trừ sao khi bé thử lại</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('characters')}
            className="text-left bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-xl text-slate-900">Bạn Đồng Hành</h3>
              <Sparkles className="w-5 h-5 text-violet-500" />
            </div>
            <div className="flex items-center gap-2.5">
              {COMPANIONS.map((c) => {
                const unlocked = profile.unlockedCompanionIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    className={`w-14 h-14 rounded-2xl overflow-hidden border-2 ${
                      unlocked ? 'border-emerald-400' : 'border-slate-200 grayscale opacity-55'
                    }`}
                  >
                    <ResilientImage
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-600 mt-3 font-medium">
              Đã mở khóa {profile.unlockedCompanionIds.length}/{COMPANIONS.length} nhân vật đáng yêu
            </p>
          </button>
        </div>
      </section>
    </div>
  );
};

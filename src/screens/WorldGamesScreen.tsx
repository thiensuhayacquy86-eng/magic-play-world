import React from 'react';
import { ArrowLeft, Heart, Play } from 'lucide-react';
import { CompanionMascot } from '../components/CompanionMascot';
import { ResilientImage } from '../components/ResilientImage';
import { COMPANIONS, GAMES } from '../data/worldData';
import { ChildProfile, GameData, WorldData } from '../types/game';
import { sfx } from '../utils/audio';

interface WorldGamesScreenProps {
  world: WorldData;
  profile: ChildProfile;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  onBack: () => void;
  onStartGame: (game: GameData) => void;
  onToggleFavorite: (gameId: string) => void;
}

export const WorldGamesScreen: React.FC<WorldGamesScreenProps> = ({
  world,
  profile,
  soundEnabled,
  voiceEnabled,
  onBack,
  onStartGame,
  onToggleFavorite,
}) => {
  const worldGames = GAMES.filter((g) => g.worldId === world.id);
  const worldCompanion =
    COMPANIONS.find((c) => c.id === world.companionId) ?? COMPANIONS[0];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            sfx.tap(soundEnabled);
            onBack();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-display font-bold text-base shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại bản đồ
        </button>
      </div>

      {/* World 3D Showcase Banner */}
      <section className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 relative min-h-[240px]">
          <ResilientImage
            src={world.image}
            alt={world.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-slate-500">
              Thế giới {world.order} · 4 trò chơi vui nhộn
            </p>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mt-1">
              {world.name}
            </h1>
            <p className="text-base text-slate-600 mt-2">{world.shortDesc}</p>
          </div>

          <CompanionMascot
            companion={worldCompanion}
            message={world.welcomeSpeech}
            voiceEnabled={voiceEnabled}
            soundEnabled={soundEnabled}
            size="sm"
            mood="wave"
          />
        </div>
      </section>

      {/* 4 Dedicated Games for this World */}
      <section aria-label="Danh sách trò chơi" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {worldGames.map((game) => {
          const isFav = profile.favoriteGameIds.includes(game.id);
          return (
            <div
              key={game.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-center gap-5"
            >
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-6xl shrink-0 shadow-inner"
                style={{ backgroundColor: world.softBgHex }}
              >
                {game.emojiIcon}
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex items-center justify-center sm:justify-between gap-2">
                  <h2 className="font-display font-extrabold text-2xl text-slate-900">
                    {game.title}
                  </h2>
                  <button
                    type="button"
                    aria-label={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
                    onClick={() => {
                      sfx.pop(soundEnabled);
                      onToggleFavorite(game.id);
                    }}
                    className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-rose-50 flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-sm sm:text-base text-slate-600 mt-1.5">{game.shortCue}</p>

                <div className="mt-4 flex items-center justify-center sm:justify-between gap-3">
                  <span className="text-sm font-bold text-amber-600">
                    Thưởng +{game.starReward} sao
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.pop(soundEnabled);
                      onStartGame(game);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-display font-bold text-base shadow-sm cursor-pointer hover:opacity-95 active:scale-95 transition-transform"
                    style={{ backgroundColor: game.accentColor }}
                  >
                    <Play className="w-5 h-5 fill-white" />
                    Chơi ngay
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

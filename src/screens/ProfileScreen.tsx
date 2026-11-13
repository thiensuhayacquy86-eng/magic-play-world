import React from 'react';
import { ArrowLeft, Check, Compass, Play, Star, Trophy } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { ACTIVE_GAMES, BADGES, COMPANIONS } from '../data/worldData';
import { ChildProfile, GameData } from '../types/game';
import { sfx } from '../utils/audio';

interface ProfileScreenProps {
  profiles: ChildProfile[];
  activeProfile: ChildProfile;
  soundEnabled: boolean;
  onSwitchProfile: (profileId: string) => void;
  onStartGame: (game: GameData) => void;
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profiles,
  activeProfile,
  soundEnabled,
  onSwitchProfile,
  onStartGame,
  onBack,
}) => {
  const activeCompanion =
    COMPANIONS.find((c) => c.id === activeProfile.avatarCompanionId) ?? COMPANIONS[0];

  const favoriteGames = ACTIVE_GAMES.filter((g) => activeProfile.favoriteGameIds.includes(g.id));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            sfx.tap(soundEnabled);
            onBack();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-display font-bold text-base cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại Đảo Vui Nhộn
        </button>
      </div>

      {/* Active Child Profile Summary */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-md ring-4 ring-amber-100 shrink-0">
          <ResilientImage
            src={activeCompanion.image}
            alt={activeCompanion.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <p className="text-sm font-semibold text-slate-500">
            Hồ sơ bé · Độ tuổi {activeProfile.ageGroup} tuổi
          </p>
          <h1 className="font-display font-extrabold text-3xl text-slate-900 mt-1">
            {activeProfile.name}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Bạn đồng hành hiện tại: <strong>{activeCompanion.name}</strong>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full md:w-auto text-center tabular-nums">
          <div className="bg-amber-50 rounded-2xl px-4 py-3">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500 mx-auto mb-1" />
            <div className="font-display font-extrabold text-2xl text-slate-900">
              {activeProfile.stars}
            </div>
            <div className="text-xs text-slate-600">Ngôi sao</div>
          </div>
          <div className="bg-sky-50 rounded-2xl px-4 py-3">
            <Compass className="w-5 h-5 text-sky-600 mx-auto mb-1" />
            <div className="font-display font-extrabold text-2xl text-slate-900">
              {activeProfile.totalPlays}
            </div>
            <div className="text-xs text-slate-600">Lượt chơi</div>
          </div>
          <div className="bg-emerald-50 rounded-2xl px-4 py-3">
            <Trophy className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <div className="font-display font-extrabold text-2xl text-slate-900">
              {activeProfile.unlockedBadgeIds.length}/{BADGES.length}
            </div>
            <div className="text-xs text-slate-600">Huy hiệu</div>
          </div>
        </div>
      </section>

      {/* Switch Profile (for siblings or classroom tablets) */}
      <section className="space-y-4">
        <h2 className="font-display font-extrabold text-2xl text-slate-900">
          Chọn Bé Đang Chơi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => {
            const comp = COMPANIONS.find((c) => c.id === p.avatarCompanionId) ?? COMPANIONS[0];
            const isCurrent = p.id === activeProfile.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  sfx.pop(soundEnabled);
                  onSwitchProfile(p.id);
                }}
                className={`text-left bg-white rounded-3xl border p-4 flex items-center gap-4 transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-sky-500 ring-2 ring-sky-200 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                  <ResilientImage
                    src={comp.image}
                    alt={comp.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-lg text-slate-900 truncate">
                    {p.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {p.ageGroup} tuổi · {p.stars} sao
                  </div>
                </div>
                {isCurrent && (
                  <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Favorite Games of this Child */}
      <section className="space-y-4">
        <h2 className="font-display font-extrabold text-2xl text-slate-900">
          Trò Chơi Yêu Thích Của {activeProfile.name}
        </h2>
        {favoriteGames.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center text-slate-600">
            Bé hãy nhấn trái tim ở các trò chơi yêu thích để lưu vào đây nhé!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteGames.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-3xl border border-slate-200 p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{game.emojiIcon}</span>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      {game.title}
                    </h3>
                    <p className="text-xs text-slate-500">{game.shortCue}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onStartGame(game)}
                  className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Chơi
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

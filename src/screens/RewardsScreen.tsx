import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Gift, Lock, Sparkles, Star, Trophy } from 'lucide-react';
import { FireworksCelebration } from '../components/FireworksCelebration';
import { ResilientImage } from '../components/ResilientImage';
import { BADGES, COMPANIONS, TREASURE_CHEST_IMAGE } from '../data/worldData';
import { ChildProfile } from '../types/game';
import { sfx, speakVietnamese } from '../utils/audio';

interface RewardsScreenProps {
  profile: ChildProfile;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  onOpenTreasureChest: () => void;
  onBack: () => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({
  profile,
  soundEnabled,
  voiceEnabled,
  onOpenTreasureChest,
  onBack,
}) => {
  const [chestCelebration, setChestCelebration] = useState(false);

  const starsSinceChest = profile.stars - profile.lastChestStars;
  const canOpenChest = profile.chestsOpened === 0 || starsSinceChest >= 6;

  const handleOpenChest = () => {
    if (!canOpenChest) return;
    sfx.chestOpen(soundEnabled);
    setChestCelebration(true);
    speakVietnamese('Woa! Bé vừa mở Rương Quà Bí Mật và nhận thêm 5 ngôi sao vàng!', voiceEnabled);
    onOpenTreasureChest();
    window.setTimeout(() => setChestCelebration(false), 3200);
  };

  return (
    <div className="space-y-8 pb-12">
      <FireworksCelebration active={chestCelebration} />

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

      {/* Hero Secret Treasure Chest & Stars Collection */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div
            className={`w-44 h-44 rounded-3xl overflow-hidden shadow-lg ring-4 ring-white shrink-0 ${
              canOpenChest ? 'animate-companion-bounce' : ''
            }`}
          >
            <ResilientImage
              src={TREASURE_CHEST_IMAGE}
              alt="Rương quà bí mật"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
              Rương Quà Bí Mật
            </h1>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {canOpenChest
                ? 'Chiếc rương đang tỏa sáng lấp lánh! Chạm nút bên dưới để nhận quà bất ngờ (+5 sao)!'
                : `Bé chỉ cần thêm ${6 - starsSinceChest} ngôi sao nữa là rương quà sẽ phát sáng để mở tiếp nhé!`}
            </p>
            <div className="pt-1">
              <button
                type="button"
                disabled={!canOpenChest}
                onClick={handleOpenChest}
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-display font-bold text-base shadow-sm transition-all ${
                  canOpenChest
                    ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer active:scale-95'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Gift className="w-5 h-5" />
                {canOpenChest ? 'Mở rương quà ngay!' : `Đã mở ${profile.chestsOpened} lần`}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-slate-900 flex items-center gap-2">
              <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
              Bộ Sưu Tập Sao
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Mỗi trò chơi bé hoàn thành đều tích lũy sao vào đây
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 my-6 text-center tabular-nums">
            <div className="bg-amber-50 rounded-2xl p-3">
              <div className="font-display font-extrabold text-3xl text-amber-600">
                {profile.stars}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Tổng số sao</div>
            </div>
            <div className="bg-sky-50 rounded-2xl p-3">
              <div className="font-display font-extrabold text-3xl text-sky-600">
                {profile.unlockedBadgeIds.length}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Huy hiệu</div>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-3">
              <div className="font-display font-extrabold text-3xl text-emerald-600">
                {profile.chestsOpened}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Rương đã mở</div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Mẹo nhỏ: Mở rương bí mật nhận thêm sao để làm quen đủ 4 người bạn đồng hành!
          </p>
        </div>
      </section>

      {/* Achievement Badges Grid */}
      <section className="space-y-4">
        <h2 className="font-display font-extrabold text-2xl text-slate-900 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          Huy Hiệu Thành Tích ({profile.unlockedBadgeIds.length}/{BADGES.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BADGES.map((badge) => {
            const unlocked = profile.unlockedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-3xl border p-5 transition-all ${
                  unlocked
                    ? 'bg-white border-amber-200 shadow-sm'
                    : 'bg-slate-50/80 border-slate-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                      unlocked ? 'bg-amber-50' : 'bg-slate-200/70 grayscale'
                    }`}
                  >
                    {badge.icon}
                  </div>
                  {unlocked ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <h3 className="font-display font-bold text-lg text-slate-900">{badge.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Unlocked Companions Summary */}
      <section className="space-y-4">
        <h2 className="font-display font-extrabold text-2xl text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-violet-500" />
          Nhân Vật Đã Mở Khóa
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {COMPANIONS.map((c) => {
            const unlocked = profile.unlockedCompanionIds.includes(c.id);
            return (
              <div
                key={c.id}
                className={`bg-white rounded-3xl border p-4 text-center ${
                  unlocked ? 'border-emerald-200' : 'border-slate-200 opacity-70'
                }`}
              >
                <div
                  className={`w-24 h-24 mx-auto rounded-2xl overflow-hidden mb-3 ${
                    unlocked ? '' : 'grayscale'
                  }`}
                >
                  <ResilientImage
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-display font-bold text-base text-slate-900">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {unlocked ? 'Đã mở khóa' : `Cần ${c.unlockStars} sao`}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

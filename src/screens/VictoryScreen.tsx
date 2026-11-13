import React, { useEffect } from 'react';
import { Award, Compass, RotateCcw, Star } from 'lucide-react';
import { CompanionMascot } from '../components/CompanionMascot';
import { FireworksCelebration } from '../components/FireworksCelebration';
import { ResilientImage } from '../components/ResilientImage';
import { GAMES } from '../data/worldData';
import { CompanionData, GameResult } from '../types/game';
import { sfx, speakVietnamese } from '../utils/audio';

interface VictoryScreenProps {
  result: GameResult;
  activeCompanion: CompanionData;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  onReplay: () => void;
  onBackToWorld: () => void;
  onBackHome: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  result,
  activeCompanion,
  soundEnabled,
  voiceEnabled,
  onReplay,
  onBackToWorld,
  onBackHome,
}) => {
  const game = GAMES.find((g) => g.id === result.gameId);

  useEffect(() => {
    sfx.victory(soundEnabled);
    speakVietnamese(
      `${activeCompanion.voiceCheer} Bé nhận được ${result.starsEarned} ngôi sao lấp lánh!`,
      voiceEnabled
    );
  }, [activeCompanion.voiceCheer, result.starsEarned, soundEnabled, voiceEnabled]);

  return (
    <div className="relative py-6 pb-12">
      <FireworksCelebration active={true} />

      <div className="relative z-10 max-w-2xl mx-auto bg-white rounded-3xl border border-amber-200 shadow-lg p-6 sm:p-10 text-center space-y-6">
        <div className="flex justify-center gap-3">
          {[1, 2, 3].map((idx) => (
            <Star
              key={idx}
              className="w-12 h-12 sm:w-14 sm:h-14 fill-amber-400 text-amber-500 animate-companion-bounce"
              style={{ animationDelay: `${idx * 0.14}s` }}
            />
          ))}
        </div>

        <div>
          <p className="text-sm font-bold text-amber-600">
            Hoàn thành trò chơi {game?.title ?? ''}
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mt-1">
            Hoan Hô! Bé Giỏi Quá!
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-2">
            Bé vừa nhận được <strong className="text-amber-600">+{result.starsEarned} ngôi sao</strong> vào bộ sưu tập!
          </p>
        </div>

        <div className="text-left">
          <CompanionMascot
            companion={activeCompanion}
            message={activeCompanion.voiceCheer}
            voiceEnabled={voiceEnabled}
            soundEnabled={soundEnabled}
            size="md"
            mood="dance"
          />
        </div>

        {/* Newly Unlocked Badges or Companions */}
        {(result.newlyUnlockedBadges.length > 0 ||
          result.newlyUnlockedCompanions.length > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
            <h2 className="font-display font-bold text-lg text-amber-900 flex items-center justify-center gap-2">
              <Award className="w-5 h-5" />
              Quà Mở Khóa Mới!
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {result.newlyUnlockedBadges.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl px-4 py-2.5 border border-amber-200 flex items-center gap-2 shadow-xs"
                >
                  <span className="text-2xl">{b.icon}</span>
                  <span className="font-bold text-sm text-slate-800">{b.name}</span>
                </div>
              ))}
              {result.newlyUnlockedCompanions.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl px-4 py-2 border border-amber-200 flex items-center gap-2 shadow-xs"
                >
                  <ResilientImage
                    src={c.image}
                    alt={c.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <span className="font-bold text-sm text-slate-800">Bạn mới: {c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              sfx.pop(soundEnabled);
              onReplay();
            }}
            className="py-3.5 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-display font-bold text-base flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            Chơi lại
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.tap(soundEnabled);
              onBackToWorld();
            }}
            className="py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-display font-bold text-base flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            Trò chơi khác
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.tap(soundEnabled);
              onBackHome();
            }}
            className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-5 h-5" />
            Về Đảo Vui Nhộn
          </button>
        </div>
      </div>
    </div>
  );
};

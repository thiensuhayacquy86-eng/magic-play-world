import React, { useState } from 'react';
import { ArrowLeft, Check, Lock, Volume2 } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { COMPANIONS } from '../data/worldData';
import { ChildProfile, CompanionId } from '../types/game';
import { sfx, speakVietnamese } from '../utils/audio';

interface CharactersScreenProps {
  profile: ChildProfile;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  onSelectCompanion: (companionId: CompanionId) => void;
  onBack: () => void;
}

export const CharactersScreen: React.FC<CharactersScreenProps> = ({
  profile,
  soundEnabled,
  voiceEnabled,
  onSelectCompanion,
  onBack,
}) => {
  const [wavingId, setWavingId] = useState<CompanionId | null>(null);

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

      <div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
          Bộ Sưu Tập Nhân Vật Đồng Hành
        </h1>
        <p className="text-base text-slate-600 mt-1">
          Chạm vào từng người bạn để nghe lời chào và chọn bạn đồng hành cùng bé nhé!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {COMPANIONS.map((comp) => {
          const unlocked = profile.unlockedCompanionIds.includes(comp.id);
          const isActive = profile.avatarCompanionId === comp.id;
          const isWaving = wavingId === comp.id;

          return (
            <div
              key={comp.id}
              className={`bg-white rounded-3xl border p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 transition-all ${
                isActive ? 'border-sky-400 ring-2 ring-sky-200' : 'border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  sfx.pop(soundEnabled);
                  setWavingId(comp.id);
                  speakVietnamese(comp.voiceGreeting, voiceEnabled);
                  window.setTimeout(() => setWavingId(null), 1500);
                }}
                className={`relative w-36 h-36 rounded-3xl overflow-hidden shrink-0 shadow-md ring-4 ring-white cursor-pointer ${
                  !unlocked ? 'grayscale opacity-75' : isWaving ? 'animate-companion-bounce' : 'animate-float-slow'
                }`}
              >
                <ResilientImage
                  src={comp.image}
                  alt={comp.name}
                  className="w-full h-full object-cover"
                />
              </button>

              <div className="flex-1 text-center sm:text-left space-y-2.5">
                <div>
                  <p className="text-xs font-bold text-slate-500">{comp.species}</p>
                  <h2 className="font-display font-extrabold text-2xl text-slate-900">
                    {comp.name}
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{comp.personality}</p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sfx.pop(soundEnabled);
                      setWavingId(comp.id);
                      speakVietnamese(comp.voiceGreeting, voiceEnabled);
                      window.setTimeout(() => setWavingId(null), 1500);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    Nghe chào bé
                  </button>

                  {unlocked ? (
                    <button
                      type="button"
                      disabled={isActive}
                      onClick={() => {
                        sfx.star(soundEnabled);
                        onSelectCompanion(comp.id);
                      }}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-display font-bold text-sm transition-colors ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
                      }`}
                    >
                      {isActive && <Check className="w-4 h-4" />}
                      {isActive ? 'Đang đồng hành' : 'Chọn đồng hành'}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs">
                      <Lock className="w-3.5 h-3.5" />
                      Mở khóa ở {comp.unlockStars} sao
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

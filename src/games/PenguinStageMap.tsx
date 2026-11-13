import React from 'react';
import { Award, Check, Crown, Fish, Infinity as InfinityIcon, Lock, Play, Sparkles, Star, Trophy } from 'lucide-react';
import { PenguinProgress } from '../types/game';
import {
  ICE_CHAPTERS,
  normalizePenguinProgress,
  PENGUIN_MILESTONE_BADGES,
  PENGUIN_STAGES,
} from './penguinStages';

interface PenguinStageMapProps {
  progress?: PenguinProgress;
  onSelectStage: (stageNumber: number) => void;
  onStartEndless: () => void;
  onLockedTap: (requiredStage: number) => void;
  onBackTitle: () => void;
}

export const PenguinStageMap: React.FC<PenguinStageMapProps> = ({
  progress,
  onSelectStage,
  onStartEndless,
  onLockedTap,
  onBackTitle,
}) => {
  const norm = normalizePenguinProgress(progress);
  const completedCount = norm.completedStages.length;
  const activeStage = PENGUIN_STAGES.find((s) => s.stage === norm.unlockedStage) ?? PENGUIN_STAGES[0];

  return (
    <div className="space-y-5">
      {/* TỔNG QUAN HÀNH TRÌNH 15 MÀN VƯỢT BĂNG */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-sky-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBackTitle}
                className="text-xs font-extrabold text-sky-700 hover:text-sky-900 underline-offset-2 hover:underline cursor-pointer"
              >
                ← Màn hình mở đầu
              </button>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-700">
                Bản Đồ 15 Màn Vượt Băng
              </span>
            </div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">
              Chim Cánh Cụt Vượt Băng – Hành Trình 3 Chặng
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Chọn màn đang mở để nhảy qua các tảng băng, hoặc chơi lại bất kỳ màn nào đã hoàn thành!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2">
              <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-amber-800">Điểm cao</div>
                <div className="font-display font-extrabold text-lg text-amber-700 leading-none">
                  {norm.highScore}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-2xl px-3.5 py-2">
              <Fish className="w-5 h-5 text-sky-600 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-sky-800">Tổng cá</div>
                <div className="font-display font-extrabold text-lg text-sky-700 leading-none">
                  {norm.totalFish}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-3.5 py-2">
              <Star className="w-5 h-5 fill-emerald-500 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-emerald-800">Đã qua</div>
                <div className="font-display font-extrabold text-lg text-emerald-700 leading-none">
                  {completedCount}/15
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectStage(activeStage.stage)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-b from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-display font-extrabold text-sm sm:text-base shadow-md border-b-4 border-blue-800 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Chơi Màn {activeStage.stage}</span>
            </button>
          </div>
        </div>

        {/* THANH TIẾN TRÌNH & 3 HUY HIỆU */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((completedCount / 15) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-slate-700 tabular-nums whitespace-nowrap">
              {completedCount} / 15 màn
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {PENGUIN_MILESTONE_BADGES.map((badge) => {
              const earned = completedCount >= badge.requiredStages || norm.earnedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex items-center gap-3 rounded-2xl border p-2.5 transition-all ${
                    earned
                      ? badge.bgClass
                      : 'bg-slate-50 border-slate-200/80 text-slate-400 opacity-85'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      earned ? 'bg-white shadow-xs' : 'bg-slate-200/70 grayscale'
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-extrabold text-xs sm:text-sm truncate">
                      {badge.title}
                    </div>
                    <div className="text-[11px] font-medium truncate">
                      {earned ? 'Đã mở khóa!' : `Qua ${badge.requiredStages} màn để nhận`}
                    </div>
                  </div>
                  {earned ? <Award className="w-4 h-4 shrink-0" /> : <Lock className="w-3.5 h-3.5 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3 CHẶNG HÀNH TRÌNH */}
      <div className="space-y-4">
        {ICE_CHAPTERS.map((chapter) => {
          const stages = PENGUIN_STAGES.filter((s) => s.chapter === chapter.id);
          const doneCount = stages.filter((s) => norm.completedStages.includes(s.stage)).length;

          return (
            <section
              key={chapter.id}
              aria-label={chapter.title}
              className="relative overflow-hidden rounded-3xl border shadow-sm p-4 sm:p-5"
              style={{
                backgroundColor: chapter.softBg,
                borderColor: chapter.borderHex,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${chapter.gradient} text-white font-display font-extrabold text-lg flex items-center justify-center shadow-sm shrink-0`}
                  >
                    {chapter.id}
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 leading-tight">
                      {chapter.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-slate-600">
                      <span>{chapter.subtitle}</span>
                      <span aria-hidden="true">·</span>
                      <span style={{ color: chapter.accentHex }}>{chapter.difficultyLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-700 tabular-nums">
                  {doneCount === 5 ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-extrabold">
                      <Check className="w-4 h-4" />
                      Hoàn thành · {chapter.badgeTitle}
                    </span>
                  ) : (
                    <span>Tiến độ: {doneCount}/5 màn</span>
                  )}
                </div>
              </div>

              <div className="relative">
                <div
                  aria-hidden="true"
                  className="hidden md:block absolute left-[8%] right-[8%] top-10 h-2 rounded-full bg-white/80 border border-sky-200/70"
                />

                <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
                  {stages.map((st, idx) => {
                    const isCompleted = norm.completedStages.includes(st.stage);
                    const isUnlocked = st.stage <= norm.unlockedStage;
                    const isCurrentFrontier = st.stage === norm.unlockedStage && !isCompleted;
                    const stars = norm.stageStars[st.stage] ?? 0;

                    return (
                      <div
                        key={st.stage}
                        className={`flex flex-col items-center text-center ${
                          idx % 2 === 1 ? 'md:mt-4' : 'md:mt-0'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (isUnlocked) onSelectStage(st.stage);
                            else onLockedTap(st.stage - 1);
                          }}
                          className={`group relative w-full rounded-2xl p-3.5 transition-all flex flex-col items-center gap-2 border-b-4 cursor-pointer ${
                            isCurrentFrontier
                              ? 'bg-white border-sky-500 ring-4 ring-sky-300/70 shadow-lg hover:-translate-y-0.5'
                              : isCompleted
                              ? 'bg-white border-emerald-400 shadow-sm hover:-translate-y-0.5 hover:shadow-md'
                              : isUnlocked
                              ? 'bg-white border-cyan-400 shadow-sm hover:-translate-y-0.5'
                              : 'bg-white/65 border-slate-300 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <div
                            className={`relative w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl shadow-md transition-transform group-hover:scale-105 ${
                              !isUnlocked
                                ? 'bg-slate-200 text-slate-500'
                                : isCompleted
                                ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-white'
                                : `bg-gradient-to-b ${chapter.gradient} text-white`
                            }`}
                          >
                            {!isUnlocked ? (
                              <Lock className="w-6 h-6" />
                            ) : st.stage === 15 ? (
                              <Crown className="w-7 h-7 fill-amber-200" />
                            ) : (
                              <span>{st.stage}</span>
                            )}
                            {isCompleted && (
                              <span
                                aria-hidden="true"
                                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 border-2 border-white text-white flex items-center justify-center shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            )}
                          </div>

                          <div className="space-y-0.5 w-full">
                            <div className="font-display font-extrabold text-sm text-slate-900 leading-tight">
                              Màn {st.stage}
                              {isCurrentFrontier ? ' · Đang mở' : ''}
                            </div>
                            <p className="text-[11px] font-semibold text-slate-600 leading-snug line-clamp-2 min-h-[30px]">
                              {st.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-center gap-1 pt-0.5 min-h-[20px]">
                            {isCompleted ? (
                              [1, 2, 3].map((sIdx) => (
                                <Star
                                  key={sIdx}
                                  className={`w-4 h-4 ${
                                    sIdx <= stars
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))
                            ) : isUnlocked ? (
                              <span
                                className="text-xs font-extrabold"
                                style={{ color: chapter.accentHex }}
                              >
                                Chạm để chơi →
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-slate-400">
                                Qua Màn {st.stage - 1}
                              </span>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* CHẾ ĐỘ CHƠI VÔ TẬN (MỞ KHÓA SAU MÀN 15) */}
      <section
        aria-label="Chế độ chơi vô tận"
        className={`rounded-3xl p-5 border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          norm.endlessUnlocked
            ? 'bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-600 text-white border-amber-300 shadow-lg'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}
      >
        <div className="flex items-start sm:items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              norm.endlessUnlocked
                ? 'bg-white/20 backdrop-blur-xs text-amber-200'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            {norm.endlessUnlocked ? (
              <InfinityIcon className="w-8 h-8" />
            ) : (
              <Lock className="w-7 h-7" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-lg sm:text-xl">
                Chế Độ Chơi Vô Tận – Biển Băng Bất Tận
              </h3>
              {norm.endlessUnlocked && <Sparkles className="w-5 h-5 text-amber-300" />}
            </div>
            <p className={`text-xs sm:text-sm ${norm.endlessUnlocked ? 'text-white/90' : 'text-slate-500'}`}>
              {norm.endlessUnlocked
                ? 'Đường băng được tạo mới liên tục! Nhảy thật xa để lập kỷ lục điểm, cá và quãng đường!'
                : 'Hoàn thành Màn 15 (Vương Quốc Băng Giá) để mở khóa Chế độ Chơi Vô Tận!'}
            </p>
            {norm.endlessUnlocked && norm.endlessBestScore > 0 && (
              <p className="text-xs font-bold text-amber-200 tabular-nums">
                Kỷ lục vô tận: {norm.endlessBestDistance} bước băng · {norm.endlessBestScore} điểm ·{' '}
                {norm.endlessBestFish} cá
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (norm.endlessUnlocked) onStartEndless();
            else onLockedTap(15);
          }}
          className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-display font-extrabold text-sm sm:text-base transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            norm.endlessUnlocked
              ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-md border-b-4 border-amber-600'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          {norm.endlessUnlocked ? (
            <>
              <InfinityIcon className="w-5 h-5" />
              <span>Vào Chơi Vô Tận</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Mở sau Màn 15</span>
            </>
          )}
        </button>
      </section>
    </div>
  );
};

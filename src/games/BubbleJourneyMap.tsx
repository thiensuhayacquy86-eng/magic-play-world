import React from 'react';
import { Award, Check, Crown, Gem, Infinity as InfinityIcon, Lock, Play, Sparkles, Star, Trophy } from 'lucide-react';
import { BubbleLevelProgress } from '../types/game';
import {
  BUBBLE_CHAPTERS,
  BUBBLE_MILESTONE_BADGES,
  BUBBLE_STAGES,
  normalizeBubbleProgress,
} from './bubbleStages';

interface BubbleJourneyMapProps {
  progress?: BubbleLevelProgress;
  onSelectStage: (stageNumber: number) => void;
  onStartEndless: () => void;
  onLockedTap: (requiredStage: number) => void;
}

export const BubbleJourneyMap: React.FC<BubbleJourneyMapProps> = ({
  progress,
  onSelectStage,
  onStartEndless,
  onLockedTap,
}) => {
  const norm = normalizeBubbleProgress(progress);
  const completedCount = norm.completedStages.length;
  const activeStage = BUBBLE_STAGES.find((s) => s.stage === norm.unlockedStage) ?? BUBBLE_STAGES[0];

  return (
    <div className="space-y-5">
      {/* TỔNG QUAN HÀNH TRÌNH & THÀNH TÍCH TÍCH LŨY */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-sky-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-wider text-sky-700">
              Bản Đồ 15 Màn Chơi · 3 Chặng Khám Phá
            </p>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">
              Hành Trình Săn Kho Báu Bong Bóng
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Chạm vào màn đang mở để bắt đầu nhiệm vụ, hoặc chơi lại bất kỳ màn nào đã chinh phục.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-amber-800">Tổng sao</div>
                <div className="font-display font-extrabold text-lg text-amber-700 leading-none">
                  {norm.totalStars}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-2xl px-3.5 py-2">
              <Gem className="w-5 h-5 text-sky-500 fill-sky-300 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-sky-800">Kim cương</div>
                <div className="font-display font-extrabold text-lg text-sky-700 leading-none">
                  {norm.totalDiamonds}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-3.5 py-2">
              <Trophy className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-emerald-800">Hoàn thành</div>
                <div className="font-display font-extrabold text-lg text-emerald-700 leading-none">
                  {completedCount}/15
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectStage(activeStage.stage)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-b from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-display font-extrabold text-sm sm:text-base shadow-md border-b-4 border-orange-700 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Chơi tiếp Màn {activeStage.stage}</span>
            </button>
          </div>
        </div>

        {/* THANH TIẾN TRÌNH & 3 HUY HIỆU CHẶNG */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-sky-500 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((completedCount / 15) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-slate-700 tabular-nums whitespace-nowrap">
              {completedCount} / 15 màn
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {BUBBLE_MILESTONE_BADGES.map((badge) => {
              const earned = completedCount >= badge.requiredStages || norm.earnedBubbleBadges.includes(badge.id);
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
                      {earned ? 'Đã đạt được!' : `Mở khi qua ${badge.requiredStages} màn`}
                    </div>
                  </div>
                  {earned ? (
                    <Award className="w-4 h-4 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BẢN ĐỒ 3 CHẶNG ĐƯỜNG 3D SINH ĐỘNG */}
      <div className="space-y-4">
        {BUBBLE_CHAPTERS.map((chapter) => {
          const chapterStages = BUBBLE_STAGES.filter((st) => st.chapter === chapter.id);
          const chapterDoneCount = chapterStages.filter((st) =>
            norm.completedStages.includes(st.stage)
          ).length;
          const isChapterUnlocked = norm.unlockedStage >= chapterStages[0].stage;

          return (
            <section
              key={chapter.id}
              aria-label={chapter.title}
              className="relative overflow-hidden rounded-3xl border shadow-sm p-4 sm:p-5 transition-all"
              style={{
                backgroundColor: chapter.softBgHex,
                borderColor: chapter.borderHex,
              }}
            >
              {/* Dải màu 3D đỉnh chặng */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${chapter.themeGradient} text-white font-display font-extrabold text-lg flex items-center justify-center shadow-sm shrink-0`}
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
                      <span style={{ color: chapter.accentHex }}>{chapter.speedLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 tabular-nums">
                  {chapterDoneCount === 5 ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-extrabold">
                      <Check className="w-4 h-4" />
                      Hoàn thành chặng · {chapter.badgeName}
                    </span>
                  ) : !isChapterUnlocked ? (
                    <span className="inline-flex items-center gap-1.5 text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                      Mở ở Màn {chapterStages[0].stage}
                    </span>
                  ) : (
                    <span>Tiến độ chặng: {chapterDoneCount}/5 màn</span>
                  )}
                </div>
              </div>

              {/* ĐƯỜNG ĐI 5 MÀN TRONG CHẶNG (ZIGZAG 3D NODES) */}
              <div className="relative">
                {/* Đường nối hành trình trên desktop */}
                <div
                  aria-hidden="true"
                  className="hidden md:block absolute left-[8%] right-[8%] top-10 h-2 rounded-full bg-white/75 border border-slate-200/70"
                />

                <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
                  {chapterStages.map((stageCfg, idx) => {
                    const isCompleted = norm.completedStages.includes(stageCfg.stage);
                    const isUnlocked = stageCfg.stage <= norm.unlockedStage;
                    const isCurrentFrontier =
                      stageCfg.stage === norm.unlockedStage && !isCompleted;
                    const stars = norm.stageStars[stageCfg.stage] ?? 0;

                    const verticalOffsetClass =
                      idx % 2 === 1 ? 'md:mt-4' : 'md:mt-0';

                    return (
                      <div
                        key={stageCfg.stage}
                        className={`flex flex-col items-center text-center ${verticalOffsetClass}`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (isUnlocked) {
                              onSelectStage(stageCfg.stage);
                            } else {
                              onLockedTap(stageCfg.stage - 1);
                            }
                          }}
                          className={`group relative w-full rounded-2xl p-3.5 transition-all flex flex-col items-center gap-2 border-b-4 cursor-pointer ${
                            isCurrentFrontier
                              ? 'bg-white border-orange-500 ring-4 ring-orange-300/70 shadow-lg hover:-translate-y-0.5'
                              : isCompleted
                              ? 'bg-white border-emerald-400 shadow-sm hover:-translate-y-0.5 hover:shadow-md'
                              : isUnlocked
                              ? 'bg-white border-sky-400 shadow-sm hover:-translate-y-0.5'
                              : 'bg-white/65 border-slate-300 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {/* Nút tròn 3D hiển thị số màn */}
                          <div
                            className={`relative w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl shadow-md transition-transform group-hover:scale-105 ${
                              !isUnlocked
                                ? 'bg-slate-200 text-slate-500'
                                : isCompleted
                                ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-white'
                                : `bg-gradient-to-b ${chapter.themeGradient} text-white`
                            }`}
                          >
                            {!isUnlocked ? (
                              <Lock className="w-6 h-6" />
                            ) : stageCfg.isFinale ? (
                              <Crown className="w-7 h-7 fill-amber-200" />
                            ) : (
                              <span>{stageCfg.stage}</span>
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

                          {/* Tên màn & Nhiệm vụ ngắn gọn */}
                          <div className="space-y-0.5 w-full">
                            <div className="font-display font-extrabold text-sm text-slate-900 leading-tight">
                              Màn {stageCfg.stage}
                              {isCurrentFrontier ? ' · Đang mở' : ''}
                            </div>
                            <p className="text-[11px] font-semibold text-slate-600 leading-snug line-clamp-2 min-h-[30px]">
                              {stageCfg.missionSummary}
                            </p>
                          </div>

                          {/* Số sao đạt được hoặc trạng thái khóa */}
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
                                Hoàn thành Màn {stageCfg.stage - 1}
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

      {/* CHẾ ĐỘ CHƠI TỰ DO VÔ HẠN (MỞ KHÓA SAU MÀN 15) */}
      <section
        aria-label="Chế độ chơi tự do vô hạn"
        className={`rounded-3xl p-5 border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          norm.endlessUnlocked
            ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white border-amber-300 shadow-lg'
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
                Chế Độ Chơi Tự Do Vô Hạn
              </h3>
              {norm.endlessUnlocked && <Sparkles className="w-5 h-5 text-amber-300" />}
            </div>
            <p className={`text-xs sm:text-sm ${norm.endlessUnlocked ? 'text-white/90' : 'text-slate-500'}`}>
              {norm.endlessUnlocked
                ? 'Bong bóng xuất hiện theo từng đợt tăng dần, săn sao & kim cương không giới hạn thời gian!'
                : 'Chinh phục Màn 15 (Vương Quốc Kho Báu) để mở khóa chế độ chơi tự do vô hạn!'}
            </p>
            {norm.endlessUnlocked && norm.endlessBestWave > 0 && (
              <p className="text-xs font-bold text-amber-200 tabular-nums">
                Kỷ lục tự do: Đợt {norm.endlessBestWave} · {norm.endlessBestStars} sao ·{' '}
                {norm.endlessBestDiamonds} kim cương
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (norm.endlessUnlocked) {
              onStartEndless();
            } else {
              onLockedTap(15);
            }
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
              <span>Vào Chơi Tự Do</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Mở khóa sau Màn 15</span>
            </>
          )}
        </button>
      </section>
    </div>
  );
};

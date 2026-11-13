import React, { useEffect, useState } from 'react';
import { ArrowLeft, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { BubbleTreasureGame } from '../games/BubbleTreasureGame';
import { MagicFruitCatchGame } from '../games/MagicFruitCatchGame';
import { PenguinIceGame } from '../games/PenguinIceGame';
import { BubbleLevelProgress, CompanionData, GameData, PenguinProgress } from '../types/game';
import { bubbleMusic, penguinMusic, sfx, speakVietnamese, stopSpeech } from '../utils/audio';

interface PlayGameScreenProps {
  game: GameData;
  activeCompanion: CompanionData;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  bubbleProgress?: BubbleLevelProgress;
  onUpdateBubbleProgress?: (progress: BubbleLevelProgress) => void;
  onRecordBubbleStars?: (starsEarned: number) => void;
  penguinProgress?: PenguinProgress;
  onUpdatePenguinProgress?: (progress: PenguinProgress) => void;
  onRecordPenguinStars?: (starsEarned: number) => void;
  onShowVictory?: () => void;
  onExit: () => void;
  onComplete: (starsEarned: number) => void;
}

export const PlayGameScreen: React.FC<PlayGameScreenProps> = ({
  game,
  soundEnabled,
  voiceEnabled,
  bubbleProgress,
  onUpdateBubbleProgress,
  onRecordBubbleStars,
  penguinProgress,
  onUpdatePenguinProgress,
  onRecordPenguinStars,
  onShowVictory,
  onExit,
  onComplete,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [resetSeed, setResetSeed] = useState(0);

  useEffect(() => {
    if (game.id !== 'fruit-catch') {
      speakVietnamese(game.voiceInstruction, voiceEnabled);
    }
    return () => {
      stopSpeech();
      bubbleMusic.stop();
      penguinMusic.stop();
    };
  }, [game.id, game.voiceInstruction, voiceEnabled]);

  const isCompactArena = game.id === 'penguin-ice';

  return (
    <div className={isCompactArena ? 'space-y-2 pb-1' : 'space-y-5 pb-10'}>
      {/* Clean Distraction-Free Game Top Controls */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200 shadow-xs ${
          isCompactArena ? 'rounded-2xl px-3 py-1.5' : 'rounded-3xl px-4 py-3 gap-3'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              bubbleMusic.stop();
              penguinMusic.stop();
              sfx.tap(soundEnabled);
              onExit();
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-bold cursor-pointer ${
              isCompactArena ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm rounded-2xl gap-2'
            }`}
          >
            <ArrowLeft className={isCompactArena ? 'w-4 h-4' : 'w-5 h-5'} />
            Thoát
          </button>
          <div className="flex items-center gap-1.5">
            <span className={isCompactArena ? 'text-xl' : 'text-2xl'}>{game.emojiIcon}</span>
            <h1
              className={`font-display font-extrabold text-slate-900 ${
                isCompactArena ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'
              }`}
            >
              {game.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => speakVietnamese(game.voiceInstruction, voiceEnabled)}
            title="Nghe hướng dẫn"
            className={`inline-flex items-center gap-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold cursor-pointer ${
              isCompactArena ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2.5 text-sm rounded-2xl gap-1.5'
            }`}
          >
            <Volume2 className={isCompactArena ? 'w-4 h-4' : 'w-5 h-5'} />
            <span className="hidden sm:inline">Hướng dẫn</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.tap(soundEnabled);
              setResetSeed((s) => s + 1);
              setIsPaused(false);
            }}
            title="Chơi lại từ đầu"
            className={`inline-flex items-center gap-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold cursor-pointer ${
              isCompactArena ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2.5 text-sm rounded-2xl gap-1.5'
            }`}
          >
            <RotateCcw className={isCompactArena ? 'w-4 h-4' : 'w-5 h-5'} />
            <span className="hidden sm:inline">Chơi lại</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.tap(soundEnabled);
              setIsPaused((p) => !p);
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer ${
              isCompactArena ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm rounded-2xl'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
          </button>
        </div>
      </div>

      {/* Active Game Canvas Container */}
      <div className="relative" key={`${game.id}-${resetSeed}`}>
        {game.id === 'fruit-catch' && (
          <MagicFruitCatchGame
            soundEnabled={soundEnabled}
            voiceEnabled={voiceEnabled}
            isPaused={isPaused}
            onComplete={onComplete}
          />
        )}
        {game.id === 'bubble-pop' && (
          <BubbleTreasureGame
            soundEnabled={soundEnabled}
            voiceEnabled={voiceEnabled}
            isPaused={isPaused}
            savedProgress={bubbleProgress}
            onUpdateProgress={onUpdateBubbleProgress}
            onRecordStars={onRecordBubbleStars}
            onShowVictory={onShowVictory}
            onComplete={onComplete}
          />
        )}
        {game.id === 'penguin-ice' && (
          <PenguinIceGame
            soundEnabled={soundEnabled}
            voiceEnabled={voiceEnabled}
            isPaused={isPaused}
            savedProgress={penguinProgress}
            onUpdateProgress={onUpdatePenguinProgress}
            onRecordStars={onRecordPenguinStars}
            onShowVictory={onShowVictory}
            onComplete={onComplete}
          />
        )}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-20 rounded-3xl bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-7 max-w-sm w-full text-center space-y-5 shadow-xl">
              <div className="text-5xl">{game.emojiIcon}</div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900">
                Đang tạm dừng
              </h2>
              <p className="text-sm text-slate-600">
                Bé nghỉ tay một chút rồi tụi mình chơi tiếp nhé!
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaused(false)}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-lg cursor-pointer"
                >
                  Tiếp tục chơi
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
                >
                  Quay lại Đảo Vui Nhộn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

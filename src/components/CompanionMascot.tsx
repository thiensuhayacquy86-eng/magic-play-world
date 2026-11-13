import React, { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { CompanionData } from '../types/game';
import { speakVietnamese, sfx } from '../utils/audio';
import { ResilientImage } from './ResilientImage';

interface CompanionMascotProps {
  companion: CompanionData;
  message: string;
  voiceEnabled: boolean;
  soundEnabled: boolean;
  size?: 'sm' | 'md' | 'lg';
  mood?: 'wave' | 'dance' | 'idle';
  onTap?: () => void;
}

export const CompanionMascot: React.FC<CompanionMascotProps> = ({
  companion,
  message,
  voiceEnabled,
  soundEnabled,
  size = 'md',
  mood = 'wave',
  onTap,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isDancing, setIsDancing] = useState(mood === 'dance');

  useEffect(() => {
    setIsDancing(mood === 'dance');
  }, [mood]);

  // Subtle natural blink pulse every ~3.8 seconds
  useEffect(() => {
    const interval = window.setInterval(() => {
      setIsBlinking(true);
      window.setTimeout(() => setIsBlinking(false), 180);
    }, 3800);
    return () => window.clearInterval(interval);
  }, []);

  const avatarSize =
    size === 'lg'
      ? 'w-28 h-28 sm:w-32 sm:h-32'
      : size === 'sm'
      ? 'w-16 h-16 sm:w-20 sm:h-20'
      : 'w-20 h-20 sm:w-24 sm:h-24';

  const handleInteract = () => {
    sfx.pop(soundEnabled);
    setIsDancing(true);
    speakVietnamese(message, voiceEnabled);
    window.setTimeout(() => setIsDancing(mood === 'dance'), 1200);
    onTap?.();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <button
        type="button"
        onClick={handleInteract}
        aria-label={`Nghe ${companion.name} nói`}
        className={`relative shrink-0 rounded-3xl overflow-hidden shadow-md ring-4 ring-white transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${avatarSize} ${
          isDancing ? 'animate-companion-bounce' : 'animate-float-slow'
        }`}
      >
        <ResilientImage
          src={companion.image}
          alt={companion.name}
          className="w-full h-full object-cover"
          fallbackTitle={companion.name}
        />
        {/* Subtle blink highlight veil */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-amber-50/35 transition-opacity duration-150 ${
            isBlinking ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </button>

      <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl px-4 py-3 shadow-sm max-w-xl">
        <div className="flex items-center justify-between gap-3 mb-1">
          <span className="font-display font-bold text-base text-slate-900">
            {companion.name}
          </span>
          <button
            type="button"
            onClick={handleInteract}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Nghe giọng nói</span>
          </button>
        </div>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

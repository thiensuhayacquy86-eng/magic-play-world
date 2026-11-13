import React from 'react';
import { Award, Compass, Gift, Settings, Star, User, Users, Volume2, VolumeX } from 'lucide-react';
import { ChildProfile, CompanionData, ScreenId } from '../types/game';
import { ResilientImage } from './ResilientImage';

interface HeaderBarProps {
  activeScreen: ScreenId;
  activeProfile: ChildProfile;
  activeCompanion: CompanionData;
  soundEnabled: boolean;
  onNavigate: (screen: ScreenId) => void;
  onToggleSound: () => void;
  onOpenTeacherGate: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeScreen,
  activeProfile,
  activeCompanion,
  soundEnabled,
  onNavigate,
  onToggleSound,
  onOpenTeacherGate,
}) => {
  const navItems: { id: ScreenId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Đảo Vui Nhộn', icon: <Compass className="w-4 h-4" /> },
    { id: 'characters', label: 'Nhân vật', icon: <Users className="w-4 h-4" /> },
    { id: 'rewards', label: 'Phần thưởng', icon: <Gift className="w-4 h-4" /> },
    { id: 'profile', label: 'Hồ sơ', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-3">
        {/* Zone 1: Logo MAGIC PLAY WORLD + ĐẢO VUI NHỘN */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 sm:gap-3 text-left shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-500 rounded-xl"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-sm shrink-0">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-extrabold text-sm sm:text-lg tracking-tight text-slate-900 whitespace-nowrap leading-tight">
              MAGIC PLAY WORLD
            </div>
            <p className="text-[11px] sm:text-xs font-extrabold tracking-wide text-sky-700 whitespace-nowrap">
              ĐẢO VUI NHỘN · MAGIC PLAY ISLAND
            </p>
          </div>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-semibold text-slate-600"
        >
          {navItems.map((item) => {
            const isActive =
              activeScreen === item.id || (activeScreen === 'world' && item.id === 'home');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`inline-flex items-center gap-1.5 py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-orange-500 text-slate-900'
                    : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Child avatar + stars + Sound toggle + Adult Settings */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            title="Hồ sơ của bé"
            className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100/90 border border-amber-200/80 rounded-xl px-2.5 py-1.5 transition-colors cursor-pointer shrink-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden shrink-0 ring-2 ring-white">
              <ResilientImage
                src={activeCompanion.image}
                alt={activeCompanion.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden sm:inline text-sm font-bold text-slate-800 max-w-[90px] truncate">
              {activeProfile.name}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-extrabold text-amber-700 tabular-nums whitespace-nowrap">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              {activeProfile.stars}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            title={soundEnabled ? 'Đang bật âm thanh' : 'Đang tắt âm thanh'}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
              soundEnabled
                ? 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={onOpenTeacherGate}
            aria-label="Cài đặt dành cho người lớn"
            title="Góc quản trị giáo viên & phụ huynh"
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Compact mobile nav bar on small screens */}
      <nav
        aria-label="Menu di động"
        className="md:hidden flex items-center justify-around border-t border-slate-100 px-2 py-1 bg-white"
      >
        {navItems.map((item) => {
          const isActive =
            activeScreen === item.id || (activeScreen === 'world' && item.id === 'home');
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                isActive ? 'bg-orange-50 text-orange-700' : 'text-slate-600'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};

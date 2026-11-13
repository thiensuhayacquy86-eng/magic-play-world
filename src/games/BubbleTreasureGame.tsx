import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Crown,
  Gem,
  Infinity as InfinityIcon,
  Map,
  Music,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { TREASURE_CHEST_IMAGE } from '../data/worldData';
import { BubbleLevelProgress, BubbleMilestoneBadgeId } from '../types/game';
import { bubbleMusic, sfx, speakVietnamese } from '../utils/audio';
import { BubbleJourneyMap } from './BubbleJourneyMap';
import {
  BUBBLE_CHAPTERS,
  BUBBLE_MILESTONE_BADGES,
  BUBBLE_STAGES,
  BubbleKind,
  BubbleStageConfig,
  getEndlessWaveConfig,
  normalizeBubbleProgress,
  StageRunStats,
} from './bubbleStages';

interface BubbleTreasureGameProps {
  soundEnabled: boolean;
  voiceEnabled: boolean;
  isPaused: boolean;
  savedProgress?: BubbleLevelProgress;
  onUpdateProgress?: (progress: BubbleLevelProgress) => void;
  onRecordStars?: (starsEarned: number) => void;
  onShowVictory?: () => void;
  onComplete: (starsEarned: number) => void;
}

type ViewMode = 'map' | 'stage' | 'endless';
type BubbleColorKey = 'red' | 'yellow' | 'blue' | 'green' | 'purple' | 'pink';
type RewardKind = 'star' | 'diamond' | 'gem' | 'chest';

interface BubbleColorTheme {
  key: BubbleColorKey;
  label: string;
  rimHex: string;
  tintRgba: string;
  glowRgba: string;
}

const BUBBLE_PALETTE: BubbleColorTheme[] = [
  {
    key: 'red',
    label: 'Đỏ',
    rimHex: '#FF4D6D',
    tintRgba: 'rgba(255, 77, 109, 0.22)',
    glowRgba: 'rgba(255, 77, 109, 0.34)',
  },
  {
    key: 'yellow',
    label: 'Vàng',
    rimHex: '#FBBF24',
    tintRgba: 'rgba(251, 191, 36, 0.22)',
    glowRgba: 'rgba(251, 191, 36, 0.34)',
  },
  {
    key: 'blue',
    label: 'Xanh dương',
    rimHex: '#38BDF8',
    tintRgba: 'rgba(56, 189, 248, 0.22)',
    glowRgba: 'rgba(56, 189, 248, 0.34)',
  },
  {
    key: 'green',
    label: 'Xanh lá',
    rimHex: '#34D399',
    tintRgba: 'rgba(52, 211, 153, 0.22)',
    glowRgba: 'rgba(52, 211, 153, 0.34)',
  },
  {
    key: 'purple',
    label: 'Tím',
    rimHex: '#A78BFA',
    tintRgba: 'rgba(167, 139, 250, 0.24)',
    glowRgba: 'rgba(167, 139, 250, 0.34)',
  },
  {
    key: 'pink',
    label: 'Hồng',
    rimHex: '#F472B6',
    tintRgba: 'rgba(244, 114, 182, 0.22)',
    glowRgba: 'rgba(244, 114, 182, 0.34)',
  },
];

const GEM_COLORS = ['#F43F5E', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
const BACKDROP_URL = '/src/assets/images/bubble_treasure_backdrop_1794544817067.jpg';

interface SoapBubble {
  id: number;
  x: number;
  y: number;
  baseX: number;
  radius: number;
  sizeTier: 0 | 1 | 2;
  vy: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  wobblePhase: number;
  color: BubbleColorTheme;
  bubbleKind: BubbleKind;
  spawnTime: number;
}

interface PopParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'star' | 'diamond';
}

interface PopRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface FlyingReward {
  id: number;
  kind: RewardKind;
  gemColor: string;
  starAmount: number;
  diamondAmount: number;
  gemAmount: number;
  chestAmount: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  elapsed: number;
  revealDuration: number;
  flyDuration: number;
  credited: boolean;
  label: string;
}

interface HarvestedBadgeItem {
  id: number;
  kind: RewardKind;
  gemColor: string;
}

const EMPTY_RUN_STATS: StageRunStats = {
  totalPops: 0,
  normalPops: 0,
  starPops: 0,
  diamondPops: 0,
  treasurePops: 0,
  bigPops: 0,
  smallPops: 0,
  starsCollected: 0,
  diamondsCollected: 0,
  gemsCollected: 0,
  chestsCollected: 0,
  harvestedTotal: 0,
  currentStreak: 0,
  bestStreak: 0,
};

function drawFivePointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  fill: string,
  highlight: string
) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();

  const grad = ctx.createRadialGradient(
    cx - outerR * 0.25,
    cy - outerR * 0.25,
    outerR * 0.1,
    cx,
    cy,
    outerR
  );
  grad.addColorStop(0, highlight);
  grad.addColorStop(0.55, fill);
  grad.addColorStop(1, '#D97706');

  ctx.shadowColor = 'rgba(251, 191, 36, 0.75)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#FEF9C3';
  ctx.stroke();
  ctx.restore();
}

function drawBlueDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  const topW = size * 0.55;
  const midW = size * 0.95;
  const topY = cy - size * 0.65;
  const midY = cy - size * 0.12;
  const botY = cy + size * 0.85;

  const grad = ctx.createLinearGradient(cx - midW, topY, cx + midW, botY);
  grad.addColorStop(0, '#E0F2FE');
  grad.addColorStop(0.45, '#38BDF8');
  grad.addColorStop(1, '#0284C7');

  ctx.shadowColor = 'rgba(56, 189, 248, 0.85)';
  ctx.shadowBlur = 14;

  ctx.beginPath();
  ctx.moveTo(cx - topW, topY);
  ctx.lineTo(cx + topW, topY);
  ctx.lineTo(cx + midW, midY);
  ctx.lineTo(cx, botY);
  ctx.lineTo(cx - midW, midY);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#F0F9FF';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - midW, midY);
  ctx.lineTo(cx + midW, midY);
  ctx.moveTo(cx - topW, topY);
  ctx.lineTo(cx - midW * 0.35, midY);
  ctx.lineTo(cx, botY);
  ctx.lineTo(cx + midW * 0.35, midY);
  ctx.lineTo(cx + topW, topY);
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

function drawFacetedGem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  ctx.save();
  const r = size * 0.85;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();

  const grad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.1, cx, cy, r);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.35, color);
  grad.addColorStop(1, '#1E1B4B');

  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.stroke();
  ctx.restore();
}

function drawMiniTreasureChest(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  const w = size * 1.5;
  const h = size * 1.15;
  const left = cx - w / 2;
  const top = cy - h / 2;

  ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
  ctx.shadowBlur = 16;

  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.roundRect(left, top + h * 0.34, w, h * 0.66, 6);
  ctx.fill();

  const lidGrad = ctx.createLinearGradient(cx, top, cx, top + h * 0.45);
  lidGrad.addColorStop(0, '#F59E0B');
  lidGrad.addColorStop(1, '#92400E');
  ctx.fillStyle = lidGrad;
  ctx.beginPath();
  ctx.roundRect(left - 2, top, w + 4, h * 0.46, [10, 10, 3, 3]);
  ctx.fill();

  ctx.fillStyle = '#FDE047';
  ctx.fillRect(left + w * 0.16, top, w * 0.12, h);
  ctx.fillRect(left + w * 0.72, top, w * 0.12, h);
  ctx.fillRect(left - 2, top + h * 0.36, w + 4, h * 0.12);

  ctx.beginPath();
  ctx.arc(cx, top + h * 0.46, size * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = '#FEF08A';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#D97706';
  ctx.stroke();

  ctx.restore();
}

function drawSoapBubble(ctx: CanvasRenderingContext2D, bubble: SoapBubble, timeSec: number) {
  const { x, y, radius, wobblePhase, color, bubbleKind } = bubble;
  const scaleX = 1 + Math.sin(timeSec * 2.5 + wobblePhase) * 0.032;
  const scaleY = 1 - Math.sin(timeSec * 2.5 + wobblePhase) * 0.032;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);

  // Outer aura distinguishing the 4 bubble types
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radius + (bubbleKind === 'treasure' ? 7 : 4), 0, Math.PI * 2);
  if (bubbleKind === 'treasure') {
    ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
  } else if (bubbleKind === 'diamond') {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
  } else if (bubbleKind === 'star') {
    ctx.fillStyle = 'rgba(250, 204, 21, 0.24)';
  } else {
    ctx.fillStyle = color.glowRgba;
  }
  ctx.filter = 'blur(6px)';
  ctx.fill();
  ctx.restore();

  // Translucent 3D body gradient
  const bodyGrad = ctx.createRadialGradient(
    -radius * 0.25,
    -radius * 0.28,
    radius * 0.08,
    0,
    0,
    radius
  );
  bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  bodyGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.05)');
  if (bubbleKind === 'diamond') {
    bodyGrad.addColorStop(0.82, 'rgba(56, 189, 248, 0.34)');
  } else if (bubbleKind === 'star') {
    bodyGrad.addColorStop(0.82, 'rgba(250, 204, 21, 0.30)');
  } else if (bubbleKind === 'treasure') {
    bodyGrad.addColorStop(0.82, 'rgba(245, 158, 11, 0.34)');
  } else {
    bodyGrad.addColorStop(0.82, color.tintRgba);
  }
  bodyGrad.addColorStop(0.96, 'rgba(255, 255, 255, 0.52)');
  bodyGrad.addColorStop(1, 'rgba(255, 255, 255, 0.78)');

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Rotating rainbow iridescent rim
  const spin = timeSec * 0.7 + wobblePhase;
  const iridGrad = ctx.createLinearGradient(
    Math.cos(spin) * radius,
    Math.sin(spin) * radius,
    -Math.cos(spin) * radius,
    -Math.sin(spin) * radius
  );
  if (bubbleKind === 'diamond') {
    iridGrad.addColorStop(0, 'rgba(224, 242, 254, 0.92)');
    iridGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.9)');
    iridGrad.addColorStop(1, 'rgba(129, 140, 248, 0.9)');
  } else if (bubbleKind === 'treasure') {
    iridGrad.addColorStop(0, 'rgba(253, 224, 71, 0.95)');
    iridGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.9)');
    iridGrad.addColorStop(1, 'rgba(236, 72, 153, 0.9)');
  } else {
    iridGrad.addColorStop(0, 'rgba(255, 99, 132, 0.76)');
    iridGrad.addColorStop(0.22, 'rgba(253, 224, 71, 0.76)');
    iridGrad.addColorStop(0.45, 'rgba(52, 211, 153, 0.76)');
    iridGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.78)');
    iridGrad.addColorStop(1, 'rgba(192, 132, 252, 0.78)');
  }

  ctx.lineWidth = bubbleKind === 'normal' ? 2.4 : 3.4;
  ctx.strokeStyle = iridGrad;
  ctx.stroke();

  // Colored inner ring
  ctx.beginPath();
  ctx.arc(0, 0, radius - 1.5, 0, Math.PI * 2);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle =
    bubbleKind === 'treasure'
      ? 'rgba(253, 224, 71, 0.92)'
      : bubbleKind === 'diamond'
      ? 'rgba(125, 211, 252, 0.92)'
      : bubbleKind === 'star'
      ? 'rgba(250, 204, 21, 0.9)'
      : color.rimHex;
  ctx.globalAlpha = bubbleKind === 'normal' ? 0.55 : 0.85;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Inner emblem for special bubble types
  if (bubbleKind === 'star') {
    ctx.save();
    ctx.rotate(Math.sin(timeSec * 2 + wobblePhase) * 0.16);
    drawFivePointStar(ctx, 0, 1, radius * 0.44, radius * 0.2, '#FACC15', '#FEF9C3');
    ctx.restore();
  } else if (bubbleKind === 'diamond') {
    ctx.save();
    ctx.rotate(Math.sin(timeSec * 2.2 + wobblePhase) * 0.14);
    drawBlueDiamond(ctx, 0, 1, radius * 0.44);
    ctx.restore();
  } else if (bubbleKind === 'treasure') {
    ctx.save();
    ctx.rotate(Math.sin(timeSec * 2.4 + wobblePhase) * 0.1);
    drawMiniTreasureChest(ctx, 0, 2, radius * 0.39);
    // Orbiting mini sparkles around treasure bubble
    for (let s = 0; s < 3; s++) {
      const ang = timeSec * 2.5 + (s * Math.PI * 2) / 3;
      const sx = Math.cos(ang) * (radius + 7);
      const sy = Math.sin(ang) * (radius + 7);
      drawFivePointStar(ctx, sx, sy, 5, 2.2, '#FEF08A', '#FFFFFF');
    }
    ctx.restore();
  }

  // Glossy curved specular reflection
  ctx.save();
  ctx.rotate(-Math.PI * 0.24);
  ctx.beginPath();
  ctx.ellipse(0, -radius * 0.54, radius * 0.32, radius * 0.12, 0, 0, Math.PI * 2);
  const specGrad = ctx.createLinearGradient(0, -radius * 0.68, 0, -radius * 0.42);
  specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  specGrad.addColorStop(1, 'rgba(255, 255, 255, 0.18)');
  ctx.fillStyle = specGrad;
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(-radius * 0.48, -radius * 0.2, radius * 0.075, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.fill();

  ctx.restore();
}

const Stage15ChestCelebration: React.FC = () => {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setOpened(true), 450);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center py-3">
      <div
        className={`relative w-32 h-28 rounded-3xl flex items-center justify-center transition-all duration-500 ${
          opened ? 'scale-105' : 'scale-95'
        }`}
      >
        {/* Radiant golden glow behind chest */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-200 to-orange-300 blur-xl transition-opacity duration-700 ${
            opened ? 'opacity-90' : 'opacity-30'
          }`}
        />

        {/* Chest body + animated opening lid */}
        <div className="relative z-10 w-24 h-20 flex flex-col items-center justify-end">
          <div
            className={`w-24 h-8 rounded-t-2xl bg-gradient-to-b from-amber-400 to-amber-700 border-2 border-yellow-200 shadow-md origin-bottom transition-transform duration-700 ${
              opened ? '-rotate-12 -translate-y-4' : 'rotate-0 translate-y-0'
            }`}
          >
            <div className="h-full w-3 bg-yellow-300/90 mx-auto" />
          </div>
          <div className="w-24 h-12 rounded-b-2xl bg-gradient-to-b from-amber-600 to-amber-800 border-2 border-yellow-300 shadow-lg flex items-center justify-center relative">
            <div className="w-5 h-5 rounded-full bg-yellow-300 border-2 border-amber-700 shadow-xs" />
          </div>
        </div>

        {/* Bursting treasures when chest opens */}
        {opened && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
            <span className="absolute -top-2 left-3 text-2xl animate-companion-bounce">⭐</span>
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl animate-companion-bounce">
              👑
            </span>
            <span className="absolute -top-2 right-3 text-2xl animate-companion-bounce">💎</span>
            <span className="absolute top-6 -left-2 text-xl">✨</span>
            <span className="absolute top-6 -right-2 text-xl">🎁</span>
          </div>
        )}
      </div>
      <p className="text-xs font-extrabold text-amber-700 mt-1">
        {opened ? 'Rương Kho Báu Hoàng Gia Đã Mở!' : 'Đang mở Rương Kho Báu...'}
      </p>
    </div>
  );
};

export const BubbleTreasureGame: React.FC<BubbleTreasureGameProps> = ({
  soundEnabled,
  voiceEnabled,
  isPaused,
  savedProgress,
  onUpdateProgress,
  onRecordStars,
  onShowVictory,
  onComplete,
}) => {
  const normSaved = normalizeBubbleProgress(savedProgress);

  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [currentStageNum, setCurrentStageNum] = useState<number>(normSaved.unlockedStage);
  const [bgMusicOn, setBgMusicOn] = useState<boolean>(true);

  const [stats, setStats] = useState<StageRunStats>(EMPTY_RUN_STATS);
  const [recentLoot, setRecentLoot] = useState<HarvestedBadgeItem[]>([]);
  const [vaultBounce, setVaultBounce] = useState(false);

  // Stage mode state
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [timePromptOpen, setTimePromptOpen] = useState<boolean>(false);
  const [usedTimeExtension, setUsedTimeExtension] = useState<boolean>(false);
  const [stageCompleted, setStageCompleted] = useState<boolean>(false);
  const [newlyUnlockedStage, setNewlyUnlockedStage] = useState<number | null>(null);
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<BubbleMilestoneBadgeId[]>([]);
  const [earnedStageStars, setEarnedStageStars] = useState<number>(3);

  // Endless mode state
  const [endlessWave, setEndlessWave] = useState<number>(1);
  const [endlessWavePops, setEndlessWavePops] = useState<number>(0);
  const [waveBanner, setWaveBanner] = useState<string | null>(null);
  const [endlessSummaryOpen, setEndlessSummaryOpen] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const arenaRef = useRef<HTMLDivElement | null>(null);

  const bubblesRef = useRef<SoapBubble[]>([]);
  const particlesRef = useRef<PopParticle[]>([]);
  const ringsRef = useRef<PopRing[]>([]);
  const rewardsRef = useRef<FlyingReward[]>([]);
  const poppedIdsRef = useRef<Set<number>>(new Set());
  const nextIdRef = useRef(1);
  const laneCursorRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const lastPopTsRef = useRef<number>(0);
  const stageCompletedRef = useRef(false);
  const stageCreditedRef = useRef(false);
  const sizeRef = useRef({ width: 880, height: 500 });

  const viewModeRef = useRef(viewMode);
  const currentStageNumRef = useRef(currentStageNum);
  const endlessWaveRef = useRef(endlessWave);
  const soundEnabledRef = useRef(soundEnabled);
  const voiceEnabledRef = useRef(voiceEnabled);
  const isPausedRef = useRef(isPaused);
  const timePromptOpenRef = useRef(timePromptOpen);
  const endlessSummaryOpenRef = useRef(endlessSummaryOpen);
  const statsRef = useRef(stats);
  const savedProgressRef = useRef(savedProgress);
  const onUpdateProgressRef = useRef(onUpdateProgress);
  const onRecordStarsRef = useRef(onRecordStars);

  viewModeRef.current = viewMode;
  currentStageNumRef.current = currentStageNum;
  endlessWaveRef.current = endlessWave;
  soundEnabledRef.current = soundEnabled;
  voiceEnabledRef.current = voiceEnabled;
  isPausedRef.current = isPaused;
  timePromptOpenRef.current = timePromptOpen;
  endlessSummaryOpenRef.current = endlessSummaryOpen;
  statsRef.current = stats;
  savedProgressRef.current = savedProgress;
  onUpdateProgressRef.current = onUpdateProgress;
  onRecordStarsRef.current = onRecordStars;

  const currentStageCfg: BubbleStageConfig =
    BUBBLE_STAGES.find((s) => s.stage === currentStageNum) ?? BUBBLE_STAGES[0];
  const currentChapter =
    BUBBLE_CHAPTERS.find((c) => c.id === currentStageCfg.chapter) ?? BUBBLE_CHAPTERS[0];

  // Background music lifecycle
  useEffect(() => {
    const shouldPlayMusic =
      soundEnabled &&
      bgMusicOn &&
      !isPaused &&
      (viewMode === 'stage' || viewMode === 'endless') &&
      !stageCompleted &&
      !endlessSummaryOpen;

    if (shouldPlayMusic) {
      bubbleMusic.start();
    } else {
      bubbleMusic.stop();
    }
    return () => bubbleMusic.stop();
  }, [soundEnabled, bgMusicOn, isPaused, viewMode, stageCompleted, endlessSummaryOpen]);

  const chooseBubbleKind = useCallback(
    (
      weights: { normal: number; star: number; diamond: number; treasure: number },
      maxSpecialOnScreen: number,
      maxTreasureOnScreen: number,
      stageCfg?: BubbleStageConfig
    ): BubbleKind => {
      const currentBubbles = bubblesRef.current;
      const specialCount = currentBubbles.filter((b) => b.bubbleKind !== 'normal').length;
      const treasureCount = currentBubbles.filter((b) => b.bubbleKind === 'treasure').length;
      const diamondCount = currentBubbles.filter((b) => b.bubbleKind === 'diamond').length;

      if (specialCount >= maxSpecialOnScreen) {
        return 'normal';
      }

      // Help ensure mission-critical bubble types appear reliably when none are on screen
      if (stageCfg) {
        if ((stageCfg.stage === 8 || stageCfg.stage === 13 || stageCfg.stage === 15) && treasureCount === 0 && Math.random() < 0.38) {
          return 'treasure';
        }
        if ((stageCfg.stage === 4 || stageCfg.stage === 9 || stageCfg.stage === 12) && diamondCount === 0 && Math.random() < 0.36) {
          return 'diamond';
        }
        if (stageCfg.stage === 14) {
          const s = statsRef.current;
          if (s.treasurePops < 2 && treasureCount === 0 && Math.random() < 0.34) return 'treasure';
          if (s.diamondPops < 2 && diamondCount === 0 && Math.random() < 0.34) return 'diamond';
        }
      }

      const wTreasure = treasureCount >= maxTreasureOnScreen ? 0 : weights.treasure;
      const total = weights.normal + weights.star + weights.diamond + wTreasure;
      const r = Math.random() * total;
      if (r < weights.normal) return 'normal';
      if (r < weights.normal + weights.star) return 'star';
      if (r < weights.normal + weights.star + weights.diamond) return 'diamond';
      return 'treasure';
    },
    []
  );

  const createBubbleForConfig = useCallback(
    (
      width: number,
      height: number,
      params: {
        radii: [number, number, number];
        swayRange: [number, number];
        vyMin: number;
        vyMax: number;
        weights: { normal: number; star: number; diamond: number; treasure: number };
        maxSpecialOnScreen: number;
        maxTreasureOnScreen: number;
        isSurpriseTreasure?: boolean;
        stageCfg?: BubbleStageConfig;
      },
      initialY?: number
    ): SoapBubble => {
      const id = nextIdRef.current++;
      const minDim = Math.min(width, height);
      const baseScale = Math.max(0.74, Math.min(1.06, minDim / 480));

      // On Stage 6 ("Bóng lớn & bóng nhỏ"), emphasize clear contrast between tier 0 (small) & tier 2 (big)
      const sizeTier = (
        params.stageCfg?.stage === 6 ? (id % 2 === 0 ? 0 : 2) : id % 3
      ) as 0 | 1 | 2;

      const radius = Math.round(params.radii[sizeTier] * baseScale);
      const swayAmp =
        params.swayRange[0] + Math.random() * (params.swayRange[1] - params.swayRange[0]);
      const safeMarginX = radius + swayAmp + 16;
      const usableW = Math.max(40, width - safeMarginX * 2);

      const bubbleKind = chooseBubbleKind(
        params.weights,
        params.maxSpecialOnScreen,
        params.maxTreasureOnScreen,
        params.stageCfg
      );

      // Surprise treasure bubbles in Stages 13 & 15 can appear higher at varied spots
      const isSurpriseSpot =
        bubbleKind === 'treasure' && params.isSurpriseTreasure && initialY === undefined;
      const targetY = isSurpriseSpot
        ? height * (0.48 + Math.random() * 0.3)
        : initialY ?? height + radius + 12;

      const laneCount = Math.max(3, Math.min(6, Math.floor(usableW / (radius * 2 + 16))));
      let chosenX = safeMarginX + usableW * 0.5;
      for (let attempt = 0; attempt < 8; attempt++) {
        const laneIdx = (laneCursorRef.current + attempt) % laneCount;
        const laneWidth = usableW / laneCount;
        const jitter = (0.2 + Math.random() * 0.6) * laneWidth;
        const candidate = safeMarginX + laneIdx * laneWidth + jitter;

        const overlaps = bubblesRef.current.some((b) => {
          const dist = Math.hypot(b.x - candidate, b.y - targetY);
          return dist < radius + b.radius + 18;
        });

        if (!overlaps) {
          chosenX = candidate;
          laneCursorRef.current = (laneIdx + 1) % laneCount;
          break;
        }
        if (attempt === 0) chosenX = candidate;
      }

      const color = BUBBLE_PALETTE[(id - 1) % BUBBLE_PALETTE.length];
      const vyBase = params.vyMin + Math.random() * (params.vyMax - params.vyMin);
      const vy = vyBase * (sizeTier === 2 ? 0.92 : 1);

      if (isSurpriseSpot) {
        ringsRef.current.push({
          x: chosenX,
          y: targetY,
          radius: radius * 0.6,
          maxRadius: radius * 1.65,
          alpha: 0.75,
          color: '#FACC15',
        });
      }

      return {
        id,
        x: chosenX,
        baseX: chosenX,
        y: targetY,
        radius,
        sizeTier,
        vy,
        swayAmp,
        swayFreq: 0.8 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        wobblePhase: Math.random() * Math.PI * 2,
        color,
        bubbleKind,
        spawnTime: performance.now(),
      };
    },
    [chooseBubbleKind]
  );

  const resetBoardForStage = useCallback(
    (stageCfg: BubbleStageConfig) => {
      const { width, height } = sizeRef.current;
      bubblesRef.current = [];
      for (let idx = 0; idx < stageCfg.initialBubbles; idx++) {
        const y = height * (0.24 + (idx % 3) * 0.24) + Math.random() * 24;
        const b = createBubbleForConfig(
          width,
          height,
          {
            radii: stageCfg.radii,
            swayRange: stageCfg.swayRange,
            vyMin: stageCfg.vyMin,
            vyMax: stageCfg.vyMax,
            weights: stageCfg.weights,
            maxSpecialOnScreen: stageCfg.maxSpecialOnScreen,
            maxTreasureOnScreen: stageCfg.maxTreasureOnScreen,
            isSurpriseTreasure: stageCfg.isSurpriseTreasure,
            stageCfg,
          },
          y
        );
        bubblesRef.current.push(b);
      }

      particlesRef.current = [];
      ringsRef.current = [];
      rewardsRef.current = [];
      poppedIdsRef.current.clear();
      spawnTimerRef.current = 0;
      lastPopTsRef.current = 0;
      stageCompletedRef.current = false;
      stageCreditedRef.current = false;

      setStats(EMPTY_RUN_STATS);
      setRecentLoot([]);
      setTimeLeft(stageCfg.suggestedSeconds);
      setTimePromptOpen(false);
      setUsedTimeExtension(false);
      setStageCompleted(false);
      setNewlyUnlockedStage(null);
      setNewlyEarnedBadges([]);
      setEndlessSummaryOpen(false);
    },
    [createBubbleForConfig]
  );

  const resetBoardForEndless = useCallback(() => {
    const { width, height } = sizeRef.current;
    const waveCfg = getEndlessWaveConfig(1);
    bubblesRef.current = [];
    for (let idx = 0; idx < 6; idx++) {
      const y = height * (0.22 + (idx % 3) * 0.24) + Math.random() * 24;
      const b = createBubbleForConfig(
        width,
        height,
        {
          radii: waveCfg.radii,
          swayRange: waveCfg.swayRange,
          vyMin: waveCfg.vyMin,
          vyMax: waveCfg.vyMax,
          weights: waveCfg.weights,
          maxSpecialOnScreen: waveCfg.maxSpecialOnScreen,
          maxTreasureOnScreen: waveCfg.maxTreasureOnScreen,
          isSurpriseTreasure: true,
        },
        y
      );
      bubblesRef.current.push(b);
    }

    particlesRef.current = [];
    ringsRef.current = [];
    rewardsRef.current = [];
    poppedIdsRef.current.clear();
    spawnTimerRef.current = 0;
    lastPopTsRef.current = 0;
    stageCompletedRef.current = false;
    stageCreditedRef.current = false;

    setEndlessWave(1);
    setEndlessWavePops(0);
    setWaveBanner('Đợt 1 · Bắt đầu!');
    window.setTimeout(() => setWaveBanner(null), 1600);
    setStats(EMPTY_RUN_STATS);
    setRecentLoot([]);
    setTimePromptOpen(false);
    setStageCompleted(false);
    setEndlessSummaryOpen(false);
  }, [createBubbleForConfig]);

  // Canvas resize observer whenever play arena mounts
  useEffect(() => {
    if (viewMode === 'map') return;
    const arena = arenaRef.current;
    const canvas = canvasRef.current;
    if (!arena || !canvas) return;

    const updateCanvasSize = () => {
      const rect = arena.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { width: rect.width, height: rect.height };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    };

    updateCanvasSize();
    if (viewMode === 'stage') {
      const cfg = BUBBLE_STAGES.find((s) => s.stage === currentStageNum) ?? BUBBLE_STAGES[0];
      resetBoardForStage(cfg);
    } else if (viewMode === 'endless') {
      resetBoardForEndless();
    }

    const ro = new ResizeObserver(updateCanvasSize);
    ro.observe(arena);
    return () => ro.disconnect();
  }, [viewMode, currentStageNum, resetBoardForStage, resetBoardForEndless]);

  // Gentle stage timer (never abruptly ends play; offers Continue / Replay if time reaches 0)
  useEffect(() => {
    if (
      viewMode !== 'stage' ||
      isPaused ||
      stageCompleted ||
      timePromptOpen ||
      endlessSummaryOpen
    ) {
      return;
    }

    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimePromptOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [viewMode, isPaused, stageCompleted, timePromptOpen, endlessSummaryOpen]);

  // Main 60fps canvas animation loop
  useEffect(() => {
    if (viewMode === 'map') return;
    let rafId = 0;
    let lastTs = performance.now();

    const frame = (now: number) => {
      const rawDt = (now - lastTs) / 1000;
      lastTs = now;
      const dt = Math.min(0.05, Math.max(0, rawDt));
      const timeSec = now / 1000;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const { width, height } = sizeRef.current;

      const isEndless = viewModeRef.current === 'endless';
      const stageCfg =
        BUBBLE_STAGES.find((s) => s.stage === currentStageNumRef.current) ?? BUBBLE_STAGES[0];
      const waveCfg = getEndlessWaveConfig(endlessWaveRef.current);

      const activeMaxBubbles = isEndless ? waveCfg.maxBubbles : stageCfg.maxBubbles;
      const activeSpawnInterval = isEndless ? waveCfg.spawnInterval : stageCfg.spawnInterval;

      const spawnParams = isEndless
        ? {
            radii: waveCfg.radii,
            swayRange: waveCfg.swayRange,
            vyMin: waveCfg.vyMin,
            vyMax: waveCfg.vyMax,
            weights: waveCfg.weights,
            maxSpecialOnScreen: waveCfg.maxSpecialOnScreen,
            maxTreasureOnScreen: waveCfg.maxTreasureOnScreen,
            isSurpriseTreasure: true,
          }
        : {
            radii: stageCfg.radii,
            swayRange: stageCfg.swayRange,
            vyMin: stageCfg.vyMin,
            vyMax: stageCfg.vyMax,
            weights: stageCfg.weights,
            maxSpecialOnScreen: stageCfg.maxSpecialOnScreen,
            maxTreasureOnScreen: stageCfg.maxTreasureOnScreen,
            isSurpriseTreasure: stageCfg.isSurpriseTreasure,
            stageCfg,
          };

      const freezePhysics =
        isPausedRef.current || timePromptOpenRef.current || endlessSummaryOpenRef.current;

      if (canvas && ctx && width > 0 && height > 0) {
        const dpr = canvas.width / width;
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const vaultX = width - 56;
        const vaultY = height - 56;

        if (!freezePhysics) {
          if (!stageCompletedRef.current && bubblesRef.current.length < activeMaxBubbles) {
            spawnTimerRef.current += dt;
            if (spawnTimerRef.current >= activeSpawnInterval) {
              spawnTimerRef.current = 0;
              bubblesRef.current.push(createBubbleForConfig(width, height, spawnParams));
            }
          }

          const nextBubbles: SoapBubble[] = [];
          for (const b of bubblesRef.current) {
            b.y -= b.vy * dt;
            b.x = b.baseX + Math.sin(timeSec * b.swayFreq + b.phase) * b.swayAmp;
            b.x = Math.max(b.radius + 14, Math.min(width - b.radius - 14, b.x));

            if (b.y < -b.radius - 20) {
              if (!stageCompletedRef.current && nextBubbles.length < activeMaxBubbles) {
                nextBubbles.push(createBubbleForConfig(width, height, spawnParams));
              }
            } else {
              nextBubbles.push(b);
            }
          }
          bubblesRef.current = nextBubbles;

          ringsRef.current = ringsRef.current.filter((ring) => {
            ring.radius += (ring.maxRadius - ring.radius) * 0.18 + 90 * dt;
            ring.alpha -= dt * 2.6;
            return ring.alpha > 0.02;
          });

          particlesRef.current = particlesRef.current.filter((p) => {
            p.life += dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 120 * dt;
            p.vx *= 0.96;
            p.alpha = Math.max(0, 1 - p.life / p.maxLife);
            return p.life < p.maxLife;
          });

          const activeRewards: FlyingReward[] = [];
          for (const rw of rewardsRef.current) {
            rw.elapsed += dt;
            if (rw.elapsed <= rw.revealDuration) {
              const p = rw.elapsed / rw.revealDuration;
              const lift = Math.sin(p * Math.PI) * 24;
              rw.x = rw.startX;
              rw.y = rw.startY - lift;
              activeRewards.push(rw);
            } else {
              const flyT = Math.min(1, (rw.elapsed - rw.revealDuration) / rw.flyDuration);
              const ease = 1 - Math.pow(1 - flyT, 2.3);
              const ctrlX = (rw.startX + vaultX) * 0.5;
              const ctrlY = Math.min(rw.startY, vaultY) - 85;
              const inv = 1 - ease;
              rw.x = inv * inv * rw.startX + 2 * inv * ease * ctrlX + ease * ease * vaultX;
              rw.y = inv * inv * rw.startY + 2 * inv * ease * ctrlY + ease * ease * vaultY;

              if (flyT >= 1) {
                if (!rw.credited) {
                  rw.credited = true;
                  sfx.treasureCollect(rw.kind, soundEnabledRef.current);
                  setVaultBounce(true);
                  window.setTimeout(() => setVaultBounce(false), 260);

                  setStats((prev) => ({
                    ...prev,
                    starsCollected: prev.starsCollected + rw.starAmount,
                    diamondsCollected: prev.diamondsCollected + rw.diamondAmount,
                    gemsCollected: prev.gemsCollected + rw.gemAmount,
                    chestsCollected: prev.chestsCollected + rw.chestAmount,
                    harvestedTotal: prev.harvestedTotal + 1,
                  }));

                  setRecentLoot((prev) =>
                    [{ id: rw.id, kind: rw.kind, gemColor: rw.gemColor }, ...prev].slice(0, 10)
                  );
                }
              } else {
                activeRewards.push(rw);
              }
            }
          }
          rewardsRef.current = activeRewards;
        }

        for (const bubble of bubblesRef.current) {
          drawSoapBubble(ctx, bubble, timeSec);
        }

        for (const ring of ringsRef.current) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
          ctx.strokeStyle = ring.color;
          ctx.globalAlpha = ring.alpha;
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
        }

        for (const p of particlesRef.current) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          if (p.shape === 'star') {
            drawFivePointStar(ctx, p.x, p.y, p.radius * 1.4, p.radius * 0.6, p.color, '#FFFFFF');
          } else if (p.shape === 'diamond') {
            drawBlueDiamond(ctx, p.x, p.y, p.radius * 1.3);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          }
          ctx.restore();
        }

        for (const rw of rewardsRef.current) {
          const revealT = Math.min(1, rw.elapsed / rw.revealDuration);
          const scale =
            rw.elapsed < rw.revealDuration
              ? 0.55 + Math.sin(revealT * Math.PI * 0.5) * 0.6
              : Math.max(0.62, 1.1 - ((rw.elapsed - rw.revealDuration) / rw.flyDuration) * 0.45);
          ctx.save();
          ctx.translate(rw.x, rw.y);
          ctx.scale(scale, scale);

          if (rw.kind === 'star') {
            drawFivePointStar(ctx, 0, 0, 22, 10, '#FACC15', '#FEF9C3');
          } else if (rw.kind === 'diamond') {
            drawBlueDiamond(ctx, 0, 0, 22);
          } else if (rw.kind === 'gem') {
            drawFacetedGem(ctx, 0, 0, 22, rw.gemColor);
          } else {
            drawMiniTreasureChest(ctx, 0, 0, 24);
          }

          if (rw.elapsed < rw.revealDuration * 1.25) {
            ctx.font = '700 13px "Baloo 2", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.82)';
            ctx.lineWidth = 3;
            ctx.strokeText(rw.label, 0, -28);
            ctx.fillText(rw.label, 0, -28);
          }

          ctx.restore();
        }

        ctx.restore();
      }

      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(rafId);
  }, [viewMode, createBubbleForConfig]);

  // Monitor Stage completion & safely persist unlocks, cumulative stats, and milestone badges once
  useEffect(() => {
    if (viewMode !== 'stage' || stageCompletedRef.current) return;
    if (currentStageCfg.isCompleted(stats)) {
      stageCompletedRef.current = true;
      setStageCompleted(true);
    }
  }, [viewMode, stats, currentStageCfg]);

  useEffect(() => {
    if (!stageCompleted || viewMode !== 'stage' || stageCreditedRef.current) return;
    stageCreditedRef.current = true;

    const latestStats = statsRef.current;
    const prevNorm = normalizeBubbleProgress(savedProgressRef.current);

    if (currentStageCfg.isFinale) {
      sfx.chestOpen(soundEnabledRef.current);
    } else {
      sfx.victory(soundEnabledRef.current);
    }

    const starsForStage = usedTimeExtension ? 2 : 3;
    setEarnedStageStars(starsForStage);

    const updatedCompleted = prevNorm.completedStages.includes(currentStageNum)
      ? prevNorm.completedStages
      : [...prevNorm.completedStages, currentStageNum].sort((a, b) => a - b);

    const nextUnlockedStage =
      currentStageNum < 15
        ? Math.min(15, Math.max(prevNorm.unlockedStage, currentStageNum + 1))
        : 15;
    if (currentStageNum < 15 && nextUnlockedStage > prevNorm.unlockedStage) {
      setNewlyUnlockedStage(nextUnlockedStage);
    } else {
      setNewlyUnlockedStage(null);
    }

    const updatedStageStars = {
      ...prevNorm.stageStars,
      [currentStageNum]: Math.max(prevNorm.stageStars[currentStageNum] ?? 0, starsForStage),
    };

    // Evaluate milestone badges (5 -> Đồng hành, 10 -> Thợ săn kho báu, 15 -> Cúp Chinh phục kho báu)
    const nextBadges = [...prevNorm.earnedBubbleBadges];
    const freshBadges: BubbleMilestoneBadgeId[] = [];
    for (const badge of BUBBLE_MILESTONE_BADGES) {
      if (updatedCompleted.length >= badge.requiredStages && !nextBadges.includes(badge.id)) {
        nextBadges.push(badge.id);
        freshBadges.push(badge.id);
      }
    }
    setNewlyEarnedBadges(freshBadges);

    const endlessNowUnlocked = prevNorm.endlessUnlocked || updatedCompleted.includes(15);

    onUpdateProgressRef.current?.({
      ...prevNorm,
      unlockedStage: nextUnlockedStage,
      completedStages: updatedCompleted,
      stageStars: updatedStageStars,
      totalStars: prevNorm.totalStars + latestStats.starsCollected,
      totalDiamonds: prevNorm.totalDiamonds + latestStats.diamondsCollected,
      totalPops: prevNorm.totalPops + latestStats.totalPops,
      bestStars: Math.max(prevNorm.bestStars, latestStats.starsCollected),
      bestDiamonds: Math.max(prevNorm.bestDiamonds, latestStats.diamondsCollected),
      earnedBubbleBadges: nextBadges,
      endlessUnlocked: endlessNowUnlocked,
    });

    const profileStars = currentStageCfg.isFinale ? 5 : starsForStage;
    onRecordStarsRef.current?.(profileStars);

    const cheerVoice = currentStageCfg.isFinale
      ? 'Hoan hô! Bé đã chinh phục Màn 15, mở Rương Kho Báu Hoàng Gia và mở khóa Chế độ Tự do Vô hạn!'
      : currentStageNum < 15
      ? `Tuyệt vời! Bé đã hoàn thành Màn ${currentStageNum} và mở khóa Màn ${currentStageNum + 1}!`
      : 'Hoan hô! Bé giỏi quá!';
    speakVietnamese(cheerVoice, voiceEnabledRef.current);
  }, [stageCompleted, viewMode, currentStageNum, currentStageCfg, usedTimeExtension]);

  // Endless mode wave progression (smooth wave increments based on pops)
  useEffect(() => {
    if (viewMode !== 'endless' || endlessSummaryOpen) return;
    const waveCfg = getEndlessWaveConfig(endlessWave);
    if (endlessWavePops >= waveCfg.popsNeededForNextWave) {
      const nextWave = endlessWave + 1;
      setEndlessWave(nextWave);
      setEndlessWavePops(0);
      setWaveBanner(`Đợt ${nextWave} · Tăng tốc nhẹ!`);
      sfx.waveUp(soundEnabledRef.current);
      window.setTimeout(() => {
        setWaveBanner((prev) => (prev === `Đợt ${nextWave} · Tăng tốc nhẹ!` ? null : prev));
      }, 1800);
    }
  }, [viewMode, endlessWave, endlessWavePops, endlessSummaryOpen]);

  const handleFinishEndlessRun = () => {
    const prevNorm = normalizeBubbleProgress(savedProgressRef.current);
    const s = statsRef.current;
    onUpdateProgressRef.current?.({
      ...prevNorm,
      totalStars: prevNorm.totalStars + s.starsCollected,
      totalDiamonds: prevNorm.totalDiamonds + s.diamondsCollected,
      totalPops: prevNorm.totalPops + s.totalPops,
      endlessBestWave: Math.max(prevNorm.endlessBestWave, endlessWave),
      endlessBestStars: Math.max(prevNorm.endlessBestStars, s.starsCollected),
      endlessBestDiamonds: Math.max(prevNorm.endlessBestDiamonds, s.diamondsCollected),
      endlessBestPops: Math.max(prevNorm.endlessBestPops, s.totalPops),
    });
    if (s.starsCollected > 0 || s.totalPops >= 5) {
      onRecordStarsRef.current?.(Math.min(5, Math.max(2, Math.floor(s.starsCollected / 5) + 2)));
    }
    sfx.victory(soundEnabled);
    setEndlessSummaryOpen(true);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaused || timePromptOpen || stageCompleted || endlessSummaryOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const list = bubblesRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const bubble = list[i];
      if (poppedIdsRef.current.has(bubble.id)) continue;

      const dx = px - bubble.x;
      const dy = py - bubble.y;
      const hitRadius = bubble.radius * 1.15;

      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        // Guard: single pop & single credit per bubble
        poppedIdsRef.current.add(bubble.id);
        bubblesRef.current = list.filter((b) => b.id !== bubble.id);

        sfx.bubblePopType(bubble.bubbleKind, soundEnabled);

        // Distinct shockwave ring per bubble type
        const ringColor =
          bubble.bubbleKind === 'treasure'
            ? '#FDE047'
            : bubble.bubbleKind === 'diamond'
            ? '#38BDF8'
            : bubble.bubbleKind === 'star'
            ? '#FACC15'
            : bubble.color.rimHex;

        ringsRef.current.push({
          x: bubble.x,
          y: bubble.y,
          radius: bubble.radius * 0.72,
          maxRadius: bubble.radius * (bubble.bubbleKind === 'treasure' ? 2.2 : 1.9),
          alpha: 0.92,
          color: ringColor,
        });

        // Distinct particle burst per bubble type
        const burstColors =
          bubble.bubbleKind === 'diamond'
            ? ['#FFFFFF', '#E0F2FE', '#38BDF8', '#0284C7', '#818CF8']
            : bubble.bubbleKind === 'star'
            ? ['#FFFFFF', '#FEF08A', '#FACC15', '#F59E0B']
            : bubble.bubbleKind === 'treasure'
            ? ['#FFFFFF', '#FDE047', '#F97316', '#EC4899', '#38BDF8']
            : ['#FFFFFF', bubble.color.rimHex, '#FDE047', '#38BDF8', '#F472B6', '#34D399'];

        const particleCount = bubble.bubbleKind === 'treasure' ? 26 : 18;
        for (let k = 0; k < particleCount; k++) {
          const angle = (Math.PI * 2 * k) / particleCount + (Math.random() - 0.5) * 0.25;
          const speed = 75 + Math.random() * 145;
          const shape: PopParticle['shape'] =
            bubble.bubbleKind === 'diamond' && k % 3 === 0
              ? 'diamond'
              : (bubble.bubbleKind === 'star' || bubble.bubbleKind === 'treasure' || k % 4 === 0)
              ? 'star'
              : 'circle';
          particlesRef.current.push({
            x: bubble.x,
            y: bubble.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 25,
            radius: 3 + Math.random() * 4,
            color: burstColors[k % burstColors.length],
            alpha: 1,
            life: 0,
            maxLife: 0.42 + Math.random() * 0.28,
            shape,
          });
        }

        // Update pop stats & streak immediately (reward collection counts on chest landing)
        const nowTs = performance.now();
        const withinStreak = lastPopTsRef.current > 0 && nowTs - lastPopTsRef.current <= 4200;
        lastPopTsRef.current = nowTs;

        setStats((prev) => {
          const nextStreak = withinStreak ? prev.currentStreak + 1 : 1;
          return {
            ...prev,
            totalPops: prev.totalPops + 1,
            normalPops: prev.normalPops + (bubble.bubbleKind === 'normal' ? 1 : 0),
            starPops: prev.starPops + (bubble.bubbleKind === 'star' ? 1 : 0),
            diamondPops: prev.diamondPops + (bubble.bubbleKind === 'diamond' ? 1 : 0),
            treasurePops: prev.treasurePops + (bubble.bubbleKind === 'treasure' ? 1 : 0),
            bigPops: prev.bigPops + (bubble.sizeTier === 2 ? 1 : 0),
            smallPops: prev.smallPops + (bubble.sizeTier === 0 ? 1 : 0),
            currentStreak: nextStreak,
            bestStreak: Math.max(prev.bestStreak, nextStreak),
          };
        });

        if (viewModeRef.current === 'endless') {
          setEndlessWavePops((p) => p + 1);
        }

        // Spawn flying reward corresponding to bubble type
        const gemColor = GEM_COLORS[bubble.id % GEM_COLORS.length];
        let rw: FlyingReward;

        if (bubble.bubbleKind === 'star') {
          rw = {
            id: nextIdRef.current++,
            kind: 'star',
            gemColor,
            starAmount: 2,
            diamondAmount: 0,
            gemAmount: 0,
            chestAmount: 0,
            startX: bubble.x,
            startY: bubble.y,
            x: bubble.x,
            y: bubble.y,
            elapsed: 0,
            revealDuration: 0.34,
            flyDuration: 0.54,
            credited: false,
            label: '+2 Sao vàng!',
          };
        } else if (bubble.bubbleKind === 'diamond') {
          rw = {
            id: nextIdRef.current++,
            kind: 'diamond',
            gemColor,
            starAmount: 0,
            diamondAmount: 1,
            gemAmount: 0,
            chestAmount: 0,
            startX: bubble.x,
            startY: bubble.y,
            x: bubble.x,
            y: bubble.y,
            elapsed: 0,
            revealDuration: 0.36,
            flyDuration: 0.56,
            credited: false,
            label: '+1 Kim cương!',
          };
        } else if (bubble.bubbleKind === 'treasure') {
          rw = {
            id: nextIdRef.current++,
            kind: 'chest',
            gemColor,
            starAmount: 3,
            diamondAmount: 1,
            gemAmount: 1,
            chestAmount: 1,
            startX: bubble.x,
            startY: bubble.y,
            x: bubble.x,
            y: bubble.y,
            elapsed: 0,
            revealDuration: 0.42,
            flyDuration: 0.58,
            credited: false,
            label: 'Kho báu! +3⭐ +1💎',
          };
        } else {
          rw = {
            id: nextIdRef.current++,
            kind: 'star',
            gemColor,
            starAmount: 1,
            diamondAmount: 0,
            gemAmount: bubble.id % 4 === 0 ? 1 : 0,
            chestAmount: 0,
            startX: bubble.x,
            startY: bubble.y,
            x: bubble.x,
            y: bubble.y,
            elapsed: 0,
            revealDuration: 0.32,
            flyDuration: 0.52,
            credited: false,
            label: '+1 Sao vàng',
          };
        }

        rewardsRef.current.push(rw);
        break;
      }
    }
  };

  // Show interactive 15-stage Journey Map
  if (viewMode === 'map') {
    return (
      <BubbleJourneyMap
        progress={savedProgress}
        onSelectStage={(stageNum) => {
          sfx.pop(soundEnabled);
          const cfg = BUBBLE_STAGES.find((s) => s.stage === stageNum) ?? BUBBLE_STAGES[0];
          setCurrentStageNum(stageNum);
          setViewMode('stage');
          speakVietnamese(cfg.voicePrompt, voiceEnabled);
        }}
        onStartEndless={() => {
          sfx.pop(soundEnabled);
          setViewMode('endless');
          speakVietnamese(
            'Chào mừng đến Chế độ Chơi Tự Do Vô Hạn! Bé hãy đập thật nhiều bong bóng và săn kho báu nhé!',
            voiceEnabled
          );
        }}
        onLockedTap={(reqStage) => {
          sfx.gentleOops(soundEnabled);
          speakVietnamese(
            reqStage === 15
              ? 'Bé hãy hoàn thành Màn 15 để mở khóa Chế độ Tự do nhé!'
              : `Bé hãy hoàn thành Màn ${reqStage} để mở khóa màn tiếp theo nhé!`,
            voiceEnabled
          );
        }}
      />
    );
  }

  const metrics = viewMode === 'stage' ? currentStageCfg.getMetrics(stats) : [];
  const overallStagePct =
    metrics.length > 0
      ? Math.round(
          (metrics.reduce((acc, m) => acc + Math.min(1, m.current / m.target), 0) / metrics.length) *
            100
        )
      : 0;
  const endlessWaveCfg = getEndlessWaveConfig(endlessWave);

  return (
    <div className="space-y-4">
      {/* BẢNG NHIỆM VỤ & BỘ ĐẾM PHÍA TRÊN (KHÔNG CHE KHU VỰC BONG BÓNG) */}
      <div className="bg-white rounded-3xl p-3.5 sm:px-5 sm:py-3.5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                sfx.tap(soundEnabled);
                setViewMode('map');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-bold text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0"
            >
              <Map className="w-4 h-4" />
              <span>Bản đồ 15 màn</span>
            </button>

            {viewMode === 'stage' ? (
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-3 py-1 rounded-xl text-white font-display font-extrabold text-xs sm:text-sm whitespace-nowrap"
                  style={{ backgroundColor: currentChapter.accentHex }}
                >
                  {currentStageCfg.title}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {currentChapter.speedLabel}
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-purple-600 text-white font-display font-extrabold text-xs sm:text-sm inline-flex items-center gap-1.5 whitespace-nowrap">
                  <InfinityIcon className="w-4 h-4" />
                  Chế Độ Tự Do · Đợt {endlessWave}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  Đợt tiếp theo: {endlessWavePops}/{endlessWaveCfg.popsNeededForNextWave} bóng
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sfx.tap(soundEnabled);
                setBgMusicOn((m) => !m);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs cursor-pointer whitespace-nowrap shrink-0 ${
                bgMusicOn && soundEnabled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Nhạc nền: {bgMusicOn && soundEnabled ? 'Bật' : 'Tắt'}</span>
            </button>

            {viewMode === 'stage' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-display font-bold text-xs sm:text-sm tabular-nums whitespace-nowrap">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>{timeLeft}s</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleFinishEndlessRun}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-display font-extrabold text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0"
              >
                <Trophy className="w-4 h-4" />
                <span>Lưu kỷ lục</span>
              </button>
            )}
          </div>
        </div>

        {/* DÒNG 2: NHIỆM VỤ + BỘ ĐẾM THỜI GIAN THỰC + THANH TIẾN TRÌNH */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {viewMode === 'stage' ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                Nhiệm vụ: {currentStageCfg.missionSummary}
              </span>
              <div className="flex flex-wrap items-center gap-2 tabular-nums">
                {metrics.map((m) => (
                  <span
                    key={m.label}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold border ${
                      m.done
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {m.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {m.label}: {m.current}/{m.target}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 tabular-nums text-xs sm:text-sm font-extrabold text-slate-700">
              <span>Đã đập: {stats.totalPops} bóng</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700">Sao: {stats.starsCollected} ⭐</span>
              <span aria-hidden="true">·</span>
              <span className="text-sky-700">Kim cương: {stats.diamondsCollected} 💎</span>
            </div>
          )}

          <div className="flex items-center gap-3 tabular-nums ml-auto">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-700">
              <span>🫧 {stats.totalPops}</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="text-amber-700">⭐ {stats.starsCollected}</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="text-sky-700">💎 {stats.diamondsCollected}</span>
            </div>

            {viewMode === 'stage' && (
              <div className="w-28 sm:w-36 flex items-center gap-2">
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/70">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-500 transition-all duration-300 rounded-full"
                    style={{ width: `${overallStagePct}%` }}
                  />
                </div>
                <span className="text-xs font-extrabold text-slate-700">{overallStagePct}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KHU VỰC CHƠI RỘNG RÃI */}
      <div
        ref={arenaRef}
        className="relative w-full h-[430px] sm:h-[500px] lg:h-[540px] rounded-3xl overflow-hidden border border-sky-200/80 shadow-md select-none bg-sky-200"
      >
        <ResilientImage
          src={BACKDROP_URL}
          alt="Khu vườn Đập Bóng – Hành Trình Săn Kho Báu"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          className="relative z-10 w-full h-full block touch-none cursor-pointer"
        />

        {/* THÔNG BÁO ĐỢT MỚI TRONG CHẾ ĐỘ TỰ DO */}
        {waveBanner && viewMode === 'endless' && (
          <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-purple-600/90 text-white px-5 py-2 rounded-2xl font-display font-extrabold text-sm sm:text-base shadow-lg">
            {waveBanner}
          </div>
        )}

        {/* ĐÍCH ĐẾN KHO BÁU Ở GÓC PHẢI */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-3 right-3 z-10 flex flex-col items-center transition-transform duration-200 ${
            vaultBounce ? 'scale-115' : 'scale-100'
          }`}
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-lg ring-3 ring-amber-300/90 bg-amber-100">
            <ResilientImage
              src={TREASURE_CHEST_IMAGE}
              alt="Rương kho báu"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* NHẮC NHỞ KHI HẾT THỜI GIAN GỢI Ý: LUÔN CHO PHÉP CHƠI TIẾP HOẶC CHƠI LẠI */}
        {timePromptOpen && !stageCompleted && viewMode === 'stage' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-sky-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-2xl text-slate-900">
                  Bé Sắp Hoàn Thành Rồi!
                </h3>
                <p className="text-sm text-slate-600">
                  Đã hết {currentStageCfg.suggestedSeconds} giây gợi ý, bé có thể chơi tiếp ngay để hoàn thành nhiệm vụ nhé!
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    sfx.pop(soundEnabled);
                    setUsedTimeExtension(true);
                    setTimeLeft(30);
                    setTimePromptOpen(false);
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-base cursor-pointer shadow-sm"
                >
                  Chơi tiếp (+30 giây)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sfx.tap(soundEnabled);
                    resetBoardForStage(currentStageCfg);
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi lại Màn {currentStageNum}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MÀN CHÚC MỪNG HOÀN THÀNH MÀN + HOẠT CẢNH MỞ RƯƠNG MÀN 15 */}
        {stageCompleted && viewMode === 'stage' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl border border-amber-200 text-center space-y-4 my-auto">
              {currentStageCfg.isFinale ? (
                <Stage15ChestCelebration />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center mx-auto animate-companion-bounce">
                  <Sparkles className="w-9 h-9" />
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
                  Hoàn thành {currentStageCfg.title}
                </p>
                <h2 className="font-display font-extrabold text-2xl text-slate-900">
                  {currentStageCfg.isFinale
                    ? 'Chúc Mừng! Bé Chinh Phục Cả 15 Màn!'
                    : newlyUnlockedStage
                    ? `Tuyệt Vời! Mở Khóa Màn ${newlyUnlockedStage}!`
                    : `Hoàn Thành Xuất Sắc Màn ${currentStageNum}!`}
                </h2>
                <div className="flex items-center justify-center gap-1 pt-1">
                  {[1, 2, 3].map((idx) => (
                    <Star
                      key={idx}
                      className={`w-7 h-7 ${
                        idx <= earnedStageStars
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Huy hiệu vừa mở (5 / 10 / 15 màn) */}
              {newlyEarnedBadges.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3 space-y-1">
                  {newlyEarnedBadges.map((bId) => {
                    const b = BUBBLE_MILESTONE_BADGES.find((x) => x.id === bId);
                    if (!b) return null;
                    return (
                      <div
                        key={bId}
                        className="flex items-center justify-center gap-2 text-sm font-extrabold text-amber-800"
                      >
                        <Award className="w-5 h-5 text-orange-500 shrink-0" />
                        <span>
                          Nhận {b.icon} {b.title}!
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center tabular-nums bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                <div>
                  <div className="font-display font-extrabold text-lg text-slate-800">
                    {stats.totalPops} 🫧
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Bóng vỡ</div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-lg text-amber-600">
                    {stats.starsCollected} ⭐
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Sao vàng</div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-lg text-sky-600">
                    {stats.diamondsCollected} 💎
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Kim cương</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {currentStageNum < 15 ? (
                  <button
                    type="button"
                    onClick={() => {
                      sfx.pop(soundEnabled);
                      const nextStage = currentStageNum + 1;
                      const nextCfg = BUBBLE_STAGES.find((s) => s.stage === nextStage);
                      setCurrentStageNum(nextStage);
                      if (nextCfg) speakVietnamese(nextCfg.voicePrompt, voiceEnabled);
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-display font-bold text-base flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Chơi tiếp Màn {currentStageNum + 1}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      sfx.pop(soundEnabled);
                      setViewMode('endless');
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-display font-bold text-base flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <InfinityIcon className="w-5 h-5" />
                    <span>Khám Phá Chế Độ Tự Do Vô Hạn</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sfx.tap(soundEnabled);
                      resetBoardForStage(currentStageCfg);
                    }}
                    className="py-2.5 px-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Chơi lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.tap(soundEnabled);
                      setViewMode('map');
                    }}
                    className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Bản đồ 15 màn</span>
                  </button>
                </div>

                {currentStageCfg.isFinale && (
                  <button
                    type="button"
                    onClick={() => {
                      sfx.star(soundEnabled);
                      if (onShowVictory) {
                        onShowVictory();
                      } else {
                        onComplete(5);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Xem Cúp Chiến Thắng & Quà Đảo Vui Nhộn</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BẢNG THỐNG KÊ CHẾ ĐỘ CHƠI TỰ DO VÔ HẠN */}
        {endlessSummaryOpen && viewMode === 'endless' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-purple-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                <Trophy className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-extrabold uppercase tracking-wider text-purple-600">
                  Thành Tích Chế Độ Tự Do
                </p>
                <h2 className="font-display font-extrabold text-2xl text-slate-900">
                  Bé Đã Đạt Đợt {endlessWave}!
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center tabular-nums bg-purple-50/70 border border-purple-200/70 rounded-2xl p-3">
                <div>
                  <div className="font-display font-extrabold text-lg text-slate-800">
                    {stats.totalPops} 🫧
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Bóng vỡ</div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-lg text-amber-600">
                    {stats.starsCollected} ⭐
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Sao vàng</div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-lg text-sky-600">
                    {stats.diamondsCollected} 💎
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Kim cương</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sfx.pop(soundEnabled);
                    resetBoardForEndless();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-display font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi lại Chế Độ Tự Do</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sfx.tap(soundEnabled);
                    setViewMode('map');
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-bold text-sm cursor-pointer"
                >
                  Về Bản Đồ 15 Màn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHÚ THÍCH 4 LOẠI BÓNG & KHO BÁU ĐÃ THU HOẠCH */}
      <section
        aria-label="Khu vực kho báu và chú thích bốn loại bóng"
        className="bg-gradient-to-r from-amber-50/90 via-white to-sky-50/90 rounded-2xl border border-amber-200/80 p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-bold text-slate-700">
          <span className="text-slate-900 font-extrabold">4 loại bóng:</span>
          <span>🫧 Bóng thường (+1 ⭐)</span>
          <span>🌟 Bóng sao (+2 ⭐)</span>
          <span>💠 Bóng kim cương (+1 💎)</span>
          <span>🎁 Bóng kho báu (+3⭐ +1💎)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 min-h-[36px]">
          {recentLoot.length === 0 ? (
            <span className="text-xs font-medium text-slate-500">
              Chạm vào bong bóng để thu hoạch vào rương kho báu nhé!
            </span>
          ) : (
            recentLoot.map((item) => (
              <span
                key={item.id}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-base"
              >
                {item.kind === 'star' ? (
                  '⭐'
                ) : item.kind === 'diamond' ? (
                  '💎'
                ) : item.kind === 'chest' ? (
                  '🎁'
                ) : (
                  <span
                    className="w-3.5 h-3.5 rounded-sm rotate-45 inline-block shadow-xs"
                    style={{ backgroundColor: item.gemColor }}
                  />
                )}
              </span>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

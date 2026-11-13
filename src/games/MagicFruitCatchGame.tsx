import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, Sparkles, Star, Trophy, Volume2 } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { COMPANIONS } from '../data/worldData';
import { playTone, sfx, speakVietnamese, stopSpeech } from '../utils/audio';
import { loadTransparentSprite, ProcessedSprite } from '../utils/spriteMatting';

export type FruitCatchMode = 'color' | 'specific' | 'counting' | 'size' | 'rabbit';

export interface FruitSpec {
  id: 'apple' | 'orange' | 'banana' | 'strawberry' | 'grape' | 'watermelon' | 'mango' | 'pineapple';
  name: string;
  colorGroup: 'red' | 'orange' | 'yellow' | 'purple' | 'green';
  colorLabel: string;
  image: string;
  emoji: string;
  tintHex: string;
}

const BACKDROP_URL = '/src/assets/images/fruit_catch_backdrop_1794538794780.jpg';
const BASKET_URL = '/src/assets/images/fruit_catch_basket_1794538794001.jpg';

const FRUITS: FruitSpec[] = [
  {
    id: 'apple',
    name: 'Táo đỏ',
    colorGroup: 'red',
    colorLabel: 'Màu đỏ',
    image: '/src/assets/images/fruit_apple_3d_1794538794672.jpg',
    emoji: '🍎',
    tintHex: '#EF4444',
  },
  {
    id: 'orange',
    name: 'Cam vàng',
    colorGroup: 'orange',
    colorLabel: 'Màu cam',
    image: '/src/assets/images/fruit_orange_3d_1794538795029.jpg',
    emoji: '🍊',
    tintHex: '#F97316',
  },
  {
    id: 'banana',
    name: 'Chuối vàng',
    colorGroup: 'yellow',
    colorLabel: 'Màu vàng',
    image: '/src/assets/images/fruit_banana_3d_1794538795282.jpg',
    emoji: '🍌',
    tintHex: '#EAB308',
  },
  {
    id: 'strawberry',
    name: 'Dâu tây đỏ',
    colorGroup: 'red',
    colorLabel: 'Màu đỏ',
    image: '/src/assets/images/fruit_strawberry_3d_1794538796146.jpg',
    emoji: '🍓',
    tintHex: '#E11D48',
  },
  {
    id: 'grape',
    name: 'Nho tím',
    colorGroup: 'purple',
    colorLabel: 'Màu tím',
    image: '/src/assets/images/fruit_grape_3d_1794538796826.jpg',
    emoji: '🍇',
    tintHex: '#8B5CF6',
  },
  {
    id: 'watermelon',
    name: 'Dưa hấu',
    colorGroup: 'green',
    colorLabel: 'Màu xanh',
    image: '/src/assets/images/fruit_watermelon_3d_1794538797188.jpg',
    emoji: '🍉',
    tintHex: '#16A34A',
  },
  {
    id: 'mango',
    name: 'Xoài chín',
    colorGroup: 'yellow',
    colorLabel: 'Màu vàng',
    image: '/src/assets/images/fruit_mango_3d_1794538797635.jpg',
    emoji: '🥭',
    tintHex: '#F59E0B',
  },
  {
    id: 'pineapple',
    name: 'Quả dứa',
    colorGroup: 'yellow',
    colorLabel: 'Màu vàng',
    image: '/src/assets/images/fruit_pineapple_3d_1794538798447.jpg',
    emoji: '🍍',
    tintHex: '#D97706',
  },
];

const MODE_LIST: { id: FruitCatchMode; shortTitle: string; badge: string }[] = [
  { id: 'color', shortTitle: '1. Theo màu sắc', badge: '🎨' },
  { id: 'specific', shortTitle: '2. Đúng loại quả', badge: '🍌' },
  { id: 'counting', shortTitle: '3. Giỏ số lượng', badge: '🔢' },
  { id: 'size', shortTitle: '4. Quả to & nhỏ', badge: '⚖️' },
  { id: 'rabbit', shortTitle: '5. Quà bạn Thỏ', badge: '🐰' },
];

const COLOR_CHALLENGES = [
  { colorGroup: 'red' as const, label: 'Màu đỏ', hex: '#EF4444', voice: 'Bé hãy hứng những quả màu đỏ nhé!' },
  { colorGroup: 'yellow' as const, label: 'Màu vàng', hex: '#EAB308', voice: 'Bé hãy hứng những quả màu vàng nhé!' },
  { colorGroup: 'orange' as const, label: 'Màu cam', hex: '#F97316', voice: 'Bé hãy hứng quả màu cam nhé!' },
  { colorGroup: 'purple' as const, label: 'Màu tím', hex: '#8B5CF6', voice: 'Bé hãy hứng chùm nho màu tím nhé!' },
  { colorGroup: 'green' as const, label: 'Màu xanh', hex: '#16A34A', voice: 'Bé hãy hứng quả dưa hấu màu xanh nhé!' },
];

const RABBIT_ORDERS: {
  items: { fruitId: FruitSpec['id']; needed: number }[];
  voice: string;
}[] = [
  {
    items: [
      { fruitId: 'apple', needed: 1 },
      { fruitId: 'orange', needed: 2 },
    ],
    voice: 'Thỏ muốn có một quả táo đỏ và hai quả cam vàng!',
  },
  {
    items: [
      { fruitId: 'strawberry', needed: 2 },
      { fruitId: 'banana', needed: 2 },
    ],
    voice: 'Thỏ muốn có hai quả dâu tây đỏ và hai quả chuối vàng!',
  },
  {
    items: [
      { fruitId: 'pineapple', needed: 1 },
      { fruitId: 'grape', needed: 2 },
    ],
    voice: 'Thỏ muốn có một quả dứa và hai chùm nho tím!',
  },
  {
    items: [
      { fruitId: 'mango', needed: 2 },
      { fruitId: 'watermelon', needed: 1 },
    ],
    voice: 'Thỏ muốn có hai quả xoài chín và một quả dưa hấu!',
  },
];

const VIETNAMESE_NUMBERS = ['', 'Một', 'Hai', 'Ba', 'Bốn', 'Năm'];
const PRAISE_WORDS = ['Giỏi quá!', 'Bé làm tốt lắm!', 'Tuyệt vời!'];

interface MissionConfig {
  mode: FruitCatchMode;
  title: string;
  voicePrompt: string;
  targetCount: number;
  durationSec: number;
  targetColor?: (typeof COLOR_CHALLENGES)[number];
  targetFruit?: FruitSpec;
  targetSize?: 'big' | 'small';
  rabbitOrder?: {
    items: { fruitId: FruitSpec['id']; needed: number; collected: number }[];
    voice: string;
  };
}

interface FallingFruitEntity {
  uid: number;
  fruit: FruitSpec;
  x: number;
  y: number;
  vy: number;
  vx: number;
  rotation: number;
  rotSpeed: number;
  sizeCategory: 'big' | 'small' | 'normal';
  displaySize: number;
  whooshed?: boolean;
}

interface CapturingFruit {
  uid: number;
  fruit: FruitSpec;
  startX: number;
  startY: number;
  size: number;
  progress: number; // 0..1
}

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingFeedback {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

interface MagicFruitCatchGameProps {
  soundEnabled: boolean;
  voiceEnabled: boolean;
  isPaused: boolean;
  onComplete: (starsEarned: number) => void;
}

function buildMission(mode: FruitCatchMode, seed: number): MissionConfig {
  if (mode === 'color') {
    const ch = COLOR_CHALLENGES[seed % COLOR_CHALLENGES.length];
    return {
      mode: 'color',
      title: `Hứng quả ${ch.label}`,
      voicePrompt: ch.voice,
      targetCount: 5,
      durationSec: 60,
      targetColor: ch,
    };
  }
  if (mode === 'specific') {
    const pickOrder: FruitSpec['id'][] = [
      'banana',
      'apple',
      'strawberry',
      'orange',
      'grape',
      'watermelon',
      'mango',
      'pineapple',
    ];
    const pickedId = pickOrder[seed % pickOrder.length];
    const fruit = FRUITS.find((f) => f.id === pickedId) ?? FRUITS[0];
    return {
      mode: 'specific',
      title: `Hứng ${fruit.name}`,
      voicePrompt: `Hãy hứng ${fruit.name} nhé!`,
      targetCount: 5,
      durationSec: 60,
      targetFruit: fruit,
    };
  }
  if (mode === 'counting') {
    const counts = [3, 4, 5, 2, 1];
    const targetCount = counts[seed % counts.length];
    return {
      mode: 'counting',
      title: `Hứng đủ ${targetCount} quả`,
      voicePrompt: `Bé hãy hứng đủ ${targetCount} quả vào giỏ quà nhé!`,
      targetCount,
      durationSec: 55,
    };
  }
  if (mode === 'size') {
    const targetSize = seed % 2 === 0 ? 'big' : 'small';
    return {
      mode: 'size',
      title: targetSize === 'big' ? 'Hứng những quả TO' : 'Hứng những quả NHỎ',
      voicePrompt:
        targetSize === 'big'
          ? 'Bé hãy hứng những quả thật to nhé!'
          : 'Bé hãy hứng những quả nhỏ xinh nhé!',
      targetCount: 5,
      durationSec: 60,
      targetSize,
    };
  }
  const orderTemplate = RABBIT_ORDERS[seed % RABBIT_ORDERS.length];
  const totalNeeded = orderTemplate.items.reduce((sum, i) => sum + i.needed, 0);
  return {
    mode: 'rabbit',
    title: 'Giỏ quà của bạn Thỏ',
    voicePrompt: orderTemplate.voice,
    targetCount: totalNeeded,
    durationSec: 70,
    rabbitOrder: {
      voice: orderTemplate.voice,
      items: orderTemplate.items.map((it) => ({ ...it, collected: 0 })),
    },
  };
}

export const MagicFruitCatchGame: React.FC<MagicFruitCatchGameProps> = ({
  soundEnabled,
  voiceEnabled,
  isPaused,
  onComplete,
}) => {
  const [modeIndex, setModeIndex] = useState(0);
  const [missionSeed, setMissionSeed] = useState(0);
  const currentMode = MODE_LIST[modeIndex].id;

  const [phase, setPhase] = useState<'intro' | 'playing' | 'cleared' | 'timeout'>('intro');
  const [mission, setMission] = useState<MissionConfig>(() => buildMission('color', 0));
  const [collectedCount, setCollectedCount] = useState(0);
  const [collectedFruits, setCollectedFruits] = useState<FruitSpec[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [completedModesCount, setCompletedModesCount] = useState(0);
  const [praiseText, setPraiseText] = useState('Giỏi quá!');

  // Transparent 3D sprite assets
  const [spritesReady, setSpritesReady] = useState(false);
  const [fruitDataUrls, setFruitDataUrls] = useState<Record<string, string>>({});
  const [basketDataUrl, setBasketDataUrl] = useState<string>('');
  const backdropImgRef = useRef<HTMLImageElement | null>(null);
  const basketSpriteRef = useRef<ProcessedSprite | null>(null);
  const fruitSpritesRef = useRef<Record<string, ProcessedSprite | null>>({});

  // Canvas & physics refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const arenaSizeRef = useRef({ width: 880, height: 500 });

  const basketPosRef = useRef({ x: 440, targetX: 440, bounce: 0, shake: 0 });
  const fallingRef = useRef<FallingFruitEntity[]>([]);
  const capturingRef = useRef<CapturingFruit[]>([]);
  const particlesRef = useRef<SparkleParticle[]>([]);
  const feedbackRef = useRef<FloatingFeedback[]>([]);
  const insideBasketFruitsRef = useRef<{ fruit: FruitSpec; offsetX: number; offsetY: number }[]>([]);
  const spawnTimerRef = useRef(0);
  const uidCounterRef = useRef(1);
  const keysRef = useRef({ left: false, right: false });

  // Live refs synced with React state for zero-lag RAF loop
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const pausedRef = useRef(isPaused);
  pausedRef.current = isPaused;
  const missionRef = useRef(mission);
  missionRef.current = mission;
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;
  const voiceRef = useRef(voiceEnabled);
  voiceRef.current = voiceEnabled;
  const collectedCountRef = useRef(collectedCount);
  collectedCountRef.current = collectedCount;

  const rabbitCompanion = useMemo(
    () => COMPANIONS.find((c) => c.id === 'rabbit') ?? COMPANIONS[0],
    []
  );

  // Preload & cleanly cut out all 3D sprites on mount
  useEffect(() => {
    let active = true;

    const bgImg = new Image();
    bgImg.referrerPolicy = 'no-referrer';
    bgImg.onload = () => {
      if (active) backdropImgRef.current = bgImg;
    };
    bgImg.src = BACKDROP_URL;

    Promise.all([
      loadTransparentSprite(BASKET_URL, { clearEnclosedWhiteHoles: true }),
      ...FRUITS.map((f) => loadTransparentSprite(f.image)),
    ]).then(([basketRes, ...fruitResults]) => {
      if (!active) return;
      basketSpriteRef.current = basketRes;
      if (basketRes?.dataUrl) setBasketDataUrl(basketRes.dataUrl);

      const urlMap: Record<string, string> = {};
      FRUITS.forEach((f, idx) => {
        const sprite = fruitResults[idx] ?? null;
        fruitSpritesRef.current[f.id] = sprite;
        urlMap[f.id] = sprite?.dataUrl || f.image;
      });
      setFruitDataUrls(urlMap);
      setSpritesReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  // Speak mission prompt when entering intro
  useEffect(() => {
    if (phase === 'intro') {
      speakVietnamese(mission.voicePrompt, voiceEnabled);
    }
  }, [phase, mission, voiceEnabled]);

  // Helper to configure a mode cleanly
  const prepareMode = useCallback(
    (nextModeIdx: number, nextSeed: number, autoStart = false) => {
      const mId = MODE_LIST[nextModeIdx].id;
      const nextMission = buildMission(mId, nextSeed);
      setModeIndex(nextModeIdx);
      setMissionSeed(nextSeed);
      setMission(nextMission);
      setCollectedCount(0);
      collectedCountRef.current = 0;
      setCollectedFruits([]);
      setTimeLeft(nextMission.durationSec);
      fallingRef.current = [];
      capturingRef.current = [];
      particlesRef.current = [];
      feedbackRef.current = [];
      insideBasketFruitsRef.current = [];
      spawnTimerRef.current = 0.25;
      setPhase(autoStart ? 'playing' : 'intro');
      if (autoStart) {
        speakVietnamese(nextMission.voicePrompt, voiceRef.current);
      }
    },
    []
  );

  // Countdown timer during active play
  useEffect(() => {
    if (phase !== 'playing' || isPaused) return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPhase('timeout');
          speakVietnamese('Hết giờ rồi! Bé thử chơi lại cùng bạn Thỏ nhé!', voiceRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, isPaused]);

  // Keyboard arrow controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Resize observer to keep canvas crisp & properly scaled on mobile/tablet/desktop
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(320, Math.round(rect.width));
      const h = Math.max(420, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      arenaSizeRef.current = { width: w, height: h };
      basketPosRef.current.x = Math.min(Math.max(basketPosRef.current.x, 90), w - 90);
      basketPosRef.current.targetX = Math.min(Math.max(basketPosRef.current.targetX, 90), w - 90);
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Spawn a fruit aligned with the active educational mode
  const spawnFruit = useCallback((arenaW: number) => {
    const m = missionRef.current;
    let chosenFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    let sizeCategory: 'big' | 'small' | 'normal' = 'normal';

    if (m.mode === 'color' && m.targetColor) {
      const matching = FRUITS.filter((f) => f.colorGroup === m.targetColor!.colorGroup);
      const others = FRUITS.filter((f) => f.colorGroup !== m.targetColor!.colorGroup);
      chosenFruit =
        Math.random() < 0.56
          ? matching[Math.floor(Math.random() * matching.length)]
          : others[Math.floor(Math.random() * others.length)];
    } else if (m.mode === 'specific' && m.targetFruit) {
      if (Math.random() < 0.52) {
        chosenFruit = m.targetFruit;
      }
    } else if (m.mode === 'rabbit' && m.rabbitOrder) {
      const stillNeeded = m.rabbitOrder.items.filter((it) => it.collected < it.needed);
      if (stillNeeded.length > 0 && Math.random() < 0.65) {
        const pick = stillNeeded[Math.floor(Math.random() * stillNeeded.length)];
        chosenFruit = FRUITS.find((f) => f.id === pick.fruitId) ?? chosenFruit;
      }
    } else if (m.mode === 'size') {
      sizeCategory = Math.random() < 0.55 ? (m.targetSize ?? 'big') : m.targetSize === 'big' ? 'small' : 'big';
    }

    const baseScale = arenaW < 520 ? 0.82 : 1;
    const displaySize =
      sizeCategory === 'big'
        ? Math.round(114 * baseScale)
        : sizeCategory === 'small'
        ? Math.round(54 * baseScale)
        : Math.round(82 * baseScale);

    const margin = displaySize * 0.65 + 16;
    const x = margin + Math.random() * Math.max(40, arenaW - margin * 2);

    fallingRef.current.push({
      uid: uidCounterRef.current++,
      fruit: chosenFruit,
      x,
      y: -displaySize * 0.55,
      vy: (125 + Math.random() * 55) * (arenaW < 520 ? 0.92 : 1),
      vx: (Math.random() - 0.5) * 18,
      rotation: (Math.random() - 0.5) * 0.35,
      rotSpeed: (Math.random() - 0.5) * 0.6,
      sizeCategory,
      displaySize,
      whooshed: false,
    });
  }, []);

  // Evaluate whether a caught fruit matches the current mode rules
  const handleFruitCaught = useCallback((entity: FallingFruitEntity) => {
    const m = missionRef.current;
    let isCorrect = false;
    let gentleHint = '';

    if (m.mode === 'color' && m.targetColor) {
      isCorrect = entity.fruit.colorGroup === m.targetColor.colorGroup;
      if (!isCorrect) gentleHint = `${entity.fruit.name} (${entity.fruit.colorLabel})!`;
    } else if (m.mode === 'specific' && m.targetFruit) {
      isCorrect = entity.fruit.id === m.targetFruit.id;
      if (!isCorrect) gentleHint = `Đây là ${entity.fruit.name}!`;
    } else if (m.mode === 'counting') {
      isCorrect = collectedCountRef.current < m.targetCount;
    } else if (m.mode === 'size' && m.targetSize) {
      isCorrect = entity.sizeCategory === m.targetSize;
      if (!isCorrect) {
        gentleHint = entity.sizeCategory === 'big' ? 'Quả này TO nè!' : 'Quả này NHỎ nè!';
      }
    } else if (m.mode === 'rabbit' && m.rabbitOrder) {
      const targetItem = m.rabbitOrder.items.find(
        (it) => it.fruitId === entity.fruit.id && it.collected < it.needed
      );
      if (targetItem) {
        isCorrect = true;
        targetItem.collected += 1;
        setMission({
          ...m,
          rabbitOrder: {
            ...m.rabbitOrder,
            items: m.rabbitOrder.items.map((it) => ({ ...it })),
          },
        });
      } else {
        gentleHint = 'Thỏ chưa cần quả này!';
      }
    }

    // Trigger basket squash-bounce & vibration
    basketPosRef.current.bounce = 1;
    basketPosRef.current.shake = isCorrect ? 7 : 3;

    if (isCorrect) {
      sfx.star(soundRef.current);
      // Spawn cheerful golden sparkles around basket rim
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        particlesRef.current.push({
          x: entity.x,
          y: entity.y,
          vx: Math.cos(angle) * (65 + Math.random() * 80),
          vy: Math.sin(angle) * (65 + Math.random() * 80) - 35,
          life: 0,
          maxLife: 0.55 + Math.random() * 0.2,
          color: i % 2 === 0 ? '#FBBF24' : '#34D399',
          size: 5 + Math.random() * 4,
        });
      }

      // Add visual mini fruit resting inside basket
      insideBasketFruitsRef.current = [
        ...insideBasketFruitsRef.current.slice(-5),
        {
          fruit: entity.fruit,
          offsetX: (Math.random() - 0.5) * 68,
          offsetY: (Math.random() - 0.5) * 14,
        },
      ];

      const nextCount = collectedCountRef.current + 1;
      collectedCountRef.current = nextCount;
      setCollectedCount(nextCount);
      setCollectedFruits((prev) => [...prev, entity.fruit]);

      const feedbackWord =
        m.mode === 'counting'
          ? `${VIETNAMESE_NUMBERS[nextCount] ?? nextCount}!`
          : PRAISE_WORDS[nextCount % PRAISE_WORDS.length];

      feedbackRef.current.push({
        x: entity.x,
        y: entity.y - 26,
        text: feedbackWord,
        color: '#D97706',
        life: 0.9,
      });

      if (m.mode === 'counting') {
        speakVietnamese(VIETNAMESE_NUMBERS[nextCount] ?? `${nextCount}`, voiceRef.current);
      } else if (nextCount < m.targetCount && nextCount % 2 === 0) {
        speakVietnamese(PRAISE_WORDS[nextCount % PRAISE_WORDS.length], voiceRef.current);
      }

      if (nextCount >= m.targetCount) {
        const chosenPraise = PRAISE_WORDS[Math.floor(Math.random() * PRAISE_WORDS.length)];
        setPraiseText(chosenPraise);
        setCompletedModesCount((c) => c + 1);
        setPhase('cleared');
        sfx.victory(soundRef.current);
        speakVietnamese(
          m.mode === 'rabbit'
            ? `${chosenPraise} Thỏ cảm ơn bé đã chuẩn bị giỏ quà tuyệt vời!`
            : `${chosenPraise} Bé đã hoàn thành nhiệm vụ rồi!`,
          voiceRef.current
        );
      }
    } else {
      sfx.gentleOops(soundRef.current);
      feedbackRef.current.push({
        x: entity.x,
        y: entity.y - 24,
        text: gentleHint || 'Thử quả khác nhé!',
        color: '#64748B',
        life: 0.85,
      });
    }
  }, []);

  // Main 60FPS Game Loop (Rendering Backdrop + Fruits + Large 3D Basket + Collision)
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const { width: arenaW, height: arenaH } = arenaSizeRef.current;

      if (canvas && ctx) {
        const dpr = canvas.width / arenaW;
        ctx.save();
        ctx.scale(dpr, dpr);

        // 1. Draw sunny 3D tropical orchard backdrop (cover-fit)
        const bg = backdropImgRef.current;
        if (bg && bg.complete && bg.naturalWidth > 0) {
          const imgRatio = bg.naturalWidth / bg.naturalHeight;
          const arenaRatio = arenaW / arenaH;
          let drawW = arenaW;
          let drawH = arenaH;
          let drawX = 0;
          let drawY = 0;
          if (arenaRatio > imgRatio) {
            drawW = arenaW;
            drawH = arenaW / imgRatio;
            drawY = (arenaH - drawH) * 0.5;
          } else {
            drawH = arenaH;
            drawW = arenaH * imgRatio;
            drawX = (arenaW - drawW) * 0.5;
          }
          ctx.drawImage(bg, drawX, drawY, drawW, drawH);
          // Subtle bright wash in upper-center so fruits pop clearly
          const skyVeil = ctx.createLinearGradient(0, 0, 0, arenaH * 0.72);
          skyVeil.addColorStop(0, 'rgba(255, 253, 245, 0.22)');
          skyVeil.addColorStop(1, 'rgba(255, 253, 245, 0.0)');
          ctx.fillStyle = skyVeil;
          ctx.fillRect(0, 0, arenaW, arenaH);
        } else {
          const grad = ctx.createLinearGradient(0, 0, 0, arenaH);
          grad.addColorStop(0, '#BAE6FD');
          grad.addColorStop(0.7, '#FEF9C3');
          grad.addColorStop(1, '#86EFAC');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, arenaW, arenaH);
        }

        // Basket dimensions (Large & prominent 3D basket at bottom)
        const basketW = Math.min(220, Math.max(145, arenaW * 0.24));
        const basketH = basketW * 0.78;
        const basketBaseY = arenaH - basketH * 0.56 - 14;

        // Smooth keyboard & pointer interpolation
        if (phaseRef.current === 'playing' && !pausedRef.current) {
          const keySpeed = 480 * dt;
          if (keysRef.current.left) basketPosRef.current.targetX -= keySpeed;
          if (keysRef.current.right) basketPosRef.current.targetX += keySpeed;
        }
        const minX = basketW * 0.5 + 10;
        const maxX = arenaW - basketW * 0.5 - 10;
        basketPosRef.current.targetX = Math.min(maxX, Math.max(minX, basketPosRef.current.targetX));
        basketPosRef.current.x +=
          (basketPosRef.current.targetX - basketPosRef.current.x) * Math.min(1, dt * 16);

        // Decay basket bounce & shake
        basketPosRef.current.bounce = Math.max(0, basketPosRef.current.bounce - dt * 4.5);
        basketPosRef.current.shake = Math.max(0, basketPosRef.current.shake - dt * 28);

        const bx =
          basketPosRef.current.x +
          (basketPosRef.current.shake > 0
            ? Math.sin(now * 0.08) * basketPosRef.current.shake
            : 0);
        const by = basketBaseY;

        // Spawn & update falling fruits when active
        if (phaseRef.current === 'playing' && !pausedRef.current) {
          spawnTimerRef.current -= dt;
          if (spawnTimerRef.current <= 0 && fallingRef.current.length < 6) {
            spawnFruit(arenaW);
            spawnTimerRef.current = 0.95 + Math.random() * 0.45;
          }

          const rimTopY = by - basketH * 0.14;
          const rimBottomY = by + basketH * 0.22;
          const catchHalfWidth = basketW * 0.43;

          const remaining: FallingFruitEntity[] = [];
          for (const ent of fallingRef.current) {
            ent.y += ent.vy * dt;
            ent.x += ent.vx * dt;
            ent.rotation += ent.rotSpeed * dt;

            // Keep horizontally within bounds
            const r = ent.displaySize * 0.45;
            if (ent.x < r + 8) {
              ent.x = r + 8;
              ent.vx = Math.abs(ent.vx);
            } else if (ent.x > arenaW - r - 8) {
              ent.x = arenaW - r - 8;
              ent.vx = -Math.abs(ent.vx);
            }

            // Gentle soft drop sound once fruit enters top of view
            if (!ent.whooshed && ent.y > 24) {
              ent.whooshed = true;
              if (soundRef.current) {
                playTone(580, 0.07, 'sine', 0.03);
              }
            }

            // Accurate catch collision with wide open basket mouth (NO pass-through!)
            const fruitBottomY = ent.y + ent.displaySize * 0.3;
            const inMouthY = fruitBottomY >= rimTopY && ent.y <= rimBottomY;
            const inMouthX = Math.abs(ent.x - bx) <= catchHalfWidth;

            if (inMouthY && inMouthX) {
              capturingRef.current.push({
                uid: ent.uid,
                fruit: ent.fruit,
                startX: ent.x,
                startY: ent.y,
                size: ent.displaySize,
                progress: 0,
              });
              handleFruitCaught(ent);
              continue;
            }

            // If fruit hits basket rim edges/sides below mouth, keep it from passing through front of basket
            if (ent.y < arenaH + ent.displaySize * 0.6) {
              remaining.push(ent);
            }
          }
          fallingRef.current = remaining;
        }

        // 2. Draw falling fruits (with soft glow shadow for depth)
        for (const ent of fallingRef.current) {
          const sprite = fruitSpritesRef.current[ent.fruit.id];
          ctx.save();
          ctx.translate(ent.x, ent.y);
          ctx.rotate(ent.rotation);

          // Soft ambient drop shadow
          ctx.shadowColor = 'rgba(15, 23, 42, 0.28)';
          ctx.shadowBlur = 12;
          ctx.shadowOffsetY = 6;

          if (sprite) {
            const aspect = sprite.width / sprite.height;
            const drawH = ent.displaySize;
            const drawW = drawH * aspect;
            ctx.drawImage(sprite.canvas, -drawW / 2, -drawH / 2, drawW, drawH);
          } else {
            ctx.font = `${ent.displaySize * 0.8}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ent.fruit.emoji, 0, 0);
          }
          ctx.restore();
        }

        // 3. Draw capturing fruits animating smoothly into the basket opening
        const nextCapturing: CapturingFruit[] = [];
        for (const cap of capturingRef.current) {
          cap.progress += dt * 5.2;
          if (cap.progress < 1) {
            const t = cap.progress;
            const curX = cap.startX + (bx - cap.startX) * t;
            const curY = cap.startY + (by + basketH * 0.04 - cap.startY) * t;
            const curSize = cap.size * (1 - t * 0.62);
            const sprite = fruitSpritesRef.current[cap.fruit.id];
            ctx.save();
            ctx.globalAlpha = 1 - t * 0.45;
            ctx.translate(curX, curY);
            if (sprite) {
              const aspect = sprite.width / sprite.height;
              ctx.drawImage(sprite.canvas, -(curSize * aspect) / 2, -curSize / 2, curSize * aspect, curSize);
            } else {
              ctx.font = `${curSize * 0.8}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(cap.fruit.emoji, 0, 0);
            }
            ctx.restore();
            nextCapturing.push(cap);
          }
        }
        capturingRef.current = nextCapturing;

        // 4. Draw soft ground shadow under the large 3D wicker basket
        ctx.save();
        ctx.fillStyle = 'rgba(20, 45, 20, 0.28)';
        ctx.beginPath();
        ctx.ellipse(bx, by + basketH * 0.46, basketW * 0.42, basketH * 0.11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 5. Draw collected fruits peeking inside the basket rim
        for (const item of insideBasketFruitsRef.current) {
          const sprite = fruitSpritesRef.current[item.fruit.id];
          const miniSize = basketW * 0.24;
          const ix = bx + item.offsetX * (basketW / 200);
          const iy = by + basketH * 0.03 + item.offsetY;
          ctx.save();
          ctx.translate(ix, iy);
          if (sprite) {
            const aspect = sprite.width / sprite.height;
            ctx.drawImage(sprite.canvas, -(miniSize * aspect) / 2, -miniSize / 2, miniSize * aspect, miniSize);
          }
          ctx.restore();
        }

        // 6. Draw the Large 3D Woven Wicker Basket with squash-and-stretch bounce
        const bouncePhase = basketPosRef.current.bounce;
        const scaleY = 1 - Math.sin(bouncePhase * Math.PI) * 0.12;
        const scaleX = 1 + Math.sin(bouncePhase * Math.PI) * 0.09;
        const basketSprite = basketSpriteRef.current;

        ctx.save();
        ctx.translate(bx, by + basketH * 0.44);
        ctx.scale(scaleX, scaleY);
        ctx.translate(0, -basketH * 0.44);

        ctx.shadowColor = 'rgba(40, 25, 10, 0.35)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 8;

        if (basketSprite) {
          ctx.drawImage(
            basketSprite.canvas,
            -basketW / 2,
            -basketH / 2,
            basketW,
            basketH
          );
        } else {
          // High-craft vector fallback while loading
          ctx.fillStyle = '#B45309';
          ctx.beginPath();
          ctx.ellipse(0, 0, basketW * 0.45, basketH * 0.35, 0, 0, Math.PI);
          ctx.fill();
        }
        ctx.restore();

        // 7. Draw sparkle particles
        const nextParticles: SparkleParticle[] = [];
        for (const p of particlesRef.current) {
          p.life += dt;
          if (p.life < p.maxLife) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 120 * dt;
            const alpha = 1 - p.life / p.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            nextParticles.push(p);
          }
        }
        particlesRef.current = nextParticles;

        // 8. Draw floating praise/hint text
        const nextFeedback: FloatingFeedback[] = [];
        for (const fb of feedbackRef.current) {
          fb.life -= dt;
          if (fb.life > 0) {
            fb.y -= 36 * dt;
            ctx.save();
            ctx.globalAlpha = Math.min(1, fb.life * 1.4);
            ctx.font = '800 22px "Baloo 2", sans-serif';
            ctx.textAlign = 'center';
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#FFFFFF';
            ctx.strokeText(fb.text, fb.x, fb.y);
            ctx.fillStyle = fb.color;
            ctx.fillText(fb.text, fb.x, fb.y);
            ctx.restore();
            nextFeedback.push(fb);
          }
        }
        feedbackRef.current = nextFeedback;

        ctx.restore();
      }

      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, [spawnFruit, handleFruitCaught]);

  const handlePointerControl = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== 'playing' || isPaused) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    basketPosRef.current.targetX = x;
  };

  const progressPct = Math.min(100, Math.round((collectedCount / Math.max(1, mission.targetCount)) * 100));

  return (
    <div className="space-y-3">
      {/* Slim Top Mission HUD (Outside catching canvas so buttons never cover play area) */}
      <div className="bg-white rounded-3xl px-4 py-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Visual Target Indicator */}
          {mission.mode === 'color' && mission.targetColor && (
            <div
              className="w-11 h-11 rounded-2xl border-2 border-white shadow-sm shrink-0"
              style={{ backgroundColor: mission.targetColor.hex }}
            />
          )}
          {mission.mode === 'specific' && mission.targetFruit && (
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 p-1 shrink-0 flex items-center justify-center">
              <ResilientImage
                src={fruitDataUrls[mission.targetFruit.id] || mission.targetFruit.image}
                alt={mission.targetFruit.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          {mission.mode === 'counting' && (
            <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-800 font-display font-extrabold text-2xl flex items-center justify-center shrink-0 tabular-nums">
              {mission.targetCount}
            </div>
          )}
          {mission.mode === 'size' && (
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 font-display font-extrabold text-sm flex items-center justify-center shrink-0">
              {mission.targetSize === 'big' ? 'TO' : 'NHỎ'}
            </div>
          )}
          {mission.mode === 'rabbit' && (
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-sky-200 shrink-0">
              <ResilientImage
                src={rabbitCompanion.image}
                alt={rabbitCompanion.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg sm:text-xl text-slate-900 truncate">
                {mission.title}
              </span>
              <button
                type="button"
                onClick={() => speakVietnamese(mission.voicePrompt, voiceEnabled)}
                aria-label="Nghe yêu cầu"
                className="w-8 h-8 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 flex items-center justify-center cursor-pointer shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Rabbit checklist OR Counting visual slots */}
            {mission.mode === 'rabbit' && mission.rabbitOrder ? (
              <div className="flex flex-wrap items-center gap-3 mt-0.5 text-sm font-bold">
                {mission.rabbitOrder.items.map((item) => {
                  const f = FRUITS.find((fr) => fr.id === item.fruitId)!;
                  const done = item.collected >= item.needed;
                  return (
                    <span
                      key={item.fruitId}
                      className={`inline-flex items-center gap-1 tabular-nums ${
                        done ? 'text-emerald-700' : 'text-slate-700'
                      }`}
                    >
                      <img
                        src={fruitDataUrls[f.id] || f.image}
                        alt={f.name}
                        className="w-5 h-5 object-contain"
                      />
                      <span>
                        {item.collected}/{item.needed}
                      </span>
                      {done && <span>✓</span>}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-1">
                {Array.from({ length: mission.targetCount }).map((_, idx) => {
                  const caught = collectedFruits[idx];
                  return (
                    <div
                      key={idx}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center overflow-hidden ${
                        caught
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      {caught && (
                        <img
                          src={fruitDataUrls[caught.id] || caught.image}
                          alt={caught.name}
                          className="w-5 h-5 object-contain"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar + Collected Count + Time */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="w-28 sm:w-40">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1 tabular-nums">
              <span>Đã hứng: {collectedCount}/{mission.targetCount}</span>
              <span>{timeLeft}s</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Play Arena (Occupies majority of viewport, full smooth drag/mouse control) */}
      <div
        ref={containerRef}
        className="relative w-full h-[470px] sm:h-[540px] rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-sky-100 select-none touch-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            handlePointerControl(e.clientX);
          }}
          onPointerMove={(e) => handlePointerControl(e.clientX)}
          className="w-full h-full block cursor-grab active:cursor-grabbing"
        />

        {/* Subtle sprite prep indicator while alpha matting runs (~150ms) */}
        {!spritesReady && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 shadow-xs">
            Đang chuẩn bị trái cây 3D...
          </div>
        )}

        {/* PHASE: MISSION INTRO OVERLAY */}
        {phase === 'intro' && (
          <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-white/95 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-xl border border-amber-200 space-y-4">
              {/* 5 Modes Selector */}
              <div className="flex flex-wrap justify-center gap-1.5">
                {MODE_LIST.map((m, idx) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      sfx.tap(soundEnabled);
                      prepareMode(idx, missionSeed + 1, false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      idx === modeIndex
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {m.badge} {m.shortTitle}
                  </button>
                ))}
              </div>

              {/* Visual Mission Preview */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                {mission.mode === 'rabbit' ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md ring-4 ring-white shrink-0">
                    <ResilientImage
                      src={rabbitCompanion.image}
                      alt={rabbitCompanion.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : mission.mode === 'specific' && mission.targetFruit ? (
                  <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-sm shrink-0 flex items-center justify-center">
                    <ResilientImage
                      src={fruitDataUrls[mission.targetFruit.id] || mission.targetFruit.image}
                      alt={mission.targetFruit.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : mission.mode === 'color' && mission.targetColor ? (
                  <div className="flex items-center gap-2 shrink-0">
                    {FRUITS.filter((f) => f.colorGroup === mission.targetColor!.colorGroup)
                      .slice(0, 2)
                      .map((f) => (
                        <div
                          key={f.id}
                          className="w-20 h-20 rounded-2xl bg-white p-2 shadow-sm flex items-center justify-center"
                        >
                          <ResilientImage
                            src={fruitDataUrls[f.id] || f.image}
                            alt={f.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                  </div>
                ) : mission.mode === 'size' ? (
                  <div className="flex items-end gap-3 bg-white rounded-2xl px-4 py-2.5 shadow-sm shrink-0">
                    <img
                      src={fruitDataUrls.apple || FRUITS[0].image}
                      alt="Quả to"
                      className={`object-contain ${
                        mission.targetSize === 'big' ? 'w-16 h-16 ring-2 ring-orange-400 rounded-xl' : 'w-14 h-14 opacity-40'
                      }`}
                    />
                    <img
                      src={fruitDataUrls.apple || FRUITS[0].image}
                      alt="Quả nhỏ"
                      className={`object-contain ${
                        mission.targetSize === 'small' ? 'w-9 h-9 ring-2 ring-orange-400 rounded-lg' : 'w-8 h-8 opacity-40'
                      }`}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-sm shrink-0 flex items-center justify-center">
                    {basketDataUrl ? (
                      <img src={basketDataUrl} alt="Giỏ quà 3D" className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-display font-extrabold text-4xl text-sky-600">
                        {mission.targetCount}
                      </span>
                    )}
                  </div>
                )}

                <div className="text-center sm:text-left space-y-1">
                  <h2 className="font-display font-extrabold text-2xl text-slate-900">
                    {mission.title}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-700 font-medium">
                    {mission.voicePrompt}
                  </p>
                  <button
                    type="button"
                    onClick={() => speakVietnamese(mission.voicePrompt, voiceEnabled)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 pt-1 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    Nghe lại hướng dẫn
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sfx.pop(soundEnabled);
                    setPhase('playing');
                    speakVietnamese(mission.voicePrompt, voiceEnabled);
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-display font-extrabold text-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
                >
                  <Play className="w-6 h-6 fill-white" />
                  Bắt đầu chơi!
                </button>
              </div>
              <p className="text-center text-xs text-slate-500">
                Di chuyển chuột hoặc kéo ngón tay trên màn hình để điều khiển chiếc giỏ mây 3D
              </p>
            </div>
          </div>
        )}

        {/* PHASE: STAGE CLEARED CELEBRATION */}
        {phase === 'cleared' && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl border-2 border-amber-300 text-center space-y-5">
              <div className="flex items-center justify-center gap-3">
                {mission.mode === 'rabbit' && (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-amber-200 animate-companion-bounce">
                    <ResilientImage
                      src={rabbitCompanion.image}
                      alt={rabbitCompanion.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((i) => (
                    <Star
                      key={i}
                      className="w-10 h-10 fill-amber-400 text-amber-500 animate-companion-bounce"
                    />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-display font-extrabold text-3xl text-slate-900">
                  {praiseText}
                </h2>
                <p className="text-base text-slate-600 mt-1">
                  {mission.mode === 'rabbit'
                    ? 'Bạn Thỏ vui mừng ôm giỏ quà cảm ơn bé thật nhiều!'
                    : `Bé đã hoàn thành "${mission.title}" thật xuất sắc!`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sfx.tap(soundEnabled);
                    prepareMode(modeIndex, missionSeed + 1, true);
                  }}
                  className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Chơi lại màn này
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sfx.pop(soundEnabled);
                    const nextIdx = (modeIndex + 1) % MODE_LIST.length;
                    prepareMode(nextIdx, missionSeed + 1, false);
                  }}
                  className="py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-display font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Chuyển màn tiếp theo
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  onComplete(Math.min(5, 2 + Math.max(1, completedModesCount)));
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-display font-extrabold text-lg shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trophy className="w-5 h-5" />
                Nhận sao chiến thắng!
              </button>
            </div>
          </div>
        )}

        {/* PHASE: GENTLE TIME OUT */}
        {phase === 'timeout' && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl text-center space-y-4">
              <div className="text-5xl">🧺</div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900">
                Gần xong rồi bé ơi!
              </h2>
              <p className="text-sm text-slate-600">
                Bé đã hứng được {collectedCount} quả ngon. Mình chơi lại một lượt nữa nhé!
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => prepareMode(modeIndex, missionSeed, true)}
                  className="flex-1 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-display font-bold cursor-pointer"
                >
                  Chơi lại ngay
                </button>
                <button
                  type="button"
                  onClick={() => prepareMode((modeIndex + 1) % MODE_LIST.length, missionSeed + 1, false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-bold cursor-pointer"
                >
                  Chọn chế độ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

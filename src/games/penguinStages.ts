import { PenguinMilestoneBadgeId, PenguinProgress } from '../types/game';

export type IceChapterId = 1 | 2 | 3;
export type FloeKind = 'solid' | 'cracked' | 'drifting' | 'goal';
export type CollectibleKind = 'fish' | 'star' | 'gift' | 'pearl';

export const PENGUIN_PHYSICS = {
  gravity: 1050,
  vxMin: 155,
  vxMax: 395,
  vyMin: -360,
  vyMax: -565,
  chargeDuration: 0.92,
};

export interface IceFloe {
  id: number;
  baseX: number; // Left edge base X
  x: number; // Current left edge X
  y: number; // Surface top Y (offset relative to water surface)
  width: number;
  height: number;
  kind: FloeKind;
  driftAmp: number;
  driftSpeed: number;
  driftPhase: number;
  bobPhase: number;
  cracking: boolean;
  crackElapsed: number;
  crackDuration: number;
  sunk: boolean;
  landedOnce: boolean;
  hasSnowball?: boolean;
  snowballOffset?: number;
  snowballDir?: number;
  snowballSpeed?: number;
}

export interface SkyBird {
  id: number;
  baseX: number;
  x: number;
  baseY: number;
  y: number;
  ampY: number;
  speed: number;
  phase: number;
  flyAmpX: number;
  wingPhase: number;
}

export interface IceCollectible {
  id: number;
  kind: CollectibleKind;
  x: number;
  y: number;
  baseY: number;
  color: string;
  phase: number;
  collected: boolean;
}

export interface IceChapterMeta {
  id: IceChapterId;
  title: string;
  subtitle: string;
  difficultyLabel: string;
  gradient: string;
  accentHex: string;
  softBg: string;
  borderHex: string;
  badgeTitle: string;
}

export interface PenguinStageConfig {
  stage: number;
  chapter: IceChapterId;
  title: string;
  description: string;
  voiceIntro: string;
  floeCount: number;
  widthRange: [number, number];
  gapRange: [number, number];
  crackedRatio: number;
  driftingRatio: number;
  snowballCount: number;
  birdCount: number;
  crackDuration: number;
  driftSpeed: number;
  specialItems: boolean;
}

export interface PenguinMilestoneBadge {
  id: PenguinMilestoneBadgeId;
  title: string;
  description: string;
  requiredStages: number;
  icon: string;
  bgClass: string;
}

export const PENGUIN_MILESTONE_BADGES: PenguinMilestoneBadge[] = [
  {
    id: 'bay-5',
    title: 'Người Bạn Vịnh Băng',
    description: 'Hoàn thành Chặng 1 – Vịnh Băng Xanh (5 màn)',
    requiredStages: 5,
    icon: '🐧',
    bgClass: 'bg-sky-50 border-sky-200 text-sky-900',
  },
  {
    id: 'valley-10',
    title: 'Nhà Thám Hiểm Tuyết',
    description: 'Hoàn thành Chặng 2 – Thung Lũng Tuyết (10 màn)',
    requiredStages: 10,
    icon: '❄️',
    bgClass: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  },
  {
    id: 'kingdom-15',
    title: 'Vua Cánh Cụt Băng Giá',
    description: 'Chinh phục trọn vẹn 15 màn Vương Quốc Băng Giá',
    requiredStages: 15,
    icon: '👑',
    bgClass: 'bg-amber-50 border-amber-200 text-amber-900',
  },
];

export const ICE_CHAPTERS: IceChapterMeta[] = [
  {
    id: 1,
    title: 'Chặng 1 – Vịnh Băng Xanh',
    subtitle: 'Màn 1–5 · Tảng băng rộng, gần nhau giúp bé làm quen',
    difficultyLabel: 'Dễ · Làm quen',
    gradient: 'from-cyan-400 via-sky-500 to-blue-500',
    accentHex: '#0284C7',
    softBg: '#F0F9FF',
    borderHex: '#7DD3FC',
    badgeTitle: 'Người Bạn Vịnh Băng',
  },
  {
    id: 2,
    title: 'Chặng 2 – Thung Lũng Tuyết',
    subtitle: 'Màn 6–10 · Có băng nứt, cầu tuyết, băng trôi & nhiều cá sao',
    difficultyLabel: 'Vừa · Thú vị',
    gradient: 'from-indigo-400 via-blue-500 to-cyan-500',
    accentHex: '#4F46E5',
    softBg: '#EEF2FF',
    borderHex: '#A5B4FC',
    badgeTitle: 'Nhà Thám Hiểm Tuyết',
  },
  {
    id: 3,
    title: 'Chặng 3 – Vương Quốc Băng Giá',
    subtitle: 'Màn 11–15 · Thử thách tổng hợp & kho báu đỉnh băng',
    difficultyLabel: 'Chinh phục',
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    accentHex: '#D97706',
    softBg: '#FFFBEB',
    borderHex: '#FCD34D',
    badgeTitle: 'Vua Cánh Cụt Băng Giá',
  },
];

export const PENGUIN_STAGES: PenguinStageConfig[] = [
  // CHẶNG 1 – VỊNH BĂNG XANH (MÀN 1–5)
  {
    stage: 1,
    chapter: 1,
    title: 'Màn 1: Bước Nhảy Đầu Tiên',
    description: 'Những tảng băng rộng gần nhau, chạm nhẹ để nhảy sang băng bên cạnh!',
    voiceIntro: 'Chào mừng đến Vịnh Băng Xanh! Bé hãy chạm hoặc nhấn giữ nút Nhảy để sang tảng băng kế tiếp nhé!',
    floeCount: 7,
    widthRange: [132, 154],
    gapRange: [55, 88],
    crackedRatio: 0,
    driftingRatio: 0,
    snowballCount: 0,
    birdCount: 0,
    crackDuration: 3.0,
    driftSpeed: 0,
    specialItems: false,
  },
  {
    stage: 2,
    chapter: 1,
    title: 'Màn 2: Bữa Tiệc Cá Nhỏ',
    description: 'Nhảy qua các tảng băng và gom những chú cá sắc màu nhé!',
    voiceIntro: 'Màn 2! Có rất nhiều chú cá sắc màu đang bay trên mặt nước đấy!',
    floeCount: 8,
    widthRange: [125, 148],
    gapRange: [65, 102],
    crackedRatio: 0,
    driftingRatio: 0,
    snowballCount: 0,
    birdCount: 0,
    crackDuration: 3.0,
    driftSpeed: 0,
    specialItems: false,
  },
  {
    stage: 3,
    chapter: 1,
    title: 'Màn 3: Vòng Cung Sao Vàng',
    description: 'Nhấn giữ lâu hơn một chút để nhảy xa hái sao vàng trên cao!',
    voiceIntro: 'Màn 3! Bé thử nhấn giữ lâu hơn để nhảy xa và hái sao vàng nhé!',
    floeCount: 8,
    widthRange: [118, 144],
    gapRange: [72, 118],
    crackedRatio: 0,
    driftingRatio: 0,
    snowballCount: 0,
    birdCount: 0,
    crackDuration: 3.0,
    driftSpeed: 0,
    specialItems: false,
  },
  {
    stage: 4,
    chapter: 1,
    title: 'Màn 4: Hộp Quà Trên Sóng',
    description: 'Khám phá hộp quà bí mật đầu tiên trên vịnh băng xanh!',
    voiceIntro: 'Màn 4! Có hộp quà bí mật lấp lánh đang chờ bé ở phía trước kìa!',
    floeCount: 9,
    widthRange: [114, 140],
    gapRange: [75, 126],
    crackedRatio: 0,
    driftingRatio: 0.14,
    snowballCount: 0,
    birdCount: 0,
    crackDuration: 3.0,
    driftSpeed: 0.9,
    specialItems: true,
  },
  {
    stage: 5,
    chapter: 1,
    title: 'Màn 5: Vượt Vịnh Băng Xanh',
    description: 'Làm quen với tảng băng trôi nhẹ về đích Chặng 1!',
    voiceIntro: 'Màn 5! Hãy quan sát tảng băng trôi nhẹ nhàng để về đích Chặng 1 nhé!',
    floeCount: 10,
    widthRange: [110, 136],
    gapRange: [80, 132],
    crackedRatio: 0,
    driftingRatio: 0.28,
    snowballCount: 0,
    birdCount: 0,
    crackDuration: 3.0,
    driftSpeed: 1.05,
    specialItems: true,
  },

  // CHẶNG 2 – THUNG LŨNG TUYẾT (MÀN 6–10)
  {
    stage: 6,
    chapter: 2,
    title: 'Màn 6: Cẩn Thận Băng Nứt',
    description: 'Băng có vết nứt sẽ chìm dần sau vài giây — nhảy tiếp nhanh nhé!',
    voiceIntro: 'Chào mừng đến Thung Lũng Tuyết! Khi đứng trên tảng băng nứt, bé hãy nhảy sang tảng mới sớm nhé!',
    floeCount: 10,
    widthRange: [104, 130],
    gapRange: [80, 140],
    crackedRatio: 0.35,
    driftingRatio: 0.12,
    snowballCount: 0,
    birdCount: 0,
    crackDuration: 2.75,
    driftSpeed: 1.15,
    specialItems: false,
  },
  {
    stage: 7,
    chapter: 2,
    title: 'Màn 7: Cầu Tuyết Lăn Tròn',
    description: 'Quan sát quả cầu tuyết lăn qua lại trên tảng băng lớn!',
    voiceIntro: 'Màn 7! Có quả cầu tuyết tròn đang lăn trên băng, bé chờ nó lăn qua rồi nhảy nhé!',
    floeCount: 10,
    widthRange: [102, 134],
    gapRange: [85, 145],
    crackedRatio: 0.2,
    driftingRatio: 0.2,
    snowballCount: 2,
    birdCount: 0,
    crackDuration: 2.7,
    driftSpeed: 1.2,
    specialItems: true,
  },
  {
    stage: 8,
    chapter: 2,
    title: 'Màn 8: Những Chú Chim Hải Âu',
    description: 'Canh nhịp chim bay lượn trên không để thực hiện cú nhảy đẹp!',
    voiceIntro: 'Màn 8! Chú ý những chú chim biển bay trên bầu trời để nhảy thật khéo nhé!',
    floeCount: 11,
    widthRange: [98, 126],
    gapRange: [88, 150],
    crackedRatio: 0.22,
    driftingRatio: 0.25,
    snowballCount: 1,
    birdCount: 2,
    crackDuration: 2.6,
    driftSpeed: 1.25,
    specialItems: true,
  },
  {
    stage: 9,
    chapter: 2,
    title: 'Màn 9: Dòng Chảy Pha Lê',
    description: 'Nhiều tảng băng trôi chuyển động nhịp nhàng cùng kho báu cá sao!',
    voiceIntro: 'Màn 9! Hãy canh đúng lúc tảng băng trôi tới gần rồi nhảy nhé!',
    floeCount: 11,
    widthRange: [96, 124],
    gapRange: [92, 155],
    crackedRatio: 0.25,
    driftingRatio: 0.42,
    snowballCount: 2,
    birdCount: 1,
    crackDuration: 2.55,
    driftSpeed: 1.35,
    specialItems: true,
  },
  {
    stage: 10,
    chapter: 2,
    title: 'Màn 10: Vượt Thung Lũng Tuyết',
    description: 'Kết hợp băng nứt, băng trôi và cầu tuyết để nhận huy hiệu Chặng 2!',
    voiceIntro: 'Màn 10! Vượt qua thung lũng tuyết để nhận huy hiệu Nhà Thám Hiểm Tuyết nhé!',
    floeCount: 12,
    widthRange: [94, 124],
    gapRange: [95, 160],
    crackedRatio: 0.3,
    driftingRatio: 0.35,
    snowballCount: 2,
    birdCount: 2,
    crackDuration: 2.5,
    driftSpeed: 1.4,
    specialItems: true,
  },

  // CHẶNG 3 – VƯƠNG QUỐC BĂNG GIÁ (MÀN 11–15)
  {
    stage: 11,
    chapter: 3,
    title: 'Màn 11: Cổng Vương Quốc Băng',
    description: 'Tảng băng gọn hơn với thử thách nhảy xa chính xác!',
    voiceIntro: 'Chào mừng đến Vương Quốc Băng Giá! Những cú nhảy điêu luyện bắt đầu nhé!',
    floeCount: 12,
    widthRange: [88, 118],
    gapRange: [100, 172],
    crackedRatio: 0.32,
    driftingRatio: 0.32,
    snowballCount: 2,
    birdCount: 2,
    crackDuration: 2.35,
    driftSpeed: 1.45,
    specialItems: true,
  },
  {
    stage: 12,
    chapter: 3,
    title: 'Màn 12: Sóng Băng Trôi Nhanh',
    description: 'Vượt qua chuỗi tảng băng trôi và những chú chim tuyết!',
    voiceIntro: 'Màn 12! Quan sát thật tinh các tảng băng đang trôi để nhảy chuẩn xác nhé!',
    floeCount: 13,
    widthRange: [88, 118],
    gapRange: [102, 176],
    crackedRatio: 0.25,
    driftingRatio: 0.45,
    snowballCount: 2,
    birdCount: 3,
    crackDuration: 2.3,
    driftSpeed: 1.55,
    specialItems: true,
  },
  {
    stage: 13,
    chapter: 3,
    title: 'Màn 13: Con Đường Băng Nứt',
    description: 'Nhịp nhảy nhanh nhẹn qua chuỗi băng nứt kèm hộp quà quý!',
    voiceIntro: 'Màn 13! Nhảy thật dứt khoát qua con đường băng nứt nào!',
    floeCount: 13,
    widthRange: [86, 116],
    gapRange: [105, 180],
    crackedRatio: 0.45,
    driftingRatio: 0.28,
    snowballCount: 2,
    birdCount: 2,
    crackDuration: 2.2,
    driftSpeed: 1.55,
    specialItems: true,
  },
  {
    stage: 14,
    chapter: 3,
    title: 'Màn 14: Thử Thách Đỉnh Tuyết',
    description: 'Kết hợp đủ cầu tuyết, chim bay, băng trôi và băng nứt!',
    voiceIntro: 'Màn 14! Chỉ còn một bước nữa là tới đỉnh Vương Quốc Băng Giá rồi!',
    floeCount: 14,
    widthRange: [86, 118],
    gapRange: [108, 184],
    crackedRatio: 0.35,
    driftingRatio: 0.38,
    snowballCount: 3,
    birdCount: 3,
    crackDuration: 2.15,
    driftSpeed: 1.65,
    specialItems: true,
  },
  {
    stage: 15,
    chapter: 3,
    title: 'Màn 15: Đỉnh Băng Hoàng Gia',
    description: 'Chặng cuối cùng! Vượt qua mọi thử thách để mở Vương Miện Kho Báu!',
    voiceIntro: 'Màn 15 cuối cùng! Cố lên nào bé ơi, kho báu Vương Quốc Băng Giá đang chờ ở đích!',
    floeCount: 15,
    widthRange: [86, 118],
    gapRange: [108, 188],
    crackedRatio: 0.35,
    driftingRatio: 0.4,
    snowballCount: 3,
    birdCount: 3,
    crackDuration: 2.15,
    driftSpeed: 1.7,
    specialItems: true,
  },
];

const FISH_COLORS = ['#FF6B35', '#38BDF8', '#F472B6', '#FACC15', '#34D399'];

// Deterministic pseudo-random per stage so stage layout feels familiar when replayed
function seededRand(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function buildStageCourse(
  cfg: PenguinStageConfig,
  waterSurfaceY: number
): {
  floes: IceFloe[];
  collectibles: IceCollectible[];
  birds: SkyBird[];
} {
  const rand = seededRand(cfg.stage * 997 + 31);
  const floes: IceFloe[] = [];
  const collectibles: IceCollectible[] = [];
  const birds: SkyBird[] = [];

  let cursorX = 48;
  let itemCounter = 1;
  let snowballLeft = cfg.snowballCount;
  let birdLeft = cfg.birdCount;

  for (let i = 0; i < cfg.floeCount; i++) {
    const isStart = i === 0;
    const isGoal = i === cfg.floeCount - 1;

    const width = isStart
      ? 165
      : isGoal
      ? 185
      : Math.round(cfg.widthRange[0] + rand() * (cfg.widthRange[1] - cfg.widthRange[0]));

    let kind: FloeKind = 'solid';
    if (isGoal) {
      kind = 'goal';
    } else if (!isStart) {
      const roll = rand();
      if (roll < cfg.driftingRatio) {
        kind = 'drifting';
      } else if (roll < cfg.driftingRatio + cfg.crackedRatio) {
        kind = 'cracked';
      }
    }

    // Reserve wide solid platforms for rolling snowballs so the child can cleanly pass them
    const canHaveSnowball =
      !isStart &&
      !isGoal &&
      kind === 'solid' &&
      snowballLeft > 0 &&
      i >= 2 &&
      rand() < 0.45;
    const finalWidth = canHaveSnowball ? Math.max(width, 132) : width;
    if (canHaveSnowball) snowballLeft--;

    const driftAmp = kind === 'drifting' ? Math.round(20 + rand() * 12) : 0;
    const yOffset = isStart || isGoal ? 0 : Math.round((rand() - 0.5) * 20);
    const floeY = waterSurfaceY - 22 + yOffset;

    const floe: IceFloe = {
      id: i + 1,
      baseX: cursorX,
      x: cursorX,
      y: floeY,
      width: finalWidth,
      height: 36,
      kind,
      driftAmp,
      driftSpeed: cfg.driftSpeed * (0.85 + rand() * 0.35),
      driftPhase: rand() * Math.PI * 2,
      bobPhase: rand() * Math.PI * 2,
      cracking: false,
      crackElapsed: 0,
      crackDuration: cfg.crackDuration,
      sunk: false,
      landedOnce: isStart,
      hasSnowball: canHaveSnowball,
      snowballOffset: canHaveSnowball ? finalWidth * 0.5 : 0,
      snowballDir: rand() < 0.5 ? 1 : -1,
      snowballSpeed: 48 + cfg.chapter * 12,
    };
    floes.push(floe);

    // Spawn collectibles along the path & jump arcs (optional rewards)
    if (!isStart && !isGoal) {
      const centerX = cursorX + finalWidth * 0.5;
      if (cfg.specialItems && i === Math.floor(cfg.floeCount * 0.65)) {
        collectibles.push({
          id: itemCounter++,
          kind: cfg.stage === 15 ? 'pearl' : 'gift',
          x: centerX,
          y: floeY - 46,
          baseY: floeY - 46,
          color: '#F59E0B',
          phase: rand() * Math.PI * 2,
          collected: false,
        });
      } else if (rand() < 0.72) {
        const isStar = rand() < 0.38;
        collectibles.push({
          id: itemCounter++,
          kind: isStar ? 'star' : 'fish',
          x: centerX,
          y: floeY - (isStar ? 52 : 40),
          baseY: floeY - (isStar ? 52 : 40),
          color: FISH_COLORS[itemCounter % FISH_COLORS.length],
          phase: rand() * Math.PI * 2,
          collected: false,
        });
      }
    }

    // Advance cursorX by a strictly reachable gap
    if (!isGoal) {
      const gap = Math.round(cfg.gapRange[0] + rand() * (cfg.gapRange[1] - cfg.gapRange[0]));
      const midGapX = cursorX + finalWidth + gap * 0.5;

      // Occasionally place a reward star or fish in the middle of the jump arc
      if (rand() < 0.58) {
        const arcKind: CollectibleKind = rand() < 0.45 ? 'star' : 'fish';
        collectibles.push({
          id: itemCounter++,
          kind: arcKind,
          x: midGapX,
          y: floeY - 76 - Math.round(rand() * 24),
          baseY: floeY - 76 - Math.round(rand() * 24),
          color: FISH_COLORS[itemCounter % FISH_COLORS.length],
          phase: rand() * Math.PI * 2,
          collected: false,
        });
      }

      // Place flying birds safely high enough or oscillating above gaps
      if (birdLeft > 0 && i >= 2 && i < cfg.floeCount - 2 && rand() < 0.45) {
        birdLeft--;
        birds.push({
          id: birds.length + 1,
          baseX: midGapX,
          x: midGapX,
          baseY: floeY - 125,
          y: floeY - 125,
          ampY: 22,
          speed: 1.5 + cfg.chapter * 0.25,
          phase: rand() * Math.PI * 2,
          flyAmpX: 28,
          wingPhase: rand() * Math.PI * 2,
        });
      }

      cursorX += finalWidth + gap;
    }
  }

  return { floes, collectibles, birds };
}

export function appendEndlessChunk(
  existingFloes: IceFloe[],
  waterSurfaceY: number,
  nextFloeIdStart: number,
  nextItemIdStart: number,
  nextBirdIdStart: number
): {
  newFloes: IceFloe[];
  newCollectibles: IceCollectible[];
  newBirds: SkyBird[];
} {
  const newFloes: IceFloe[] = [];
  const newCollectibles: IceCollectible[] = [];
  const newBirds: SkyBird[] = [];

  const last = existingFloes[existingFloes.length - 1];
  let cursorX = last ? last.baseX + last.width + 95 : 48;
  let floeId = nextFloeIdStart;
  let itemId = nextItemIdStart;
  let birdId = nextBirdIdStart;

  const difficultyTier = Math.min(4, Math.floor((nextFloeIdStart - 1) / 8));
  const minW = Math.max(84, 118 - difficultyTier * 7);
  const maxW = Math.max(110, 142 - difficultyTier * 6);
  const minGap = 82 + difficultyTier * 7;
  const maxGap = 148 + difficultyTier * 10;

  for (let k = 0; k < 6; k++) {
    const width = Math.round(minW + Math.random() * (maxW - minW));
    const roll = Math.random();
    let kind: FloeKind = 'solid';
    if (roll < 0.25) kind = 'drifting';
    else if (roll < 0.48) kind = 'cracked';

    const hasSnowball = kind === 'solid' && difficultyTier >= 1 && Math.random() < 0.25;
    const finalWidth = hasSnowball ? Math.max(width, 132) : width;
    const driftAmp = kind === 'drifting' ? Math.round(20 + Math.random() * 12) : 0;
    const floeY = waterSurfaceY - 22 + Math.round((Math.random() - 0.5) * 20);

    newFloes.push({
      id: floeId++,
      baseX: cursorX,
      x: cursorX,
      y: floeY,
      width: finalWidth,
      height: 36,
      kind,
      driftAmp,
      driftSpeed: 1.15 + difficultyTier * 0.14,
      driftPhase: Math.random() * Math.PI * 2,
      bobPhase: Math.random() * Math.PI * 2,
      cracking: false,
      crackElapsed: 0,
      crackDuration: Math.max(2.15, 2.75 - difficultyTier * 0.15),
      sunk: false,
      landedOnce: false,
      hasSnowball,
      snowballOffset: hasSnowball ? finalWidth * 0.5 : 0,
      snowballDir: Math.random() < 0.5 ? 1 : -1,
      snowballSpeed: 54 + difficultyTier * 7,
    });

    if (Math.random() < 0.72) {
      const r = Math.random();
      const cKind: CollectibleKind = r < 0.12 ? 'gift' : r < 0.48 ? 'star' : 'fish';
      newCollectibles.push({
        id: itemId++,
        kind: cKind,
        x: cursorX + finalWidth * 0.5,
        y: floeY - 46,
        baseY: floeY - 46,
        color: FISH_COLORS[itemId % FISH_COLORS.length],
        phase: Math.random() * Math.PI * 2,
        collected: false,
      });
    }

    const gap = Math.round(minGap + Math.random() * (maxGap - minGap));
    const midX = cursorX + finalWidth + gap * 0.5;

    if (Math.random() < 0.55) {
      newCollectibles.push({
        id: itemId++,
        kind: Math.random() < 0.45 ? 'star' : 'fish',
        x: midX,
        y: floeY - 82,
        baseY: floeY - 82,
        color: FISH_COLORS[itemId % FISH_COLORS.length],
        phase: Math.random() * Math.PI * 2,
        collected: false,
      });
    }

    if (difficultyTier >= 1 && Math.random() < 0.28) {
      newBirds.push({
        id: birdId++,
        baseX: midX,
        x: midX,
        baseY: floeY - 128,
        y: floeY - 128,
        ampY: 22,
        speed: 1.7 + difficultyTier * 0.15,
        phase: Math.random() * Math.PI * 2,
        flyAmpX: 26,
        wingPhase: Math.random() * Math.PI * 2,
      });
    }

    cursorX += finalWidth + gap;
  }

  return { newFloes, newCollectibles, newBirds };
}

export function createDefaultPenguinProgress(): PenguinProgress {
  return {
    unlockedStage: 1,
    completedStages: [],
    stageStars: {},
    highScore: 0,
    totalFish: 0,
    totalStarsCollected: 0,
    earnedBadges: [],
    endlessUnlocked: false,
    endlessBestDistance: 0,
    endlessBestScore: 0,
    endlessBestFish: 0,
  };
}

export function normalizePenguinProgress(saved?: PenguinProgress): PenguinProgress {
  const base = createDefaultPenguinProgress();
  if (!saved) return base;

  const completedStages = Array.isArray(saved.completedStages)
    ? Array.from(new Set(saved.completedStages))
        .filter((n) => n >= 1 && n <= 15)
        .sort((a, b) => a - b)
    : [];

  const maxCompleted = completedStages.length > 0 ? completedStages[completedStages.length - 1] : 0;
  const unlockedStage = Math.min(15, Math.max(1, saved.unlockedStage ?? 1, maxCompleted + 1));

  const stageStars: Record<number, number> = { ...(saved.stageStars ?? {}) };
  for (const st of completedStages) {
    if (!stageStars[st]) stageStars[st] = 3;
  }

  const earnedBadges: PenguinMilestoneBadgeId[] = Array.isArray(saved.earnedBadges)
    ? [...saved.earnedBadges]
    : [];
  if (completedStages.length >= 5 && !earnedBadges.includes('bay-5')) earnedBadges.push('bay-5');
  if (completedStages.length >= 10 && !earnedBadges.includes('valley-10')) earnedBadges.push('valley-10');
  if (completedStages.length >= 15 && !earnedBadges.includes('kingdom-15')) earnedBadges.push('kingdom-15');

  return {
    unlockedStage,
    completedStages,
    stageStars,
    highScore: saved.highScore ?? 0,
    totalFish: saved.totalFish ?? 0,
    totalStarsCollected: saved.totalStarsCollected ?? 0,
    earnedBadges,
    endlessUnlocked: Boolean(saved.endlessUnlocked || completedStages.includes(15)),
    endlessBestDistance: saved.endlessBestDistance ?? 0,
    endlessBestScore: saved.endlessBestScore ?? 0,
    endlessBestFish: saved.endlessBestFish ?? 0,
  };
}

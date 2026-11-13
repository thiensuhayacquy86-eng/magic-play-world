import { BubbleLevelProgress, BubbleMilestoneBadgeId } from '../types/game';

export type BubbleKind = 'normal' | 'star' | 'diamond' | 'treasure';

export type ChapterId = 1 | 2 | 3;

export interface ChapterMeta {
  id: ChapterId;
  title: string;
  subtitle: string;
  speedLabel: string;
  themeGradient: string;
  accentHex: string;
  softBgHex: string;
  borderHex: string;
  badgeName: string;
  badgeThreshold: number;
}

export interface StageSpawnWeights {
  normal: number;
  star: number;
  diamond: number;
  treasure: number;
}

export interface StageRunStats {
  totalPops: number;
  normalPops: number;
  starPops: number;
  diamondPops: number;
  treasurePops: number;
  bigPops: number;
  smallPops: number;
  starsCollected: number;
  diamondsCollected: number;
  gemsCollected: number;
  chestsCollected: number;
  harvestedTotal: number;
  currentStreak: number;
  bestStreak: number;
}

export interface MissionMetric {
  label: string;
  current: number;
  target: number;
  done: boolean;
}

export interface BubbleStageConfig {
  stage: number;
  chapter: ChapterId;
  title: string;
  missionSummary: string;
  voicePrompt: string;
  suggestedSeconds: number;
  strictTimeWarning: boolean;
  maxBubbles: number;
  initialBubbles: number;
  spawnInterval: number;
  vyMin: number;
  vyMax: number;
  radii: [number, number, number];
  swayRange: [number, number];
  weights: StageSpawnWeights;
  maxSpecialOnScreen: number;
  maxTreasureOnScreen: number;
  isSurpriseTreasure?: boolean;
  isFinale?: boolean;
  getMetrics: (s: StageRunStats) => MissionMetric[];
  isCompleted: (s: StageRunStats) => boolean;
}

export interface BubbleMilestoneBadge {
  id: BubbleMilestoneBadgeId;
  title: string;
  description: string;
  requiredStages: number;
  icon: string;
  accentHex: string;
  bgClass: string;
}

export const BUBBLE_MILESTONE_BADGES: BubbleMilestoneBadge[] = [
  {
    id: 'companion-5',
    title: 'Huy hiệu Đồng Hành',
    description: 'Hoàn thành 5 màn Khu Vườn Bong Bóng',
    requiredStages: 5,
    icon: '🌼',
    accentHex: '#16A34A',
    bgClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  },
  {
    id: 'hunter-10',
    title: 'Huy hiệu Thợ Săn Kho Báu',
    description: 'Hoàn thành 10 màn tới Thung Lũng Pha Lê',
    requiredStages: 10,
    icon: '💎',
    accentHex: '#0284C7',
    bgClass: 'bg-sky-50 border-sky-200 text-sky-800',
  },
  {
    id: 'conqueror-15',
    title: 'Cúp Chinh Phục Kho Báu',
    description: 'Chinh phục trọn vẹn 15 màn Vương Quốc Kho Báu',
    requiredStages: 15,
    icon: '🏆',
    accentHex: '#D97706',
    bgClass: 'bg-amber-50 border-amber-200 text-amber-800',
  },
];

export const BUBBLE_CHAPTERS: ChapterMeta[] = [
  {
    id: 1,
    title: 'Chặng 1 – Khu Vườn Bong Bóng',
    subtitle: 'Màn 1–5 · Làm quen & rèn luyện thao tác chạm',
    speedLabel: 'Tốc độ: Chậm',
    themeGradient: 'from-emerald-400 via-teal-400 to-sky-400',
    accentHex: '#16A34A',
    softBgHex: '#ECFDF5',
    borderHex: '#86EFAC',
    badgeName: 'Huy hiệu Đồng Hành',
    badgeThreshold: 5,
  },
  {
    id: 2,
    title: 'Chặng 2 – Thung Lũng Pha Lê',
    subtitle: 'Màn 6–10 · Tăng phản xạ & quan sát tinh anh',
    speedLabel: 'Tốc độ: Vừa',
    themeGradient: 'from-sky-400 via-cyan-500 to-indigo-500',
    accentHex: '#0284C7',
    softBgHex: '#F0F9FF',
    borderHex: '#7DD3FC',
    badgeName: 'Huy hiệu Thợ Săn Kho Báu',
    badgeThreshold: 10,
  },
  {
    id: 3,
    title: 'Chặng 3 – Vương Quốc Kho Báu',
    subtitle: 'Màn 11–15 · Thử thách cao & mở rương báu vật',
    speedLabel: 'Tốc độ: Nhanh vừa',
    themeGradient: 'from-amber-400 via-orange-500 to-rose-500',
    accentHex: '#EA580C',
    softBgHex: '#FFF7ED',
    borderHex: '#FDBA74',
    badgeName: 'Cúp Chinh Phục Kho Báu',
    badgeThreshold: 15,
  },
];

export const BUBBLE_STAGES: BubbleStageConfig[] = [
  // CHẶNG 1 – KHU VƯỜN BONG BÓNG (MÀN 1–5)
  {
    stage: 1,
    chapter: 1,
    title: 'Màn 1: Khởi Động Khu Vườn',
    missionSummary: 'Đập 5 bong bóng bay chậm',
    voicePrompt: 'Màn 1! Bé hãy chạm đập 5 quả bong bóng lớn nhé!',
    suggestedSeconds: 45,
    strictTimeWarning: false,
    maxBubbles: 4,
    initialBubbles: 4,
    spawnInterval: 1.15,
    vyMin: 24,
    vyMax: 32,
    radii: [48, 56, 62],
    swayRange: [7, 13],
    weights: { normal: 0.72, star: 0.28, diamond: 0, treasure: 0 },
    maxSpecialOnScreen: 1,
    maxTreasureOnScreen: 0,
    getMetrics: (s) => [
      { label: 'Bong bóng', current: Math.min(s.totalPops, 5), target: 5, done: s.totalPops >= 5 },
    ],
    isCompleted: (s) => s.totalPops >= 5,
  },
  {
    stage: 2,
    chapter: 1,
    title: 'Màn 2: Mưa Sao Vàng',
    missionSummary: 'Thu hoạch 8 ngôi sao vàng',
    voicePrompt: 'Màn 2! Bé hãy đập bóng để thu hoạch 8 ngôi sao vàng vào kho báu nhé!',
    suggestedSeconds: 50,
    strictTimeWarning: false,
    maxBubbles: 4,
    initialBubbles: 4,
    spawnInterval: 1.05,
    vyMin: 26,
    vyMax: 35,
    radii: [46, 54, 60],
    swayRange: [8, 14],
    weights: { normal: 0.45, star: 0.55, diamond: 0, treasure: 0 },
    maxSpecialOnScreen: 2,
    maxTreasureOnScreen: 0,
    getMetrics: (s) => [
      {
        label: 'Ngôi sao',
        current: Math.min(s.starsCollected, 8),
        target: 8,
        done: s.starsCollected >= 8,
      },
    ],
    isCompleted: (s) => s.starsCollected >= 8,
  },
  {
    stage: 3,
    chapter: 1,
    title: 'Màn 3: Điệu Nhảy Bong Bóng',
    missionSummary: 'Đập 10 bong bóng nhiều màu sắc',
    voicePrompt: 'Màn 3! Cùng chạm thật vui để đập đủ 10 quả bong bóng sắc màu nhé!',
    suggestedSeconds: 50,
    strictTimeWarning: false,
    maxBubbles: 5,
    initialBubbles: 4,
    spawnInterval: 0.95,
    vyMin: 28,
    vyMax: 37,
    radii: [45, 52, 58],
    swayRange: [9, 16],
    weights: { normal: 0.65, star: 0.3, diamond: 0.05, treasure: 0 },
    maxSpecialOnScreen: 2,
    maxTreasureOnScreen: 0,
    getMetrics: (s) => [
      {
        label: 'Bong bóng',
        current: Math.min(s.totalPops, 10),
        target: 10,
        done: s.totalPops >= 10,
      },
    ],
    isCompleted: (s) => s.totalPops >= 10,
  },
  {
    stage: 4,
    chapter: 1,
    title: 'Màn 4: Săn Kim Cương Xanh',
    missionSummary: 'Thu hoạch 2 viên kim cương xanh',
    voicePrompt: 'Màn 4! Bé hãy tìm những quả bóng kim cương lấp lánh để thu 2 viên kim cương nhé!',
    suggestedSeconds: 55,
    strictTimeWarning: false,
    maxBubbles: 5,
    initialBubbles: 4,
    spawnInterval: 0.92,
    vyMin: 30,
    vyMax: 38,
    radii: [44, 52, 58],
    swayRange: [9, 16],
    weights: { normal: 0.42, star: 0.2, diamond: 0.38, treasure: 0 },
    maxSpecialOnScreen: 2,
    maxTreasureOnScreen: 0,
    getMetrics: (s) => [
      {
        label: 'Kim cương',
        current: Math.min(s.diamondsCollected, 2),
        target: 2,
        done: s.diamondsCollected >= 2,
      },
    ],
    isCompleted: (s) => s.diamondsCollected >= 2,
  },
  {
    stage: 5,
    chapter: 1,
    title: 'Màn 5: Về Đích Khu Vườn',
    missionSummary: 'Đập 8 bóng & thu 6 ngôi sao trong 55 giây',
    voicePrompt: 'Màn 5! Hoàn thành đập 8 bong bóng và thu 6 ngôi sao để nhận huy hiệu Đồng Hành nhé!',
    suggestedSeconds: 55,
    strictTimeWarning: true,
    maxBubbles: 5,
    initialBubbles: 5,
    spawnInterval: 0.88,
    vyMin: 31,
    vyMax: 40,
    radii: [43, 50, 58],
    swayRange: [10, 17],
    weights: { normal: 0.45, star: 0.42, diamond: 0.08, treasure: 0.05 },
    maxSpecialOnScreen: 2,
    maxTreasureOnScreen: 1,
    getMetrics: (s) => [
      { label: 'Bong bóng', current: Math.min(s.totalPops, 8), target: 8, done: s.totalPops >= 8 },
      {
        label: 'Ngôi sao',
        current: Math.min(s.starsCollected, 6),
        target: 6,
        done: s.starsCollected >= 6,
      },
    ],
    isCompleted: (s) => s.totalPops >= 8 && s.starsCollected >= 6,
  },

  // CHẶNG 2 – THUNG LŨNG PHA LÊ (MÀN 6–10)
  {
    stage: 6,
    chapter: 2,
    title: 'Màn 6: Bóng Lớn & Bóng Nhỏ',
    missionSummary: 'Đập 5 bong bóng lớn và 5 bong bóng nhỏ',
    voicePrompt: 'Chào mừng tới Thung Lũng Pha Lê! Màn 6, bé hãy đập 5 bóng lớn và 5 bóng nhỏ nhé!',
    suggestedSeconds: 55,
    strictTimeWarning: false,
    maxBubbles: 6,
    initialBubbles: 5,
    spawnInterval: 0.78,
    vyMin: 42,
    vyMax: 55,
    radii: [31, 44, 58],
    swayRange: [11, 19],
    weights: { normal: 0.62, star: 0.28, diamond: 0.1, treasure: 0 },
    maxSpecialOnScreen: 2,
    maxTreasureOnScreen: 0,
    getMetrics: (s) => [
      { label: 'Bóng lớn', current: Math.min(s.bigPops, 5), target: 5, done: s.bigPops >= 5 },
      { label: 'Bóng nhỏ', current: Math.min(s.smallPops, 5), target: 5, done: s.smallPops >= 5 },
    ],
    isCompleted: (s) => s.bigPops >= 5 && s.smallPops >= 5,
  },
  {
    stage: 7,
    chapter: 2,
    title: 'Màn 7: Thung Lũng Ngàn Sao',
    missionSummary: 'Thu hoạch 12 ngôi sao vàng',
    voicePrompt: 'Màn 7! Nhanh tay chạm các quả bóng ngôi sao để gom 12 ngôi sao vàng nhé!',
    suggestedSeconds: 55,
    strictTimeWarning: false,
    maxBubbles: 6,
    initialBubbles: 5,
    spawnInterval: 0.74,
    vyMin: 44,
    vyMax: 58,
    radii: [34, 45, 55],
    swayRange: [12, 20],
    weights: { normal: 0.35, star: 0.55, diamond: 0.1, treasure: 0 },
    maxSpecialOnScreen: 3,
    maxTreasureOnScreen: 0,
    getMetrics: (s) => [
      {
        label: 'Ngôi sao',
        current: Math.min(s.starsCollected, 12),
        target: 12,
        done: s.starsCollected >= 12,
      },
    ],
    isCompleted: (s) => s.starsCollected >= 12,
  },
  {
    stage: 8,
    chapter: 2,
    title: 'Màn 8: Truy Tìm Bóng Kho Báu',
    missionSummary: 'Tìm và đập 3 bong bóng chứa rương kho báu',
    voicePrompt: 'Màn 8! Quan sát thật kỹ để tìm và đập 3 quả bóng chứa kho báu vàng nhé!',
    suggestedSeconds: 60,
    strictTimeWarning: false,
    maxBubbles: 6,
    initialBubbles: 5,
    spawnInterval: 0.72,
    vyMin: 46,
    vyMax: 60,
    radii: [35, 45, 54],
    swayRange: [12, 21],
    weights: { normal: 0.45, star: 0.2, diamond: 0.08, treasure: 0.27 },
    maxSpecialOnScreen: 2,
    maxTreasureOnScreen: 1,
    getMetrics: (s) => [
      {
        label: 'Bóng kho báu',
        current: Math.min(s.treasurePops, 3),
        target: 3,
        done: s.treasurePops >= 3,
      },
    ],
    isCompleted: (s) => s.treasurePops >= 3,
  },
  {
    stage: 9,
    chapter: 2,
    title: 'Màn 9: Pha Lê Kép Lung Linh',
    missionSummary: 'Thu hoạch 10 ngôi sao và 3 viên kim cương',
    voicePrompt: 'Màn 9! Hãy thu thập đủ 10 ngôi sao và 3 viên kim cương xanh nhé!',
    suggestedSeconds: 60,
    strictTimeWarning: false,
    maxBubbles: 7,
    initialBubbles: 6,
    spawnInterval: 0.68,
    vyMin: 48,
    vyMax: 62,
    radii: [34, 44, 54],
    swayRange: [13, 21],
    weights: { normal: 0.3, star: 0.4, diamond: 0.26, treasure: 0.04 },
    maxSpecialOnScreen: 3,
    maxTreasureOnScreen: 1,
    getMetrics: (s) => [
      {
        label: 'Ngôi sao',
        current: Math.min(s.starsCollected, 10),
        target: 10,
        done: s.starsCollected >= 10,
      },
      {
        label: 'Kim cương',
        current: Math.min(s.diamondsCollected, 3),
        target: 3,
        done: s.diamondsCollected >= 3,
      },
    ],
    isCompleted: (s) => s.starsCollected >= 10 && s.diamondsCollected >= 3,
  },
  {
    stage: 10,
    chapter: 2,
    title: 'Màn 10: Nhịp Đập Liên Hoàn',
    missionSummary: 'Đạt chuỗi 6 lần đập liên tiếp & thu 12 phần thưởng',
    voicePrompt: 'Màn 10! Đập bóng đều tay để tạo chuỗi 6 lần liên tiếp và thu 12 phần thưởng nhé!',
    suggestedSeconds: 60,
    strictTimeWarning: false,
    maxBubbles: 7,
    initialBubbles: 6,
    spawnInterval: 0.64,
    vyMin: 50,
    vyMax: 64,
    radii: [34, 44, 53],
    swayRange: [13, 22],
    weights: { normal: 0.44, star: 0.32, diamond: 0.16, treasure: 0.08 },
    maxSpecialOnScreen: 3,
    maxTreasureOnScreen: 1,
    getMetrics: (s) => [
      {
        label: 'Chuỗi liên tiếp',
        current: Math.min(s.bestStreak, 6),
        target: 6,
        done: s.bestStreak >= 6,
      },
      {
        label: 'Phần thưởng',
        current: Math.min(s.harvestedTotal, 12),
        target: 12,
        done: s.harvestedTotal >= 12,
      },
    ],
    isCompleted: (s) => s.bestStreak >= 6 && s.harvestedTotal >= 12,
  },

  // CHẶNG 3 – VƯƠNG QUỐC KHO BÁU (MÀN 11–15)
  {
    stage: 11,
    chapter: 3,
    title: 'Màn 11: Cơn Lốc Sắc Màu',
    missionSummary: 'Đập 16 bong bóng ở tốc độ Vương Quốc',
    voicePrompt: 'Chào mừng đến Vương Quốc Kho Báu! Màn 11, hãy đập đủ 16 quả bong bóng nhé!',
    suggestedSeconds: 55,
    strictTimeWarning: false,
    maxBubbles: 8,
    initialBubbles: 6,
    spawnInterval: 0.56,
    vyMin: 58,
    vyMax: 74,
    radii: [32, 41, 50],
    swayRange: [14, 22],
    weights: { normal: 0.55, star: 0.28, diamond: 0.12, treasure: 0.05 },
    maxSpecialOnScreen: 3,
    maxTreasureOnScreen: 1,
    getMetrics: (s) => [
      {
        label: 'Bong bóng',
        current: Math.min(s.totalPops, 16),
        target: 16,
        done: s.totalPops >= 16,
      },
    ],
    isCompleted: (s) => s.totalPops >= 16,
  },
  {
    stage: 12,
    chapter: 3,
    title: 'Màn 12: Kho Tàng Sao & Kim Cương',
    missionSummary: 'Thu hoạch 15 ngôi sao và 4 viên kim cương',
    voicePrompt: 'Màn 12! Thu hoạch thật nhiều với 15 ngôi sao vàng và 4 viên kim cương nhé!',
    suggestedSeconds: 60,
    strictTimeWarning: false,
    maxBubbles: 8,
    initialBubbles: 7,
    spawnInterval: 0.54,
    vyMin: 60,
    vyMax: 76,
    radii: [32, 41, 50],
    swayRange: [14, 23],
    weights: { normal: 0.25, star: 0.42, diamond: 0.27, treasure: 0.06 },
    maxSpecialOnScreen: 3,
    maxTreasureOnScreen: 1,
    getMetrics: (s) => [
      {
        label: 'Ngôi sao',
        current: Math.min(s.starsCollected, 15),
        target: 15,
        done: s.starsCollected >= 15,
      },
      {
        label: 'Kim cương',
        current: Math.min(s.diamondsCollected, 4),
        target: 4,
        done: s.diamondsCollected >= 4,
      },
    ],
    isCompleted: (s) => s.starsCollected >= 15 && s.diamondsCollected >= 4,
  },
  {
    stage: 13,
    chapter: 3,
    title: 'Màn 13: Bóng Kho Báu Bất Ngờ',
    missionSummary: 'Săn 4 bong bóng kho báu xuất hiện bất ngờ',
    voicePrompt: 'Màn 13! Hãy chú ý các quả bóng kho báu xuất hiện bất ngờ ở nhiều vị trí và chạm thật nhanh nhé!',
    suggestedSeconds: 60,
    strictTimeWarning: false,
    maxBubbles: 8,
    initialBubbles: 7,
    spawnInterval: 0.52,
    vyMin: 62,
    vyMax: 78,
    radii: [32, 40, 49],
    swayRange: [15, 24],
    weights: { normal: 0.45, star: 0.2, diamond: 0.1, treasure: 0.25 },
    maxSpecialOnScreen: 3,
    maxTreasureOnScreen: 1,
    isSurpriseTreasure: true,
    getMetrics: (s) => [
      {
        label: 'Bóng kho báu',
        current: Math.min(s.treasurePops, 4),
        target: 4,
        done: s.treasurePops >= 4,
      },
    ],
    isCompleted: (s) => s.treasurePops >= 4,
  },
  {
    stage: 14,
    chapter: 3,
    title: 'Màn 14: Thử Thách Bốn Sắc Bóng',
    missionSummary: 'Đập 6 bóng thường, 4 bóng sao, 2 bóng kim cương & 2 bóng kho báu',
    voicePrompt: 'Màn 14! Bé hãy đập đủ cả 4 loại bóng: bóng thường, bóng sao, bóng kim cương và bóng kho báu nhé!',
    suggestedSeconds: 60,
    strictTimeWarning: false,
    maxBubbles: 9,
    initialBubbles: 7,
    spawnInterval: 0.5,
    vyMin: 64,
    vyMax: 80,
    radii: [31, 40, 49],
    swayRange: [15, 24],
    weights: { normal: 0.36, star: 0.28, diamond: 0.2, treasure: 0.16 },
    maxSpecialOnScreen: 3,
    maxTreasureOnScreen: 1,
    getMetrics: (s) => [
      { label: 'Thường', current: Math.min(s.normalPops, 6), target: 6, done: s.normalPops >= 6 },
      { label: 'Sao', current: Math.min(s.starPops, 4), target: 4, done: s.starPops >= 4 },
      { label: 'Kim cương', current: Math.min(s.diamondPops, 2), target: 2, done: s.diamondPops >= 2 },
      { label: 'Kho báu', current: Math.min(s.treasurePops, 2), target: 2, done: s.treasurePops >= 2 },
    ],
    isCompleted: (s) =>
      s.normalPops >= 6 && s.starPops >= 4 && s.diamondPops >= 2 && s.treasurePops >= 2,
  },
  {
    stage: 15,
    chapter: 3,
    title: 'Màn 15: Chinh Phục Rương Kho Báu',
    missionSummary: 'Thu 14 sao, 4 kim cương & đập 3 bóng kho báu để mở Rương Lớn',
    voicePrompt: 'Màn cuối cùng! Săn kho báu lớn để mở Rương Phần Thưởng Đặc Biệt và nhận Cúp Chinh Phục nhé!',
    suggestedSeconds: 60,
    strictTimeWarning: false,
    maxBubbles: 9,
    initialBubbles: 7,
    spawnInterval: 0.48,
    vyMin: 64,
    vyMax: 82,
    radii: [32, 41, 50],
    swayRange: [15, 24],
    weights: { normal: 0.26, star: 0.36, diamond: 0.22, treasure: 0.16 },
    maxSpecialOnScreen: 3,
    maxTreasureOnScreen: 1,
    isSurpriseTreasure: true,
    isFinale: true,
    getMetrics: (s) => [
      {
        label: 'Ngôi sao',
        current: Math.min(s.starsCollected, 14),
        target: 14,
        done: s.starsCollected >= 14,
      },
      {
        label: 'Kim cương',
        current: Math.min(s.diamondsCollected, 4),
        target: 4,
        done: s.diamondsCollected >= 4,
      },
      {
        label: 'Bóng kho báu',
        current: Math.min(s.treasurePops, 3),
        target: 3,
        done: s.treasurePops >= 3,
      },
    ],
    isCompleted: (s) =>
      s.starsCollected >= 14 && s.diamondsCollected >= 4 && s.treasurePops >= 3,
  },
];

export interface EndlessWaveConfig {
  wave: number;
  popsNeededForNextWave: number;
  maxBubbles: number;
  spawnInterval: number;
  vyMin: number;
  vyMax: number;
  radii: [number, number, number];
  swayRange: [number, number];
  weights: StageSpawnWeights;
  maxSpecialOnScreen: number;
  maxTreasureOnScreen: number;
}

export function getEndlessWaveConfig(wave: number): EndlessWaveConfig {
  const w = Math.max(1, wave);
  // Gradual speed & density ramp capped comfortably for ages 3–6
  const speedBonus = Math.min(28, (w - 1) * 4.5);
  return {
    wave: w,
    popsNeededForNextWave: 12 + Math.min(10, (w - 1) * 2),
    maxBubbles: Math.min(10, 6 + Math.floor((w - 1) / 2)),
    spawnInterval: Math.max(0.42, 0.72 - (w - 1) * 0.045),
    vyMin: 44 + speedBonus,
    vyMax: 60 + speedBonus + 8,
    radii: [32, 42, 52],
    swayRange: [12, 22],
    weights: {
      normal: 0.46,
      star: 0.28,
      diamond: 0.16,
      treasure: 0.1,
    },
    maxSpecialOnScreen: 3,
    maxTreasureOnScreen: 1,
  };
}

export function createDefaultBubbleProgress(): BubbleLevelProgress {
  return {
    unlockedLevel: 1,
    completedLevels: [],
    bestStars: 0,
    bestDiamonds: 0,
    unlockedStage: 1,
    completedStages: [],
    stageStars: {},
    totalStars: 0,
    totalDiamonds: 0,
    totalPops: 0,
    earnedBubbleBadges: [],
    endlessUnlocked: false,
    endlessBestWave: 0,
    endlessBestStars: 0,
    endlessBestDiamonds: 0,
    endlessBestPops: 0,
  };
}

export function normalizeBubbleProgress(saved?: BubbleLevelProgress): Required<BubbleLevelProgress> {
  const base = createDefaultBubbleProgress();
  if (!saved) return base as Required<BubbleLevelProgress>;

  const completedStages = Array.isArray(saved.completedStages)
    ? Array.from(new Set(saved.completedStages)).filter((n) => n >= 1 && n <= 15).sort((a, b) => a - b)
    : [];

  const maxCompleted = completedStages.length > 0 ? completedStages[completedStages.length - 1] : 0;
  const unlockedStage = Math.min(
    15,
    Math.max(1, saved.unlockedStage ?? 1, maxCompleted + 1)
  );

  const stageStars: Record<number, number> = { ...(saved.stageStars ?? {}) };
  for (const st of completedStages) {
    if (!stageStars[st]) stageStars[st] = 3;
  }

  const earnedBubbleBadges: BubbleMilestoneBadgeId[] = Array.isArray(saved.earnedBubbleBadges)
    ? [...saved.earnedBubbleBadges]
    : [];
  if (completedStages.length >= 5 && !earnedBubbleBadges.includes('companion-5')) {
    earnedBubbleBadges.push('companion-5');
  }
  if (completedStages.length >= 10 && !earnedBubbleBadges.includes('hunter-10')) {
    earnedBubbleBadges.push('hunter-10');
  }
  if (completedStages.length >= 15 && !earnedBubbleBadges.includes('conqueror-15')) {
    earnedBubbleBadges.push('conqueror-15');
  }

  const endlessUnlocked = Boolean(saved.endlessUnlocked || completedStages.includes(15));

  return {
    unlockedLevel: saved.unlockedLevel ?? 1,
    completedLevels: saved.completedLevels ?? [],
    bestStars: saved.bestStars ?? 0,
    bestDiamonds: saved.bestDiamonds ?? 0,
    unlockedStage,
    completedStages,
    stageStars,
    totalStars: saved.totalStars ?? saved.bestStars ?? 0,
    totalDiamonds: saved.totalDiamonds ?? saved.bestDiamonds ?? 0,
    totalPops: saved.totalPops ?? 0,
    earnedBubbleBadges,
    endlessUnlocked,
    endlessBestWave: saved.endlessBestWave ?? 0,
    endlessBestStars: saved.endlessBestStars ?? 0,
    endlessBestDiamonds: saved.endlessBestDiamonds ?? 0,
    endlessBestPops: saved.endlessBestPops ?? 0,
  };
}

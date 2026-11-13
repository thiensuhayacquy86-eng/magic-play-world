export type AgeGroup = '3-4' | '4-5' | '5-6';

export type WorldId =
  | 'fun-island'
  | 'magic-forest'
  | 'mystery-ocean'
  | 'cloud-kingdom'
  | 'playful-land'
  | 'creative-workshop';

export type CompanionId = 'rabbit' | 'bear' | 'fox' | 'kitten';

export type ScreenId =
  | 'home'
  | 'world'
  | 'play'
  | 'victory'
  | 'rewards'
  | 'characters'
  | 'profile'
  | 'teacher';

export interface CompanionData {
  id: CompanionId;
  name: string;
  species: string;
  title: string;
  personality: string;
  image: string;
  accentColor: string;
  surfaceTint: string;
  unlockStars: number;
  voiceGreeting: string;
  voiceCheer: string;
}

export interface WorldData {
  id: WorldId;
  order: number;
  name: string;
  shortDesc: string;
  image: string;
  accentHex: string;
  softBgHex: string;
  companionId: CompanionId;
  welcomeSpeech: string;
}

export type GameCategoryTag = 'new' | 'featured' | 'classic';

export type ParkZoneId = 'orchard' | 'forest' | 'ocean-rainbow' | 'music-creative';

export interface GameData {
  id: string;
  worldId: WorldId;
  title: string;
  shortCue: string;
  voiceInstruction: string;
  emojiIcon: string;
  accentColor: string;
  starReward: number;
  category: GameCategoryTag;
  image?: string;
  enabled?: boolean;
  zoneId?: ParkZoneId;
  zoneLabel?: string;
}

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  conditionType: 'stars' | 'plays' | 'worlds' | 'chest';
  threshold: number;
}

export interface PlayLogEntry {
  gameId: string;
  worldId: WorldId;
  starsEarned: number;
  playedAt: string;
}

export type BubbleLevelId = 1 | 2 | 3;

export type BubbleMilestoneBadgeId = 'companion-5' | 'hunter-10' | 'conqueror-15';

export interface BubbleLevelProgress {
  // Legacy 3-level fields preserved as optional for safe migration
  unlockedLevel?: BubbleLevelId;
  completedLevels?: BubbleLevelId[];
  bestStars: number;
  bestDiamonds: number;
  // 15-stage journey fields
  unlockedStage?: number;
  completedStages?: number[];
  stageStars?: Record<number, number>;
  totalStars?: number;
  totalDiamonds?: number;
  totalPops?: number;
  earnedBubbleBadges?: BubbleMilestoneBadgeId[];
  // Endless free-play mode fields
  endlessUnlocked?: boolean;
  endlessBestWave?: number;
  endlessBestStars?: number;
  endlessBestDiamonds?: number;
  endlessBestPops?: number;
}

export type PenguinMilestoneBadgeId = 'bay-5' | 'valley-10' | 'kingdom-15';

export interface PenguinProgress {
  unlockedStage: number;
  completedStages: number[];
  stageStars: Record<number, number>;
  highScore: number;
  totalFish: number;
  totalStarsCollected: number;
  earnedBadges: PenguinMilestoneBadgeId[];
  endlessUnlocked: boolean;
  endlessBestDistance: number;
  endlessBestScore: number;
  endlessBestFish: number;
}

export interface ChildProfile {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  avatarCompanionId: CompanionId;
  stars: number;
  totalPlays: number;
  favoriteGameIds: string[];
  recentGameIds: string[];
  unlockedCompanionIds: CompanionId[];
  unlockedBadgeIds: string[];
  chestsOpened: number;
  lastChestStars: number;
  playedWorldIds: WorldId[];
  playHistory: PlayLogEntry[];
  bubbleProgress?: BubbleLevelProgress;
  penguinProgress?: PenguinProgress;
  createdAt: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  voiceEnabled: boolean;
  musicGentle: boolean;
}

export interface AppState {
  profiles: ChildProfile[];
  activeProfileId: string;
  settings: AppSettings;
}

export interface GameResult {
  gameId: string;
  worldId: WorldId;
  starsEarned: number;
  newlyUnlockedBadges: BadgeData[];
  newlyUnlockedCompanions: CompanionData[];
}

import { BADGES, COMPANIONS, DEFAULT_PROFILES } from '../data/worldData';
import {
  AgeGroup,
  AppSettings,
  AppState,
  BadgeData,
  ChildProfile,
  CompanionData,
  CompanionId,
  GameResult,
  WorldId,
} from '../types/game';

const STORAGE_KEY = 'magic_play_world_state_v1';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  voiceEnabled: true,
  musicGentle: true,
};

export function loadAppState(): AppState {
  if (typeof window === 'undefined') {
    return {
      profiles: DEFAULT_PROFILES,
      activeProfileId: DEFAULT_PROFILES[0].id,
      settings: DEFAULT_SETTINGS,
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: AppState = {
        profiles: DEFAULT_PROFILES,
        activeProfileId: DEFAULT_PROFILES[0].id,
        settings: DEFAULT_SETTINGS,
      };
      saveAppState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const profiles =
      Array.isArray(parsed.profiles) && parsed.profiles.length > 0
        ? parsed.profiles
        : DEFAULT_PROFILES;
    const activeProfileId =
      parsed.activeProfileId && profiles.some((p) => p.id === parsed.activeProfileId)
        ? parsed.activeProfileId
        : profiles[0].id;
    const settings: AppSettings = {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings ?? {}),
    };
    return { profiles, activeProfileId, settings };
  } catch {
    return {
      profiles: DEFAULT_PROFILES,
      activeProfileId: DEFAULT_PROFILES[0].id,
      settings: DEFAULT_SETTINGS,
    };
  }
}

export function saveAppState(state: AppState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors cleanly
  }
}

export function evaluateUnlocks(profile: ChildProfile): {
  updatedProfile: ChildProfile;
  newBadges: BadgeData[];
  newCompanions: CompanionData[];
} {
  const newBadges: BadgeData[] = [];
  const newCompanions: CompanionData[] = [];

  const unlockedBadgeIds = new Set(profile.unlockedBadgeIds);
  for (const badge of BADGES) {
    if (unlockedBadgeIds.has(badge.id)) continue;
    let met = false;
    if (badge.conditionType === 'stars') met = profile.stars >= badge.threshold;
    if (badge.conditionType === 'plays') met = profile.totalPlays >= badge.threshold;
    if (badge.conditionType === 'worlds') met = profile.playedWorldIds.length >= badge.threshold;
    if (badge.conditionType === 'chest') met = profile.chestsOpened >= badge.threshold;
    if (met) {
      unlockedBadgeIds.add(badge.id);
      newBadges.push(badge);
    }
  }

  const unlockedCompanionIds = new Set<CompanionId>(profile.unlockedCompanionIds);
  for (const comp of COMPANIONS) {
    if (!unlockedCompanionIds.has(comp.id) && profile.stars >= comp.unlockStars) {
      unlockedCompanionIds.add(comp.id);
      newCompanions.push(comp);
    }
  }

  return {
    updatedProfile: {
      ...profile,
      unlockedBadgeIds: Array.from(unlockedBadgeIds),
      unlockedCompanionIds: Array.from(unlockedCompanionIds),
    },
    newBadges,
    newCompanions,
  };
}

export function recordGameCompletion(
  state: AppState,
  gameId: string,
  worldId: WorldId,
  starsEarned: number
): { nextState: AppState; result: GameResult } {
  const safeStars = Math.max(1, starsEarned);
  const current =
    state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0];

  const recentGameIds = [
    gameId,
    ...current.recentGameIds.filter((id) => id !== gameId),
  ].slice(0, 6);

  const playedWorldIds = current.playedWorldIds.includes(worldId)
    ? current.playedWorldIds
    : [...current.playedWorldIds, worldId];

  const incremented: ChildProfile = {
    ...current,
    stars: current.stars + safeStars,
    totalPlays: current.totalPlays + 1,
    recentGameIds,
    playedWorldIds,
    playHistory: [
      {
        gameId,
        worldId,
        starsEarned: safeStars,
        playedAt: new Date().toISOString(),
      },
      ...current.playHistory,
    ].slice(0, 40),
  };

  const { updatedProfile, newBadges, newCompanions } = evaluateUnlocks(incremented);

  const nextState: AppState = {
    ...state,
    profiles: state.profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)),
  };
  saveAppState(nextState);

  return {
    nextState,
    result: {
      gameId,
      worldId,
      starsEarned: safeStars,
      newlyUnlockedBadges: newBadges,
      newlyUnlockedCompanions: newCompanions,
    },
  };
}

export function createChildProfile(
  name: string,
  ageGroup: AgeGroup,
  avatarCompanionId: CompanionId = 'rabbit'
): ChildProfile {
  return {
    id: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim() || 'Bé Yêu',
    ageGroup,
    avatarCompanionId,
    stars: 3,
    totalPlays: 0,
    favoriteGameIds: ['bubble-pop'],
    recentGameIds: [],
    unlockedCompanionIds: ['rabbit', 'bear'],
    unlockedBadgeIds: ['first-star'],
    chestsOpened: 0,
    lastChestStars: 0,
    playedWorldIds: [],
    playHistory: [],
    createdAt: new Date().toISOString(),
  };
}

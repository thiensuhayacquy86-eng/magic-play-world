import { BadgeData, ChildProfile, CompanionData, GameData, ParkZoneId, WorldData } from '../types/game';

export const TREASURE_CHEST_IMAGE = '/src/assets/images/reward_treasure_chest_1794529248365.jpg';
export const MAGIC_PLAY_ISLAND_HERO = '/src/assets/images/magic_play_island_hero_1794541107879.jpg';

export interface ParkZoneInfo {
  id: ParkZoneId;
  name: string;
  shortDesc: string;
  accentColor: string;
  surfaceTint: string;
  emoji: string;
}

export const PARK_ZONES: ParkZoneInfo[] = [
  {
    id: 'orchard',
    name: 'Khu Vườn Trái Cây & Vịnh Băng',
    shortDesc: 'Hứng trái cây kỳ diệu, đập bóng săn kho báu và chim cánh cụt vượt băng',
    accentColor: '#EA580C',
    surfaceTint: '#FFF7ED',
    emoji: '🍎',
  },
];

export const COMPANIONS: CompanionData[] = [
  {
    id: 'rabbit',
    name: 'Thỏ Trắng Bông',
    species: 'Thỏ trắng thông minh',
    title: 'Nhà thám hiểm nhanh trí',
    personality: 'Vui vẻ, thích khám phá và luôn cổ vũ bé từng bước nhỏ.',
    image: '/src/assets/images/char_white_rabbit_1794529247963.jpg',
    accentColor: '#0EA5E9',
    surfaceTint: '#E0F2FE',
    unlockStars: 0,
    voiceGreeting: 'Xin chào bé yêu! Chào mừng bé đến Đảo Vui Nhộn cùng Thỏ Trắng Bông nhé!',
    voiceCheer: 'Hoan hô! Bé giỏi quá đi mất!',
  },
  {
    id: 'bear',
    name: 'Gấu Nâu Mật Ong',
    species: 'Gấu nâu vui vẻ',
    title: 'Người bạn ấm áp',
    personality: 'Hiền lành, thích hái trái cây và chia sẻ niềm vui cùng bé.',
    image: '/src/assets/images/char_brown_bear_1794529247664.jpg',
    accentColor: '#D97706',
    surfaceTint: '#FEF3C7',
    unlockStars: 0,
    voiceGreeting: 'Chào bé nhé! Gấu Nâu đang đợi bé ở Đảo Vui Nhộn nè!',
    voiceCheer: 'Tuyệt vời lắm bé ơi! Gấu Nâu vỗ tay khen bé nè!',
  },
  {
    id: 'fox',
    name: 'Cáo Cam Lém Lỉnh',
    species: 'Cáo cam tinh nghịch',
    title: 'Bạn nhỏ tinh anh',
    personality: 'Lanh lợi, giỏi tìm kho báu và cực kỳ thích các trò tinh nghịch.',
    image: '/src/assets/images/char_orange_fox_1794529248165.jpg',
    accentColor: '#EA580C',
    surfaceTint: '#FFEDD5',
    unlockStars: 12,
    voiceGreeting: 'Hì hì! Cáo Cam đã sẵn sàng rồi! Mình khám phá Đảo Vui Nhộn nào!',
    voiceCheer: 'Woa! Bé nhanh mắt và khéo tay thật đấy!',
  },
  {
    id: 'kitten',
    name: 'Mèo Con Miu Miu',
    species: 'Mèo con đáng yêu',
    title: 'Họa sĩ dịu dàng',
    personality: 'Ngọt ngào, thích âm nhạc, sắc màu và những quả bóng rực rỡ.',
    image: '/src/assets/images/char_cute_kitten_1794529247859.jpg',
    accentColor: '#E11D48',
    surfaceTint: '#FFE4E6',
    unlockStars: 24,
    voiceGreeting: 'Meo meo! Miu Miu rất vui được gặp bé tại Đảo Vui Nhộn!',
    voiceCheer: 'Dễ thương quá! Bé làm đẹp tuyệt vời luôn!',
  },
];

export const WORLDS: WorldData[] = [
  {
    id: 'fun-island',
    order: 1,
    name: 'Đảo Vui Nhộn',
    shortDesc: 'Công viên phiêu lưu 3D dành cho bé 3–6 tuổi',
    image: MAGIC_PLAY_ISLAND_HERO,
    accentHex: '#0284C7',
    softBgHex: '#E0F2FE',
    companionId: 'rabbit',
    welcomeSpeech: 'Chào mừng bé đến Đảo Vui Nhộn! Chọn một trò chơi thật vui nhé!',
  },
];

// 3 trò chơi chủ lực thuộc Đảo Vui Nhộn – Magic Play Island
export const GAMES: GameData[] = [
  {
    id: 'fruit-catch',
    worldId: 'fun-island',
    title: 'Giỏ Quà Kỳ Diệu – Magic Fruit Catch',
    shortCue: 'Hứng trái cây 3D cùng 5 chế độ vui nhộn',
    voiceInstruction: 'Chào mừng bé đến với Giỏ Quà Kỳ Diệu!',
    emojiIcon: '🧺',
    accentColor: '#EA580C',
    starReward: 3,
    category: 'featured',
    image: '/src/assets/images/game_card_fruit_basket_1794541108759.jpg',
    enabled: true,
    zoneId: 'orchard',
    zoneLabel: 'Khu Vườn Trái Cây',
  },
  {
    id: 'bubble-pop',
    worldId: 'fun-island',
    title: 'Đập Bóng – Săn Kho Báu',
    shortCue: 'Đập bong bóng xà phòng 3D thu hoạch sao, kim cương và kho báu',
    voiceInstruction:
      'Bé hãy chạm vào những quả bong bóng xà phòng óng ánh để thu hoạch sao vàng, kim cương và rương kho báu nhé!',
    emojiIcon: '🫧',
    accentColor: '#0284C7',
    starReward: 3,
    category: 'featured',
    image: '/src/assets/images/world_fun_island_1794529244724.jpg',
    enabled: true,
    zoneId: 'orchard',
    zoneLabel: 'Khu Vườn Trái Cây',
  },
  {
    id: 'penguin-ice',
    worldId: 'fun-island',
    title: 'Chim Cánh Cụt Vượt Băng',
    shortCue: 'Nhảy qua các tảng băng nổi, thu thập cá và sao vàng cùng chú chim cánh cụt',
    voiceInstruction:
      'Chào mừng bé đến với Chim Cánh Cụt Vượt Băng! Chạm hoặc nhấn giữ để nhảy qua những tảng băng nhé!',
    emojiIcon: '🐧',
    accentColor: '#0284C7',
    starReward: 3,
    category: 'new',
    image: '/src/assets/images/game_card_penguin_ice_1794565785056.jpg',
    enabled: true,
    zoneId: 'orchard',
    zoneLabel: 'Vịnh Băng Kỳ Thú',
  },
];

export const ACTIVE_GAMES: GameData[] = GAMES.filter((g) => g.enabled !== false);

export const BADGES: BadgeData[] = [
  {
    id: 'first-star',
    name: 'Ngôi Sao Đầu Tiên',
    description: 'Nhận những ngôi sao đầu tiên khi chơi game',
    icon: '🌟',
    color: '#F59E0B',
    conditionType: 'stars',
    threshold: 3,
  },
  {
    id: 'star-collector-15',
    name: 'Thợ Săn Sao Nhí',
    description: 'Tích lũy được 15 ngôi sao lấp lánh',
    icon: '✨',
    color: '#EA580C',
    conditionType: 'stars',
    threshold: 15,
  },
  {
    id: 'star-master-30',
    name: 'Vua Sao Kỳ Thú',
    description: 'Tích lũy được 30 ngôi sao rực rỡ',
    icon: '👑',
    color: '#D97706',
    conditionType: 'stars',
    threshold: 30,
  },
  {
    id: 'playful-explorer',
    name: 'Bé Chăm Chơi',
    description: 'Hoàn thành 5 lượt chơi vui nhộn',
    icon: '🎈',
    color: '#0EA5E9',
    conditionType: 'plays',
    threshold: 5,
  },
  {
    id: 'chest-opener',
    name: 'Người Mở Kho Báu',
    description: 'Mở chiếc rương quà bí mật đầu tiên',
    icon: '🎁',
    color: '#E11D48',
    conditionType: 'chest',
    threshold: 1,
  },
  {
    id: 'super-kid-50',
    name: 'Siêu Nhí Tài Năng',
    description: 'Thu thập đủ 50 ngôi sao kỳ diệu',
    icon: '🏆',
    color: '#0D9488',
    conditionType: 'stars',
    threshold: 50,
  },
];

export const DEFAULT_PROFILES: ChildProfile[] = [
  {
    id: 'profile-na',
    name: 'Bé Na',
    ageGroup: '4-5',
    avatarCompanionId: 'rabbit',
    stars: 14,
    totalPlays: 5,
    favoriteGameIds: ['fruit-catch', 'bubble-pop', 'penguin-ice'],
    recentGameIds: ['fruit-catch', 'bubble-pop', 'penguin-ice'],
    unlockedCompanionIds: ['rabbit', 'bear', 'fox'],
    unlockedBadgeIds: ['first-star', 'playful-explorer'],
    chestsOpened: 0,
    lastChestStars: 0,
    playedWorldIds: ['fun-island'],
    playHistory: [
      {
        gameId: 'fruit-catch',
        worldId: 'fun-island',
        starsEarned: 3,
        playedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        gameId: 'bubble-pop',
        worldId: 'fun-island',
        starsEarned: 3,
        playedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        gameId: 'penguin-ice',
        worldId: 'fun-island',
        starsEarned: 3,
        playedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'profile-bin',
    name: 'Bé Bin',
    ageGroup: '3-4',
    avatarCompanionId: 'bear',
    stars: 6,
    totalPlays: 2,
    favoriteGameIds: ['fruit-catch', 'bubble-pop'],
    recentGameIds: ['fruit-catch', 'penguin-ice'],
    unlockedCompanionIds: ['rabbit', 'bear'],
    unlockedBadgeIds: ['first-star'],
    chestsOpened: 0,
    lastChestStars: 0,
    playedWorldIds: ['fun-island'],
    playHistory: [
      {
        gameId: 'fruit-catch',
        worldId: 'fun-island',
        starsEarned: 3,
        playedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        gameId: 'penguin-ice',
        worldId: 'fun-island',
        starsEarned: 3,
        playedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

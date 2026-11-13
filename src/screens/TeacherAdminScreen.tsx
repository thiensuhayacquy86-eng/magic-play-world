import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit3,
  Plus,
  RotateCcw,
  Trash2,
  UserPlus,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BADGES, COMPANIONS, GAMES } from '../data/worldData';
import { AgeGroup, AppSettings, ChildProfile } from '../types/game';

interface TeacherAdminScreenProps {
  profiles: ChildProfile[];
  activeProfileId: string;
  settings: AppSettings;
  onAddProfile: (name: string, ageGroup: AgeGroup) => void;
  onUpdateProfile: (profileId: string, name: string, ageGroup: AgeGroup) => void;
  onResetProfileData: (profileId: string) => void;
  onDeleteProfile: (profileId: string) => void;
  onUpdateSettings: (next: AppSettings) => void;
  onBack: () => void;
}

export const TeacherAdminScreen: React.FC<TeacherAdminScreenProps> = ({
  profiles,
  activeProfileId,
  settings,
  onAddProfile,
  onUpdateProfile,
  onResetProfileData,
  onDeleteProfile,
  onUpdateSettings,
  onBack,
}) => {
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState<AgeGroup>('4-5');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState<AgeGroup>('4-5');

  const [confirmAction, setConfirmAction] = useState<{
    type: 'reset' | 'delete';
    profile: ChildProfile;
  } | null>(null);

  const totalStarsAll = profiles.reduce((acc, p) => acc + p.stars, 0);
  const totalPlaysAll = profiles.reduce((acc, p) => acc + p.totalPlays, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddProfile(newName.trim(), newAge);
    setNewName('');
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-display font-bold text-base cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Thoát góc quản trị
        </button>
      </div>

      <div>
        <h1 className="font-display font-extrabold text-3xl text-slate-900">
          Góc Quản Trị Giáo Viên & Phụ Huynh
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Quản lý hồ sơ các bé, theo dõi tiến trình chơi và điều chỉnh cài đặt âm thanh.
        </p>
      </div>

      {/* Overview Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 tabular-nums">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500">Tổng số hồ sơ bé</p>
          <p className="font-display font-extrabold text-3xl text-slate-900 mt-1">
            {profiles.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500">Tổng lượt chơi đã thực hiện</p>
          <p className="font-display font-extrabold text-3xl text-sky-600 mt-1">
            {totalPlaysAll}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500">Tổng số sao các bé đạt được</p>
          <p className="font-display font-extrabold text-3xl text-amber-600 mt-1">
            {totalStarsAll}
          </p>
        </div>
      </section>

      {/* Add Player Form & Sound Controls */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleAddSubmit}
          className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 space-y-4"
        >
          <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-sky-600" />
            Thêm Hồ Sơ Bé Mới
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nhập tên bé (ví dụ: Bé Sóc)..."
              className="sm:col-span-6 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <select
              value={newAge}
              onChange={(e) => setNewAge(e.target.value as AgeGroup)}
              className="sm:col-span-3 px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="3-4">3–4 tuổi</option>
              <option value="4-5">4–5 tuổi</option>
              <option value="5-6">5–6 tuổi</option>
            </select>
            <button
              type="submit"
              className="sm:col-span-3 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm bé
            </button>
          </div>
        </form>

        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-display font-bold text-xl text-slate-900">
            Cài Đặt Âm Thanh & Giọng Nói
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-2.5">
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-sky-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                )}
                <span className="text-sm font-semibold text-slate-800">
                  Hiệu ứng âm thanh trò chơi
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, soundEnabled: e.target.checked })
                }
                className="w-5 h-5 accent-sky-600"
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-800">
                  Giọng đọc hướng dẫn tiếng Việt
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.voiceEnabled}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, voiceEnabled: e.target.checked })
                }
                className="w-5 h-5 accent-emerald-600"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Detailed Player Statistics Table */}
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-display font-bold text-xl text-slate-900">
            Bảng Thống Kê Tiến Trình Từng Bé
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200">
                <th className="py-3.5 px-5">Tên bé</th>
                <th className="py-3.5 px-4">Độ tuổi</th>
                <th className="py-3.5 px-4">Số sao</th>
                <th className="py-3.5 px-4">Lượt chơi</th>
                <th className="py-3.5 px-4">Huy hiệu & Rương quà</th>
                <th className="py-3.5 px-4">Trò chơi đã tham gia</th>
                <th className="py-3.5 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {profiles.map((p) => {
                const isEditing = editingId === p.id;
                const playedGames = Array.from(
                  new Set(p.playHistory.map((h) => h.gameId))
                )
                  .map((gid) => GAMES.find((g) => g.id === gid)?.title)
                  .filter(Boolean);
                const companion =
                  COMPANIONS.find((c) => c.id === p.avatarCompanionId)?.name ?? '';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-4 px-5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm w-36"
                        />
                      ) : (
                        <div>
                          <div className="font-bold text-slate-900">
                            {p.name}{' '}
                            {p.id === activeProfileId && (
                              <span className="text-xs font-semibold text-sky-600">
                                (Đang chơi)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{companion}</div>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={editAge}
                          onChange={(e) => setEditAge(e.target.value as AgeGroup)}
                          className="px-2 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                        >
                          <option value="3-4">3–4</option>
                          <option value="4-5">4–5</option>
                          <option value="5-6">5–6</option>
                        </select>
                      ) : (
                        <span>{p.ageGroup} tuổi</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-bold text-amber-600 tabular-nums whitespace-nowrap">
                      {p.stars} ⭐
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                      {p.totalPlays} lượt
                    </td>

                    <td className="py-4 px-4 text-slate-600 tabular-nums whitespace-nowrap">
                      {p.unlockedBadgeIds.length}/{BADGES.length} huy hiệu ·{' '}
                      {p.chestsOpened} rương quà
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600 max-w-xs">
                      {playedGames.length > 0
                        ? playedGames.slice(0, 4).join(', ')
                        : 'Chưa có lượt chơi mới'}
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateProfile(p.id, editName, editAge);
                              setEditingId(null);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            title="Sửa tên & độ tuổi"
                            onClick={() => {
                              setEditingId(p.id);
                              setEditName(p.name);
                              setEditAge(p.ageGroup);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Đặt lại tiến trình"
                            onClick={() => setConfirmAction({ type: 'reset', profile: p })}
                            className="p-2 rounded-lg hover:bg-amber-100 text-amber-700 cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          {profiles.length > 1 && (
                            <button
                              type="button"
                              title="Xóa hồ sơ"
                              onClick={() => setConfirmAction({ type: 'delete', profile: p })}
                              className="p-2 rounded-lg hover:bg-rose-100 text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Confirmation Modal for Reset / Delete */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-display font-bold text-xl text-slate-900">
              {confirmAction.type === 'reset'
                ? `Đặt lại dữ liệu của ${confirmAction.profile.name}?`
                : `Xóa hồ sơ của ${confirmAction.profile.name}?`}
            </h3>
            <p className="text-sm text-slate-600">
              {confirmAction.type === 'reset'
                ? 'Số sao, lượt chơi và huy hiệu của bé sẽ quay về trạng thái ban đầu.'
                : 'Hồ sơ và toàn bộ lịch sử chơi của bé này sẽ bị xóa vĩnh viễn.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmAction.type === 'reset') {
                    onResetProfileData(confirmAction.profile.id);
                  } else {
                    onDeleteProfile(confirmAction.profile.id);
                  }
                  setConfirmAction(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

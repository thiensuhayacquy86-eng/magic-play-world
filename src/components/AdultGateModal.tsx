import React, { useMemo, useState } from 'react';
import { Lock, X } from 'lucide-react';

interface AdultGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdultGateModal: React.FC<AdultGateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const challenge = useMemo(() => {
    const a = 3 + Math.floor(Math.random() * 5);
    const b = 2 + Math.floor(Math.random() * 5);
    return { a, b, answer: a + b };
  }, [isOpen]);

  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(input.trim()) === challenge.answer) {
      setInput('');
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adult-gate-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 id="adult-gate-title" className="font-display font-bold text-xl text-slate-900">
                Khu vực dành cho người lớn
              </h2>
              <p className="text-xs text-slate-500">Xác nhận nhanh để vào Góc quản trị giáo viên</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-sm text-slate-600 mb-2">
              Vui lòng nhập kết quả phép tính sau:
            </p>
            <div className="font-display font-extrabold text-3xl text-slate-900 tabular-nums">
              {challenge.a} + {challenge.b} = ?
            </div>
          </div>

          <input
            type="number"
            inputMode="numeric"
            autoFocus
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="Nhập đáp án..."
            className="w-full px-4 py-3 text-center text-lg font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          {error && (
            <p className="text-sm text-rose-600 text-center font-medium">
              Kết quả chưa đúng, vui lòng thử lại nhé.
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm cursor-pointer"
            >
              Quay lại
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm cursor-pointer"
            >
              Xác nhận mở
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

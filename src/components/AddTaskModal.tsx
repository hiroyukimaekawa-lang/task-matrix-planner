import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { Task } from '../types';
import { calculateUrgency } from '../utils';

type FormData = {
  title: string;
  dueDate: string;
  dueTime: string;
  importance: number;
};

const defaultForm: FormData = { title: '', dueDate: '', dueTime: '', importance: 3 };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
}

export default function AddTaskModal({ isOpen, onClose, onAdd }: Props) {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // バリデーション：タイトルが未入力の場合
    if (!form.title.trim()) {
      setError('タスク名を入力してください。');
      return;
    }
    // バリデーション：期日が未選択の場合
    if (!form.dueDate) {
      setError('期日を選択してください。');
      return;
    }

    onAdd({
      title: form.title.trim(),
      dueDate: form.dueDate,
      dueTime: form.dueTime || undefined,
      importance: form.importance as Task['importance'],
      urgency: calculateUrgency(form.dueDate, form.importance) as Task['urgency'],
    });

    setForm(defaultForm);
    setError('');
    onClose();
  };

  const handleClose = () => {
    setForm(defaultForm);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* バックドロップ */}
      <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={handleClose} />

      {/* モーダル本体 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* モーダルヘッダー */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">新しいタスクを作成</h2>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              aria-label="閉じる"
            >
              <X size={20} />
            </button>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* タスク名 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                タスク名
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="例：Q2予算レビューを完了させる"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                autoFocus
              />
            </div>

            {/* 期日と時間 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  期日
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  時間 (任意)
                </label>
                <select
                  value={form.dueTime}
                  onChange={(e) => setForm((f) => ({ ...f, dueTime: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">設定なし</option>
                  {Array.from({ length: 48 }).map((_, i) => {
                    const h = Math.floor(i / 2);
                    const m = i % 2 === 0 ? '00' : '30';
                    const time = `${String(h).padStart(2, '0')}:${m}`;
                    return (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* 重要度スライダー */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700">重要度</label>
                <span className="text-sm font-semibold text-slate-600">{form.importance}/5</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, importance: i }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      i <= form.importance
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* 緊急度（自動算出） */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">緊急度</label>
                <span className="text-sm font-semibold text-amber-600">
                  {form.dueDate ? `${calculateUrgency(form.dueDate, form.importance)}/5` : '期日選択後に自動計算'}
                </span>
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
                期日と重要度に基づいて自動的に算出されます。
                {form.dueDate && (
                  <span className="block mt-1.5 font-semibold text-slate-700">
                    現在の算出結果: {calculateUrgency(form.dueDate, form.importance) >= 4 ? '🔴 高い緊急度' : calculateUrgency(form.dueDate, form.importance) >= 3 ? '🟡 中程度の緊急度' : '🟢 低い緊急度'}
                  </span>
                )}
              </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
              >
                タスクを作成
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg text-sm transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

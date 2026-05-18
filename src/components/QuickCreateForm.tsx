import { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import type { Task } from '../types';
import { calculateUrgency } from '../utils';

type FormData = {
  title: string;
  dueDate: string;
  importance: number;
};

const defaultForm: FormData = { title: '', dueDate: '', importance: 2 };

interface Props {
  onAdd: (data: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
}

// クイックタスク作成フォーム（インライン展開型）
export default function QuickCreateForm({ onAdd }: Props) {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // バリデーション：タイトルと期日の必須チェック
    if (!form.title.trim()) {
      setError('タスク名を入力してください。');
      return;
    }
    if (!form.dueDate) {
      setError('期日を選択してください。');
      return;
    }

    onAdd({
      title: form.title.trim(),
      dueDate: form.dueDate,
      importance: form.importance as Task['importance'],
      urgency: calculateUrgency(form.dueDate, form.importance) as Task['urgency'],
    });

    setForm(defaultForm);
    setError('');
    setExpanded(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* 折りたたみ状態：ボタン表示 */}
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full px-6 py-4 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 font-medium text-sm transition-colors"
        >
          <Plus size={18} />
          新しいタスクを追加
        </button>
      ) : (
        /* 展開状態：入力フォーム */
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* タスク名 */}
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="タスク名を入力"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            autoFocus
          />

          {/* 期日 */}
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />

          {/* 重要度 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-600">重要度</label>
              <span className="text-sm font-semibold text-slate-700">{form.importance}/4</span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, importance: i }))}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${
                    i <= form.importance ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* 緊急度（自動算出） */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>緊急度</span>
              <span className="font-semibold text-amber-600">
                {form.dueDate ? `${calculateUrgency(form.dueDate, form.importance)}/4` : '期日選択後に自動計算'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">期日と重要度に基づき自動決定されます</p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {/* 送信・キャンセルボタン */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              追加する
            </button>
            <button
              type="button"
              onClick={() => { setExpanded(false); setError(''); }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

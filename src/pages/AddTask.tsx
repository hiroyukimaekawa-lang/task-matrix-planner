import { useState } from 'react';
import { useTaskStore } from '../store';
import type { Task } from '../types';

type FormData = {
  title: string;
  dueDate: string;
  importance: number;
  urgency: number;
};

const defaultForm: FormData = { title: '', dueDate: '', importance: 3, urgency: 3 };

// 重要度・緊急度の評価入力コンポーネント
function RatingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} <span className="text-slate-400 font-normal">（{value}/5）</span>
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-colors ${
              i <= value
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-300 text-slate-500 hover:border-blue-400'
            }`}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}

interface Props {
  onSuccess: () => void;
}

export default function AddTask({ onSuccess }: Props) {
  const addTask = useTaskStore((s) => s.addTask);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // バリデーション
    if (!form.title.trim()) { setError('タスク名を入力してください。'); return; }
    if (!form.dueDate) { setError('期日を選択してください。'); return; }

    addTask({
      title: form.title.trim(),
      dueDate: form.dueDate,
      importance: form.importance as Task['importance'],
      urgency: form.urgency as Task['urgency'],
    });

    setForm(defaultForm);
    setError('');
    onSuccess();
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">タスクを追加</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* タスク名入力 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">タスク名</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="例：プロジェクト提案書を作成する"
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* 期日入力 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">期日</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* 重要度・緊急度 */}
        <RatingInput
          label="重要度"
          value={form.importance}
          onChange={(v) => setForm((f) => ({ ...f, importance: v }))}
        />

        <RatingInput
          label="緊急度"
          value={form.urgency}
          onChange={(v) => setForm((f) => ({ ...f, urgency: v }))}
        />

        {/* エラーメッセージ */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* 送信ボタン */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
        >
          タスクを追加する
        </button>
      </form>
    </div>
  );
}

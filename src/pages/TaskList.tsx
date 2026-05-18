import { useState } from 'react';
import { CheckCircle2, Trash2, Circle } from 'lucide-react';
import { useTaskStore } from '../store';
import {
  calculatePriorityScore,
  calculateDaysUntilDue,
  isOverdue,
  filterTasks,
  sortTasks,
  type SortBy,
} from '../utils';

// 重要度・緊急度を点で視覚表現するコンポーネント
function ScoreDots({ value, color }: { value: number; color: string }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${i <= value ? color : 'bg-slate-200'}`}
        />
      ))}
    </span>
  );
}

// フィルタラベルの日本語マッピング
const filterLabels: Record<'all' | 'today' | 'overdue', string> = {
  all: 'すべて',
  today: '本日',
  overdue: '期限切れ',
};

export default function TaskList() {
  const tasks = useTaskStore((s) => s.tasks);
  const completeTask = useTaskStore((s) => s.completeTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const [filter, setFilter] = useState<'all' | 'today' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('due-date');

  const filtered = filterTasks(tasks, filter);
  const sorted = sortTasks(filtered, sortBy);

  // タスクが空の場合の空状態表示
  if (sorted.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-6">タスク一覧</h2>
        <p className="text-slate-400 text-sm">
          {filter === 'today' ? '本日期限のタスクはありません。' :
           filter === 'overdue' ? '期限切れのタスクはありません。' :
           'タスクがまだありません。'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-6">タスク一覧</h2>

      {/* フィルター・ソートコントロール */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {(['all', 'today', 'overdue'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-slate-600">並び替え：</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-1.5 rounded-lg text-sm border border-slate-300 bg-white text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="due-date">期日順</option>
            <option value="priority-score">優先度スコア順</option>
          </select>
        </div>
      </div>

      {/* タスクテーブル */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left pb-3 pr-4 font-medium text-slate-500">タスク名</th>
              <th className="text-left pb-3 pr-4 font-medium text-slate-500">期日</th>
              <th className="text-left pb-3 pr-4 font-medium text-slate-500">残り日数</th>
              <th className="text-left pb-3 pr-4 font-medium text-slate-500">重要度</th>
              <th className="text-left pb-3 pr-4 font-medium text-slate-500">緊急度</th>
              <th className="text-left pb-3 pr-4 font-medium text-slate-500">優先度</th>
              <th className="text-left pb-3 pr-4 font-medium text-slate-500">状態</th>
              <th className="pb-3 font-medium text-slate-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((task) => {
              const overdue = isOverdue(task);
              const daysUntilDue = calculateDaysUntilDue(task.dueDate);
              const priority = calculatePriorityScore(task);

              return (
                <tr
                  key={task.id}
                  className={`group hover:bg-slate-50 transition-colors ${overdue ? 'bg-red-25' : ''}`}
                >
                  <td
                    className={`py-3 pr-4 font-medium ${
                      task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {task.title}
                  </td>
                  <td className={`py-3 pr-4 ${overdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                    {task.dueDate}
                  </td>
                  <td
                    className={`py-3 pr-4 ${
                      daysUntilDue < 0
                        ? 'text-red-600 font-medium'
                        : daysUntilDue === 0
                          ? 'text-amber-600 font-medium'
                          : 'text-slate-600'
                    }`}
                  >
                    {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}日超過` : `残り${daysUntilDue}日`}
                  </td>
                  <td className="py-3 pr-4">
                    <ScoreDots value={task.importance} color="bg-blue-500" />
                  </td>
                  <td className="py-3 pr-4">
                    <ScoreDots value={task.urgency} color="bg-amber-400" />
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        priority >= 8.0
                          ? 'bg-red-100 text-red-700'
                          : priority >= 5.0
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {priority.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {task.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={11} /> 完了
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        <Circle size={11} /> 未完了
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {task.status === 'todo' && (
                        <button
                          onClick={() => completeTask(task.id)}
                          title="完了にする"
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        title="削除する"
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

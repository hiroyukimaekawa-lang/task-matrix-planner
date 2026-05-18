import { CheckCircle2, Trash2 } from 'lucide-react';
import type { Task } from '../types';
import { calculatePriorityScore, calculateDaysUntilDue, isOverdue } from '../utils';

// 重要度・緊急度を小さな点で視覚表現するコンポーネント
function ScoreDots({ value, color }: { value: number; color: string }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= value ? color : 'bg-slate-200'}`} />
      ))}
    </span>
  );
}

interface Props {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskListBelow({ tasks, onSelectTask, onComplete, onDelete }: Props) {
  const todoTasks = tasks
    .filter((t) => t.status === 'todo')
    .sort((a, b) => {
      const scoreA = calculatePriorityScore(a);
      const scoreB = calculatePriorityScore(b);
      // 1. 優先度スコアが高いタスク（重要度が高く・期日が今日に近い＝右上）を最優先（降順）
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      // 2. スコアが同じ場合は重要度が高いものを優先（降順）
      if (b.importance !== a.importance) {
        return b.importance - a.importance;
      }
      // 3. 重要度も同じなら期日が近い（早い）ものを優先（昇順）
      return a.dueDate.localeCompare(b.dueDate);
    });
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  // タスクがまだ何もない場合の空状態表示
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-sm">タスクがまだありません。最初のタスクを追加してみましょう。</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 未完了タスク一覧 */}
      {todoTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">未完了のタスク</h3>
          <div className="space-y-2">
            {todoTasks.map((task) => {
              const priority = calculatePriorityScore(task);
              const daysUntilDue = calculateDaysUntilDue(task.dueDate);
              const overdue = isOverdue(task);

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    overdue
                      ? 'bg-red-50 border border-red-200 hover:border-red-300'
                      : priority >= 4
                        ? 'bg-amber-50 border border-amber-200 hover:border-amber-300'
                        : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* タスク番号バッジ */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                      overdue
                        ? 'bg-red-500'
                        : priority >= 7
                          ? 'bg-red-600'
                          : priority >= 4
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                    }`}
                  >
                    {String(todoTasks.indexOf(task) + 1).padStart(2, '0')}
                  </div>

                  {/* タスク情報 */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${overdue ? 'text-red-900' : 'text-slate-800'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                      <span className={overdue ? 'text-red-600 font-medium' : ''}>{task.dueDate}</span>
                      {daysUntilDue < 0 && (
                        <span className="text-red-600 font-medium">{Math.abs(daysUntilDue)}日超過</span>
                      )}
                    </div>
                  </div>

                  {/* 重要度・緊急度・スコア（PC以上で表示） */}
                  <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <ScoreDots value={task.importance} color="bg-blue-500" />
                    </div>
                    <div className="flex items-center gap-1">
                      <ScoreDots value={task.urgency} color="bg-amber-500" />
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        priority >= 7
                          ? 'bg-red-100 text-red-700'
                          : priority >= 4
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {priority}/8
                    </div>
                  </div>

                  {/* アクションボタン（ホバー時に表示） */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {task.status === 'todo' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                        title="完了にする"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="削除する"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 完了済みタスク一覧 */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            完了済み（{completedTasks.length}件）
          </h3>
          <div className="space-y-2 opacity-60">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 group cursor-pointer hover:bg-slate-100 transition-all"
              >
                <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                <p className="text-sm font-medium text-slate-500 line-through flex-1">{task.title}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="削除する"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { X, CheckCircle2, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import type { Task } from '../types';
import { calculatePriorityScore, calculateDaysUntilDue, isOverdue } from '../utils';

// 重要度・緊急度を点で視覚化するコンポーネント
function ScoreDots({ value, color }: { value: number; color: string }) {
  return (
    <span className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`w-2 h-2 rounded-full ${i <= value ? color : 'bg-slate-200'}`} />
      ))}
    </span>
  );
}

interface Props {
  task: Task | null;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskDetailPanel({ task, onClose, onComplete, onDelete }: Props) {
  if (!task) return null;

  const priority = calculatePriorityScore(task);
  const daysUntilDue = calculateDaysUntilDue(task.dueDate);
  const isTaskOverdue = isOverdue(task);

  // 優先度スコアから日本語ラベルを返す
  const getPriorityLabel = (score: number) => {
    if (score >= 8.0) return '重大';
    if (score >= 5.0) return '高';
    return '通常';
  };

  // 優先度スコアに応じた背景色クラスを返す
  const getPriorityColor = (score: number) => {
    if (score >= 8.0) return 'text-red-600 bg-red-50';
    if (score >= 5.0) return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 shadow-lg overflow-y-auto flex flex-col">
      {/* パネルヘッダー */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between">
        <h2 className="text-lg font-semibold text-slate-800 flex-1">{task.title}</h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          aria-label="閉じる"
        >
          <X size={18} />
        </button>
      </div>

      {/* 詳細コンテンツ */}
      <div className="flex-1 px-6 py-6 space-y-6">
        {/* ステータス */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">ステータス</p>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
              task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {task.status === 'completed' ? (
              <>
                <CheckCircle2 size={14} /> 完了
              </>
            ) : (
              <>未完了</>
            )}
          </span>
        </div>

        {/* 優先度スコア */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">優先度</p>
          <div className={`px-3 py-2 rounded-lg ${getPriorityColor(priority)}`}>
            <p className="text-sm font-semibold">{getPriorityLabel(priority)}</p>
            <p className="text-xs opacity-75">スコア：{priority.toFixed(1)}</p>
          </div>
        </div>

        {/* 期日 */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">期日</p>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Calendar size={16} className={isTaskOverdue ? 'text-red-500' : 'text-slate-400'} />
            <span className={isTaskOverdue ? 'text-red-600 font-medium' : ''}>{task.dueDate}</span>
          </div>
          {daysUntilDue < 0 ? (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertTriangle size={12} /> {Math.abs(daysUntilDue)} 日超過しています
            </p>
          ) : daysUntilDue === 0 ? (
            <p className="text-xs text-amber-600 mt-1">本日が期日です</p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">残り {daysUntilDue} 日</p>
          )}
        </div>

        {/* 重要度・緊急度 */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">重要度</p>
            <ScoreDots value={task.importance} color="bg-blue-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">緊急度</p>
            <ScoreDots value={task.urgency} color="bg-amber-500" />
          </div>
        </div>

        {/* 作成日 */}
        <div className="text-xs text-slate-500 space-y-1">
          <p>作成日：{new Date(task.createdAt).toLocaleDateString('ja-JP')}</p>
        </div>
      </div>

      {/* アクションボタン（固定フッター） */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 space-y-2">
        {task.status === 'todo' && (
          <button
            onClick={() => {
              onComplete(task.id);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            <CheckCircle2 size={16} /> 完了にする
          </button>
        )}
        <button
          onClick={() => {
            onDelete(task.id);
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          <Trash2 size={16} /> タスクを削除
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { X, CheckCircle2, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import type { Task } from '../types';
import { calculatePriorityScore, calculateDaysUntilDue, isOverdue } from '../utils';
import {
  initGoogleClient,
  requestAccessToken,
  syncTaskToGoogleCalendar,
} from '../utils/googleCalendar';

// 重要度・緊急度を点で視覚化するコンポーネント
function ScoreDots({ value, color }: { value: number; color: string }) {
  return (
    <span className="flex gap-1">
      {[1, 2, 3, 4].map((i) => (
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
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export default function TaskDetailPanel({
  task,
  onClose,
  onComplete,
  onDelete,
  onUpdate,
}: Props) {
  if (!task) return null;

  const priority = calculatePriorityScore(task);
  const daysUntilDue = calculateDaysUntilDue(task.dueDate);
  const isTaskOverdue = isOverdue(task);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // OAuthの初期設定
  useEffect(() => {
    initGoogleClient((token) => {
      setAccessToken(token);
      localStorage.setItem('google_access_token', token);
      triggerSync(token);
    });

    const savedToken = localStorage.getItem('google_access_token');
    if (savedToken) {
      setAccessToken(savedToken);
    }
  }, [task.id]);

  const triggerSync = async (token: string) => {
    setIsSyncing(true);
    try {
      const eventId = await syncTaskToGoogleCalendar(token, task);
      setIsSyncing(false);
      if (eventId) {
        onUpdate(task.id, { googleEventId: eventId });
        alert('Googleカレンダーに同期しました！');
      } else {
        alert('カレンダーの同期に失敗しました。再ログインをお試しください。');
      }
    } catch (err: any) {
      setIsSyncing(false);
      const errMsg = err.message || '';
      console.error('Detailed Sync Error:', err);
      
      if (errMsg.includes('API has not been used') || errMsg.includes('disabled')) {
        alert('Google Cloud Consoleで「Google Calendar API」が有効化されていません。\nGoogle Cloud ConsoleのAPIライブラリより「Google Calendar API」を有効化（Enable）に設定してください。');
      } else if (errMsg.includes('insufficient') || errMsg.includes('Permission') || errMsg.includes('auth')) {
        alert('Googleカレンダーのアクセス権限（スコープ）が不足しています。\n一度ログアウトし、再度ログインする際に表示される追加のアクセス許可画面で、「Google カレンダーのすべての予定の表示、編集、共有、完全な削除」のチェックボックスを【必ずONにチェック】して進めてください。');
      } else {
        alert(`カレンダー同期エラーが発生しました:\n${errMsg}`);
      }
    }
  };

  const handleGoogleSync = () => {
    if (!accessToken) {
      requestAccessToken();
    } else {
      triggerSync(accessToken);
    }
  };

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

        {/* 総合優先度 */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">総合優先度</p>
          <div className={`px-3 py-2 rounded-lg ${getPriorityColor(priority)}`}>
            <p className="text-sm font-semibold">{getPriorityLabel(priority)}</p>
            <p className="text-xs opacity-75">優先スコア：{priority.toFixed(1)}</p>
          </div>
        </div>

        {/* 期日・時間（編集可能） */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">期日の設定</p>
            <div className="flex items-center gap-2">
              <Calendar size={16} className={isTaskOverdue ? 'text-red-500' : 'text-slate-400'} />
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) => {
                  if (e.target.value) {
                    onUpdate(task.id, { dueDate: e.target.value });
                  }
                }}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-full"
              />
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

          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">時間の設定</p>
            <select
              value={task.dueTime || ''}
              onChange={(e) => {
                onUpdate(task.id, { dueTime: e.target.value || undefined });
              }}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-full"
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

        {/* メモの設定 */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">メモ (任意)</p>
          <textarea
            value={task.memo || ''}
            onChange={(e) => {
              onUpdate(task.id, { memo: e.target.value || undefined });
            }}
            placeholder="タスクの詳細やリンクなどを入力してください"
            rows={3}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-full resize-none"
          />
        </div>

        {/* Googleカレンダー連携 */}
        <div className="pt-2 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-500 mb-2">カレンダー同期</p>
          <button
            onClick={handleGoogleSync}
            disabled={isSyncing}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
              task.googleEventId
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
            }`}
          >
            <span className="text-base">📅</span>
            {isSyncing
              ? '同期中...'
              : task.googleEventId
                ? 'Googleカレンダーを更新'
                : 'Googleカレンダーに追加'}
          </button>
          {task.googleEventId && (
            <p className="text-[10px] text-green-600 mt-1 text-center font-medium">
              ✓ カレンダー連携済み
            </p>
          )}
        </div>

        {/* 重要度・優先度 */}
        <div className="space-y-4 pt-2 border-t border-slate-200">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">重要度</p>
            <ScoreDots value={task.importance} color="bg-blue-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">優先度</p>
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

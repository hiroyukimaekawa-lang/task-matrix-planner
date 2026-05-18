import type { Task } from './types';

// 今日の日付をYYYY-MM-DD形式で返す
const today = () => new Date().toISOString().slice(0, 10);

// 作成からの経過日数を計算する
export function calculateDaysSinceCreated(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
}

// 期日までの残り日数を計算する（負の場合は超過）
export function calculateDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// 期日超過日数を返す（超過していない場合は0）
export function calculateOverdueDays(dueDate: string): number {
  const days = calculateDaysUntilDue(dueDate);
  return days < 0 ? Math.abs(days) : 0;
}

// 重要度と期日に基づいて緊急度（0〜4）を自動計算する
export function calculateUrgency(dueDate: string, importance: number): number {
  if (!dueDate) return 2; // 期日未指定の場合はデフォルトで2
  const daysLeft = calculateDaysUntilDue(dueDate);
  let baseUrgency = 0;

  if (daysLeft <= 0) {
    baseUrgency = 4; // 今日または期限切れ
  } else if (daysLeft === 1) {
    baseUrgency = 3; // 明日
  } else if (daysLeft <= 3) {
    baseUrgency = 2; // 3日以内
  } else if (daysLeft <= 7) {
    baseUrgency = 1; // 7日以内
  } else {
    baseUrgency = 0; // 7日より先
  }

  // 重要度による微調整：重要度が高い(3以上)なら緊急度を+1、低い(0)なら緊急度を-1
  let finalUrgency = baseUrgency;
  if (importance >= 3) {
    finalUrgency += 1;
  } else if (importance === 0) {
    finalUrgency -= 1;
  }

  return Math.min(4, Math.max(0, finalUrgency));
}

// 優先度スコアを計算する（10点満点）
// 計算式：(緊急度×25 + 重要度×18.75 + 時間係数) / 27.5
export function calculatePriorityScore(task: Task): number {
  if (task.status === 'completed') return 0;

  const daysUntilDue = calculateDaysUntilDue(task.dueDate);
  const urgencyWeight = task.urgency * 25;
  const importanceWeight = task.importance * 18.75;
  const timeWeight = daysUntilDue <= 0 ? 100 : Math.max(0, 50 - daysUntilDue * 2);

  const rawScore = urgencyWeight + importanceWeight + timeWeight;
  // 10点満点にスケーリングし、小数点第一位に丸める（最大10.0）
  return Math.round((rawScore / 27.5) * 10) / 10;
}

// タスクが期限切れかどうかを判定する
export function isOverdue(task: Task): boolean {
  return task.status === 'todo' && task.dueDate < today();
}

// 期日が今日かどうかを判定する
export function isToday(dueDate: string): boolean {
  return dueDate === today();
}

// フィルタ条件に基づいてタスクを絞り込む
export function filterTasks(tasks: Task[], filter: 'all' | 'today' | 'overdue'): Task[] {
  switch (filter) {
    case 'today':
      return tasks.filter((t) => t.status === 'todo' && isToday(t.dueDate));
    case 'overdue':
      return tasks.filter((t) => isOverdue(t));
    case 'all':
    default:
      return tasks;
  }
}

export type SortBy = 'due-date' | 'priority-score';

// ソート条件に基づいてタスクを並び替える
// 未完了タスクを常に先頭に表示する
export function sortTasks(tasks: Task[], sortBy: SortBy): Task[] {
  const sorted = [...tasks];

  sorted.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'todo' ? -1 : 1;

    if (sortBy === 'priority-score') {
      return calculatePriorityScore(b) - calculatePriorityScore(a);
    }

    return a.dueDate.localeCompare(b.dueDate);
  });

  return sorted;
}

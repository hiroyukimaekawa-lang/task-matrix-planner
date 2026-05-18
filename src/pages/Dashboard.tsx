import { useTaskStore } from '../store';
import {
  calculatePriorityScore,
  calculateDaysUntilDue,
  isOverdue,
  isToday,
} from '../utils';

export default function Dashboard() {
  const tasks = useTaskStore((s) => s.tasks);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const todo = total - completed;
  const overdue = tasks.filter((t) => isOverdue(t)).length;
  const today = tasks.filter((t) => t.status === 'todo' && isToday(t.dueDate)).length;
  const high = tasks.filter(
    (t) => t.status === 'todo' && calculatePriorityScore(t) >= 120
  ).length;

  const upcomingDays = tasks
    .filter((t) => t.status === 'todo')
    .map((t) => calculateDaysUntilDue(t.dueDate))
    .filter((d) => d >= 0 && d <= 7)
    .length;

  const stats = [
    { label: '総タスク数', value: total, color: 'bg-slate-100 text-slate-700' },
    { label: '未完了', value: todo, color: 'bg-blue-50 text-blue-700' },
    { label: '完了済み', value: completed, color: 'bg-green-50 text-green-700' },
    { label: '期限切れ', value: overdue, color: 'bg-red-50 text-red-700' },
    { label: '本日期限', value: today, color: 'bg-amber-50 text-amber-700' },
    { label: '高優先度', value: high, color: 'bg-orange-50 text-orange-700' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-6">ダッシュボード</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-4 ${color}`}>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs mt-1 opacity-80">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 完了率プログレスバー */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">完了率</h3>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden w-full">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: total ? `${(completed / total) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            全タスクの {total ? Math.round((completed / total) * 100) : 0}% が完了しています
          </p>
        </div>

        {/* 今週の予定 */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">今週の予定</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">7日以内に期限を迎えるタスク</span>
              <span className="font-semibold text-slate-800">{upcomingDays}件</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min((upcomingDays / Math.max(todo, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

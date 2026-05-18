import { AlertTriangle, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import type { Task } from '../types';
import { calculatePriorityScore, isOverdue, isToday, calculateDaysUntilDue } from '../utils';

interface Props {
  tasks: Task[];
}

export default function DashboardMetrics({ tasks }: Props) {
  const todoTasks = tasks.filter((t) => t.status === 'todo');

  const overdue = todoTasks.filter((t) => isOverdue(t));
  const todayTasks = todoTasks.filter((t) => isToday(t.dueDate));
  const critical = todoTasks.filter((t) => calculatePriorityScore(t) >= 120);
  const upcomingThisWeek = todoTasks.filter((t) => {
    const days = calculateDaysUntilDue(t.dueDate);
    return days >= 0 && days <= 7;
  });


  const metrics = [
    {
      label: '期限切れ',
      value: overdue.length,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
      iconColor: 'text-red-600',
      highlight: overdue.length > 0,
    },
    {
      label: '本日のタスク',
      value: todayTasks.length,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
      iconColor: 'text-amber-600',
      highlight: todayTasks.length > 0,
    },
    {
      label: '重大優先度',
      value: critical.length,
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-50',
      iconColor: 'text-orange-600',
      highlight: critical.length > 0,
    },
    {
      label: '今週の予定',
      value: upcomingThisWeek.length,
      icon: CheckCircle2,
      color: 'text-blue-600 bg-blue-50',
      iconColor: 'text-blue-600',
      highlight: upcomingThisWeek.length > 5,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={`${metric.color} rounded-xl p-4 border ${
                metric.highlight ? 'border-current opacity-100' : 'border-current opacity-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium opacity-75">{metric.label}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                </div>
                <Icon size={20} className={metric.iconColor} opacity={metric.highlight ? 1 : 0.5} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from 'react';
import type { Task } from '../types';
import { calculatePriorityScore, isOverdue } from '../utils';

const PADDING = 60;
const GRAPH_SIZE = 500;
const SCALE = 4;

// タスクの色を優先度・状態に応じて決定する
function getTaskColor(task: Task, priority: number): string {
  if (task.status === 'completed') return '#d1d5db';
  if (isOverdue(task)) return '#ef4444';
  if (priority >= 8.0) return '#dc2626'; // 高優先度（赤）
  if (priority >= 5.0) return '#f97316'; // 中優先度（オレンジ）
  return '#3b82f6'; // 通常（青）
}

// タスク円のサイズを優先度・状態に応じて決定する
function getTaskRadius(task: Task, priority: number): number {
  if (task.status === 'completed') return 12;
  if (isOverdue(task)) return 20;
  if (priority >= 8.0) return 18;
  if (priority >= 5.0) return 16;
  return 14;
}

interface Props {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onAddClick: () => void;
}

export default function Matrix({ tasks, selectedTaskId, onSelectTask, onAddClick }: Props) {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  const todoTasks = tasks
    .filter((t) => t.status === 'todo')
    .sort((a, b) => {
      const scoreA = calculatePriorityScore(a);
      const scoreB = calculatePriorityScore(b);
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      if (b.importance !== a.importance) {
        return b.importance - a.importance;
      }
      return a.dueDate.localeCompare(b.dueDate);
    });

  // 座標スケール変換（値 → SVGピクセル）
  const xScale = (value: number) => PADDING + (value / SCALE) * GRAPH_SIZE;
  const yScale = (value: number) => PADDING + GRAPH_SIZE - (value / SCALE) * GRAPH_SIZE;

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <svg
        width={PADDING * 2 + GRAPH_SIZE}
        height={PADDING * 2 + GRAPH_SIZE}
        className="w-full"
        viewBox={`0 0 ${PADDING * 2 + GRAPH_SIZE} ${PADDING * 2 + GRAPH_SIZE}`}
      >
        {/* 象限の背景色 */}
        {/* 今すぐ対応（重要度高・緊急度高） */}
        <rect x={xScale(2)} y={yScale(4)} width={GRAPH_SIZE / 2} height={GRAPH_SIZE / 2} fill="#fef3c7" opacity="0.3" />
        {/* 計画する（重要度高・緊急度低） */}
        <rect x={xScale(0)} y={yScale(4)} width={GRAPH_SIZE / 2} height={GRAPH_SIZE / 2} fill="#dbeafe" opacity="0.3" />
        {/* 委任する（重要度低・緊急度高） */}
        <rect x={xScale(2)} y={yScale(2)} width={GRAPH_SIZE / 2} height={GRAPH_SIZE / 2} fill="#dcfce7" opacity="0.3" />
        {/* 保留・低優先（重要度低・緊急度低） */}
        <rect x={xScale(0)} y={yScale(2)} width={GRAPH_SIZE / 2} height={GRAPH_SIZE / 2} fill="#f3f4f6" opacity="0.5" />

        {/* グリッドの枠線 */}
        <line x1={xScale(0)} y1={yScale(0)} x2={xScale(0)} y2={yScale(4)} stroke="#e5e7eb" strokeWidth="1" />
        <line x1={xScale(0)} y1={yScale(4)} x2={xScale(4)} y2={yScale(4)} stroke="#e5e7eb" strokeWidth="1" />
        <line x1={xScale(4)} y1={yScale(0)} x2={xScale(4)} y2={yScale(4)} stroke="#e5e7eb" strokeWidth="1" />
        <line x1={xScale(0)} y1={yScale(0)} x2={xScale(4)} y2={yScale(0)} stroke="#e5e7eb" strokeWidth="1" />

        {/* 中央の分割線（点線） */}
        <line x1={xScale(2)} y1={yScale(0)} x2={xScale(2)} y2={yScale(4)} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />
        <line x1={xScale(0)} y1={yScale(2)} x2={xScale(4)} y2={yScale(2)} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />

        {/* 軸ラベル */}
        <text x={xScale(2)} y={PADDING - 20} textAnchor="middle" className="text-xs font-semibold fill-slate-600">
          重要度
        </text>
        <text x={PADDING - 30} y={yScale(2) + 5} textAnchor="middle" className="text-xs font-semibold fill-slate-600">
          優先度
        </text>



        {/* タスクの点をプロット */}
        {(() => {
          const coordinateCounts: { [key: string]: number } = {};
          return todoTasks.map((task, index) => {
            const priority = calculatePriorityScore(task);
            const radius = getTaskRadius(task, priority);
            const color = getTaskColor(task, priority);
            const isSelected = selectedTaskId === task.id;
            const isHovered = hoveredTaskId === task.id;

            // 衝突判定と微小オフセット（ジッター）の計算
            const coordKey = `${task.urgency}-${task.importance}`;
            const count = coordinateCounts[coordKey] || 0;
            coordinateCounts[coordKey] = count + 1;

            let offsetX = 0;
            let offsetY = 0;
            if (count > 0) {
              // 衝突がある場合は黄金角で放射状に綺麗に分散配置
              const angle = count * 2.4;
              const distance = 18; // 重複したドット同士が重ならない距離
              offsetX = Math.cos(angle) * distance;
              offsetY = Math.sin(angle) * distance;
            }

            const x = xScale(task.urgency) + offsetX;
            const y = yScale(task.importance) + offsetY;

            return (
              <g key={task.id}>
                {/* 高優先度タスクのグロー（パルスアニメーション） */}
                {(isOverdue(task) || priority >= 8.0) && (
                  <circle cx={x} cy={y} r={radius + 8} fill={color} opacity="0.15" className="animate-pulse" />
                )}

                {/* 選択中タスクのリング */}
                {isSelected && (
                  <circle cx={x} cy={y} r={radius + 6} fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="4,2" />
                )}

                {/* タスク本体の円 */}
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={color}
                  className={`cursor-pointer transition-all duration-200 ${isHovered || isSelected ? 'filter drop-shadow-lg' : ''}`}
                  style={{ filter: isHovered || isSelected ? 'drop-shadow(0 0 8px rgba(0,0,0,0.2))' : 'none' }}
                  onClick={() => onSelectTask(task.id)}
                  onMouseEnter={() => setHoveredTaskId(task.id)}
                  onMouseLeave={() => setHoveredTaskId(null)}
                />

                {/* タスク番号ラベル */}
                <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-white pointer-events-none">
                  {String(index + 1).padStart(2, '0')}
                </text>
              </g>
            );
          });
        })()}
      </svg>

      {/* 凡例 */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          <span>期限切れ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>高優先度</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>通常</span>
        </div>
      </div>

      {/* タスク追加フローティングボタン */}
      <button
        onClick={onAddClick}
        className="absolute top-6 left-6 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-xl hover:scale-110 z-10"
        title="タスクを追加"
      >
        +
      </button>
    </div>
  );
}

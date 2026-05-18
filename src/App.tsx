import { useState } from 'react';
import { useTaskStore } from './store';
import Matrix from './components/Matrix';
import TaskDetailPanel from './components/TaskDetailPanel';
import AddTaskModal from './components/AddTaskModal';
import TaskListBelow from './components/TaskListBelow';
import { isOverdue } from './utils';

export default function App() {
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const updateTask = useTaskStore((s) => s.updateTask);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOverdueOpen, setIsOverdueOpen] = useState(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;
  const overdueTasks = tasks.filter((t) => isOverdue(t));

  const handleAddTask = (data: Parameters<typeof addTask>[0]) => {
    addTask(data);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">タスクマトリクス</h1>
            <p className="text-sm text-slate-500 mt-0.5">優先順位を明確に管理する</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
              <span className="font-semibold text-slate-900 text-base">
                {tasks.filter((t) => t.status === 'todo').length}
              </span>
              <span className="text-slate-500 text-xs">件の未完了タスク</span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsOverdueOpen(!isOverdueOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm ${
                  overdueTasks.length > 0
                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 hover:scale-105 active:scale-95 cursor-pointer font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400 cursor-default'
                }`}
                disabled={overdueTasks.length === 0}
              >
                <span>⚠️ {overdueTasks.length} 件の期限切れ</span>
              </button>

              {isOverdueOpen && overdueTasks.length > 0 && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsOverdueOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                      <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                        ⚠️ 期限切れのタスク一覧
                      </span>
                      <span className="text-[10px] text-slate-400">({overdueTasks.length}件)</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                      {overdueTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => {
                            setSelectedTaskId(task.id);
                            setIsOverdueOpen(false);
                          }}
                          className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition border border-transparent hover:border-slate-100 flex flex-col gap-0.5 text-left"
                        >
                          <span className="text-xs font-medium text-slate-800 line-clamp-2 hover:text-blue-600">
                            {task.title}
                          </span>
                          <span className="text-[10px] text-red-500 font-medium">
                            期日: {task.dueDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* マトリクス（全幅表示） */}
        <div className="mb-12">
          <Matrix
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
            onAddClick={() => setIsAddModalOpen(true)}
          />
        </div>

        {/* タスクリスト */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <TaskListBelow
            tasks={tasks}
            onSelectTask={setSelectedTaskId}
            onComplete={completeTask}
            onDelete={deleteTask}
          />
        </div>
      </main>

      {/* タスク追加モーダル */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTask}
      />

      {/* タスク詳細パネル（右スライドイン） */}
      <div
        className={`fixed inset-y-0 right-0 transition-transform duration-300 z-50 ${
          selectedTask ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onComplete={completeTask}
          onDelete={deleteTask}
          onUpdate={updateTask}
        />
      </div>

      {/* オーバーレイ */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black/10 z-40 transition-opacity"
          onClick={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}

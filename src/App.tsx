import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { LogOut } from 'lucide-react';
import { auth, db } from './firebase';
import { useTaskStore } from './store';
import Matrix from './components/Matrix';
import TaskDetailPanel from './components/TaskDetailPanel';
import AddTaskModal from './components/AddTaskModal';
import TaskListBelow from './components/TaskListBelow';
import Login from './components/Login';
import { isOverdue } from './utils';
import type { Task } from './types';

export default function App() {
  const tasks = useTaskStore((s) => s.tasks);
  const user = useTaskStore((s) => s.user);
  const setTasks = useTaskStore((s) => s.setTasks);
  const setUser = useTaskStore((s) => s.setUser);
  
  const addTask = useTaskStore((s) => s.addTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const updateTask = useTaskStore((s) => s.updateTask);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOverdueOpen, setIsOverdueOpen] = useState(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;
  const overdueTasks = tasks.filter((t) => isOverdue(t));

  // Firebase Auth & Firestore リアルタイム同期
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // 現在のユーザーIDに紐づくタスクのみをフィルタリング取得
        const q = query(
          collection(db, 'tasks'),
          where('userId', '==', firebaseUser.uid)
        );

        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const tasksList: Task[] = [];
          snapshot.forEach((doc) => {
            tasksList.push({ id: doc.id, ...doc.data() } as Task);
          });
          setTasks(tasksList);
        });

        return () => {
          unsubscribeFirestore();
        };
      } else {
        setTasks([]);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [setUser, setTasks]);

  const handleAddTask = (data: Parameters<typeof addTask>[0]) => {
    addTask(data);
  };

  // 未ログインの場合はログイン画面を表示
  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          
          {/* タイトルとモバイル用プロフィール（モバイルでは横並び） */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900">タスクマトリクス</h1>
              <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5">優先順位を明確に管理する</p>
            </div>
            
            {/* モバイル用アバター＆ログアウト（sm以上で非表示） */}
            <div className="flex sm:hidden items-center gap-1.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'ユーザー'}
                  className="w-7 h-7 rounded-full border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </div>
              )}
              <button
                onClick={() => signOut(auth)}
                className="p-1 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 transition-colors ml-0.5 cursor-pointer"
                title="ログアウト"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
          
          {/* カウンター・アラート・デスクトップ用プロフィール */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="text-xs sm:text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5 shadow-sm">
              <span className="font-semibold text-slate-900 text-sm sm:text-base">
                {tasks.filter((t) => t.status === 'todo').length}
              </span>
              <span className="text-slate-500 text-[10px] sm:text-xs">件の未完了タスク</span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsOverdueOpen(!isOverdueOpen)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border text-[10px] sm:text-xs font-semibold transition-all shadow-sm ${
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

            {/* デスクトップ用プロフィール & ログアウト（sm以上で表示） */}
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-slate-200">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'ユーザー'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm">
                  {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[100px]">
                  {user.displayName || '社員ユーザー'}
                </span>
                <span className="text-[9px] text-slate-400 line-clamp-1 max-w-[120px]">
                  {user.email}
                </span>
              </div>
              <button
                onClick={() => signOut(auth)}
                className="p-1 sm:p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 transition-colors ml-0.5 sm:ml-1 cursor-pointer"
                title="ログアウト"
              >
                <LogOut size={14} className="sm:w-4 sm:h-4" />
              </button>
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

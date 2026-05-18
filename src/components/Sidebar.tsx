import { LayoutDashboard, ListTodo, PlusCircle } from 'lucide-react';

type Page = 'dashboard' | 'tasks' | 'add';

interface Props {
  current: Page;
  onChange: (page: Page) => void;
}

// ナビゲーション定義（日本語ラベル）
const nav: { id: Page; label: string; Icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'ダッシュボード', Icon: LayoutDashboard },
  { id: 'tasks', label: 'タスク一覧', Icon: ListTodo },
  { id: 'add', label: 'タスクを追加', Icon: PlusCircle },
];

export default function Sidebar({ current, onChange }: Props) {
  return (
    <aside className="w-56 shrink-0 bg-slate-900 min-h-screen flex flex-col">
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-white font-semibold text-base leading-tight">
          タスクマトリクス<br />
          <span className="text-slate-400 font-normal text-sm">プランナー</span>
        </h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              current === id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

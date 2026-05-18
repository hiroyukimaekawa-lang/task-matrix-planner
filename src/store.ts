import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from './types';
import { initialTasks } from './data';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: initialTasks,
      addTask: (data) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...data,
              id: crypto.randomUUID(),
              status: 'todo',
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      completeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: 'completed' } : t
          ),
        })),
    }),
    { name: 'task-matrix-planner' }
  )
);

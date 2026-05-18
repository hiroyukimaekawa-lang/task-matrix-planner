import { create } from 'zustand';
import type { Task } from './types';
import { db } from './firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

interface TaskStore {
  tasks: Task[];
  user: any | null;
  googleAccessToken: string | null;
  setTasks: (tasks: Task[]) => void;
  setUser: (user: any | null) => void;
  setGoogleAccessToken: (token: string | null) => void;
  addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt' | 'userId'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  user: null,
  googleAccessToken: null,

  setTasks: (tasks) => set({ tasks }),
  setUser: (user) => set({ user }),
  setGoogleAccessToken: (token) => set({ googleAccessToken: token }),

  addTask: async (data) => {
    const { user } = get();
    if (!user) {
      console.warn('Cannot add task: No user logged in.');
      return;
    }
    try {
      await addDoc(collection(db, 'tasks'), {
        ...data,
        userId: user.uid,
        status: 'todo',
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding document to Firestore:', error);
    }
  },

  updateTask: async (id, updates) => {
    try {
      const taskDocRef = doc(db, 'tasks', id);
      await updateDoc(taskDocRef, updates);
    } catch (error) {
      console.error('Error updating document in Firestore:', error);
    }
  },

  deleteTask: async (id) => {
    try {
      const taskDocRef = doc(db, 'tasks', id);
      await deleteDoc(taskDocRef);
    } catch (error) {
      console.error('Error deleting document in Firestore:', error);
    }
  },

  completeTask: async (id) => {
    try {
      const taskDocRef = doc(db, 'tasks', id);
      await updateDoc(taskDocRef, { status: 'completed' });
    } catch (error) {
      console.error('Error completing document in Firestore:', error);
    }
  },
}));

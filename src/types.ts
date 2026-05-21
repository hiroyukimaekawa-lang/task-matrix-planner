export type TaskStatus = 'todo' | 'completed';

export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO date string YYYY-MM-DD
  dueTime?: string; // Time string HH:MM
  googleEventId?: string; // Sycned Google Calendar Event ID
  userId?: string; // Owner User ID in Firebase Auth
  importance: 1 | 2 | 3 | 4;
  urgency: 0 | 1 | 2 | 3 | 4;
  status: TaskStatus;
  createdAt: string;
  memo?: string; // メモ (任意)
  timeRequired?: 'small' | 'medium' | 'large';
}

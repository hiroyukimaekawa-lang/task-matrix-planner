export type TaskStatus = 'todo' | 'completed';

export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO date string YYYY-MM-DD
  dueTime?: string; // Time string HH:MM
  googleEventId?: string; // Sycned Google Calendar Event ID
  userId?: string; // Owner User ID in Firebase Auth
  importance: 1 | 2 | 3 | 4 | 5;
  urgency: 1 | 2 | 3 | 4 | 5;
  status: TaskStatus;
  createdAt: string;
}

import type { Task } from './types';

// 初期サンプルタスク（日本語）
export const initialTasks: Task[] = [
  { id: '1', title: 'CI/CDパイプラインのセットアップ', dueDate: '2026-05-20', importance: 5, urgency: 4, status: 'todo', createdAt: '2026-05-01T08:00:00Z' },
  { id: '2', title: '認証モジュールのユニットテスト作成', dueDate: '2026-05-22', importance: 4, urgency: 3, status: 'todo', createdAt: '2026-05-01T09:00:00Z' },
  { id: '3', title: 'データベーススキーマの設計', dueDate: '2026-05-18', importance: 5, urgency: 5, status: 'todo', createdAt: '2026-05-02T10:00:00Z' },
  { id: '4', title: 'プロジェクトドキュメントの更新', dueDate: '2026-05-30', importance: 2, urgency: 1, status: 'todo', createdAt: '2026-05-02T11:00:00Z' },
  { id: '5', title: 'ログインリダイレクトのバグ修正', dueDate: '2026-05-15', importance: 5, urgency: 5, status: 'todo', createdAt: '2026-05-03T08:00:00Z' },
  { id: '6', title: 'プルリクエストのレビュー', dueDate: '2026-05-14', importance: 3, urgency: 4, status: 'completed', createdAt: '2026-05-03T09:00:00Z' },
  { id: '7', title: 'APIエラーハンドリングのリファクタリング', dueDate: '2026-05-25', importance: 3, urgency: 2, status: 'todo', createdAt: '2026-05-04T10:00:00Z' },
  { id: '8', title: 'チーム振り返り会議のスケジュール調整', dueDate: '2026-05-16', importance: 2, urgency: 3, status: 'todo', createdAt: '2026-05-04T11:00:00Z' },
  { id: '9', title: '画像読み込みのパフォーマンス最適化', dueDate: '2026-05-28', importance: 3, urgency: 2, status: 'todo', createdAt: '2026-05-05T08:00:00Z' },
  { id: '10', title: '新メンバーのオンボーディング対応', dueDate: '2026-05-17', importance: 4, urgency: 4, status: 'completed', createdAt: '2026-05-05T09:00:00Z' },
];

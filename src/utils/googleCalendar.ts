import type { Task } from '../types';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '134580085796-mkgmbd506v0huuudknf9qoecl1im7e21.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let tokenClient: any = null;

// Google SDKの初期化
export function initGoogleClient(onSuccess: (accessToken: string) => void) {
  if (typeof window === 'undefined') return;

  const initClient = () => {
    if (!(window as any).google?.accounts?.oauth2) {
      console.warn('Google Identity Services SDK is not loaded yet.');
      return;
    }

    tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse: any) => {
        if (tokenResponse.error !== undefined) {
          throw tokenResponse;
        }
        onSuccess(tokenResponse.access_token);
      },
    });
  };

  // すでにSDKがロードされているか確認
  if ((window as any).google?.accounts?.oauth2) {
    initClient();
  } else {
    // ロード完了まで待つ
    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.oauth2) {
        clearInterval(interval);
        initClient();
      }
    }, 200);
  }
}

// ログイン／認証ポップアップの起動
export function requestAccessToken() {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    console.error('Google Token Client is not initialized.');
  }
}

// 翌日の日付文字列 (YYYY-MM-DD) を取得するヘルパー
function getNextDay(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 時間文字列から1時間後の時刻文字列を取得するヘルパー
function getEndTime(dateStr: string, timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const startDate = new Date(dateStr);
  startDate.setHours(hours, minutes, 0);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1時間後
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:00`;
}

// Googleカレンダーへタスクの追加・更新
export async function syncTaskToGoogleCalendar(
  accessToken: string,
  task: Task
): Promise<string | null> {
  const isTimed = !!task.dueTime;

  // Google Calendar用イベントモデルの構築
  const memoStr = task.memo ? `\n\n【メモ】\n${task.memo}` : '';
  const eventBody: any = {
    summary: task.title,
    description: `【タスクマトリクス プランナーから同期】\n重要度: ${task.importance}\n緊急度: ${task.urgency}\nステータス: ${task.status === 'completed' ? '完了' : '未完了'}${memoStr}`,
  };

  if (isTimed) {
    const startDateTime = `${task.dueDate}T${task.dueTime}:00`;
    const endDateTime = getEndTime(task.dueDate, task.dueTime!);
    eventBody.start = {
      dateTime: startDateTime,
      timeZone: 'Asia/Tokyo',
    };
    eventBody.end = {
      dateTime: endDateTime,
      timeZone: 'Asia/Tokyo',
    };
  } else {
    // 終日予定
    eventBody.start = {
      date: task.dueDate,
    };
    eventBody.end = {
      date: getNextDay(task.dueDate),
    };
  }

  const hasEventId = !!task.googleEventId;
  const url = hasEventId
    ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${task.googleEventId}`
    : 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

  try {
    const response = await fetch(url, {
      method: hasEventId ? 'PATCH' : 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    });

    // すでにカレンダー上でイベントが削除されているなどで404になった場合は、新規登録としてフォールバック
    if (hasEventId && response.status === 404) {
      console.warn('Sync targeted event ID not found on Google Calendar. Re-creating...');
      return syncTaskToGoogleCalendar(accessToken, { ...task, googleEventId: undefined });
    }

    if (response.ok) {
      const data = await response.json();
      return data.id; // 新しい、または更新された Google カレンダー予定ID
    } else {
      const errData = await response.json().catch(() => ({}));
      console.error('Failed to sync to Google Calendar:', errData);
      const errMsg = errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errMsg);
    }
  } catch (error: any) {
    console.error('Error in syncTaskToGoogleCalendar:', error);
    throw error;
  }
}

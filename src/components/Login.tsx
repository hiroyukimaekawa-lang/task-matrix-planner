import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useTaskStore } from '../store';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const setGoogleAccessToken = useTaskStore((s) => s.setGoogleAccessToken);

  const handleGoogleLogin = async () => {
    setLoading(false);
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // FirebaseからGoogleのアクセストークンを抽出して保存
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token) {
        setGoogleAccessToken(token);
        localStorage.setItem('google_access_token', token);
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      alert('ログインに失敗しました。詳細: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* 背景のグラデーション装飾オーブ */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />

      {/* ログインカード */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10 text-center transition-all duration-300 hover:border-white/20">
        
        {/* ロゴ・ヘッダー */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <span className="text-white text-3xl font-extrabold tracking-tight">M</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">
            タスクマトリクス プランナー
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
            重要度と期日ベースで優先順位を可視化する社内タスク管理システム
          </p>
        </div>

        {/* ログインアクション */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold py-3 px-4 rounded-xl shadow-lg border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.445-2.89-6.445-6.445s2.89-6.445 6.445-6.445c1.527 0 2.924.536 4.027 1.428l3.14-3.14C19.16 2.03 15.9 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c5.96 0 10.96-4.29 10.96-11 0-.729-.08-1.4-.23-1.815H12.24z"
                />
              </svg>
            )}
            {loading ? 'サインイン中...' : 'Google アカウントでサインイン'}
          </button>
        </div>

        {/* フッター */}
        <div className="mt-8 pt-6 border-t border-white/5 text-[11px] text-slate-500">
          <p>© 2026 社内タスク管理システム. All rights reserved.</p>
          <p className="mt-1">本システムは社内利用専用として安全に暗号化されています</p>
        </div>
      </div>
    </div>
  );
}

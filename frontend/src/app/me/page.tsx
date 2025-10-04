
"use client"; // Next.jsのクライアントコンポーネントとして宣言

import { useEffect, useState } from "react"; // Reactのフックをインポート
import Header from "../components/Header"; // ヘッダーコンポーネント
import Footer from "../components/Footer"; // フッターコンポーネント
import LineChart from "./components/LineChart"; // グラフコンポーネント

// ユーザーの記録データ型
type RecordItem = { cps: number; accuracy: number; created_at: string };


// マイページ本体コンポーネント
export default function MePage() {
  // ローディング状態
  const [loading, setLoading] = useState(true);
  // エラーメッセージ
  const [error, setError] = useState<string | null>(null);
  // ユーザー情報（nullなら未取得）
  const [user, setUser] = useState<{ id: number; username: string; email: string; records: RecordItem[] } | null>(null);

  // 初回マウント時にユーザー情報を取得
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true); // ローディング開始
        setError(null);   // エラー初期化
        // APIからユーザー情報取得
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) throw new Error('未ログインか、取得に失敗しました');
        const json = await res.json();
        setUser(json); // ユーザー情報セット
      } catch (e: any) {
        setError(e.message); // エラーセット
      } finally {
        setLoading(false); // ローディング終了
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* ヘッダー */}
      <Header />
      <main className="flex flex-col items-center justify-start flex-1 w-full px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-black">マイページ</h1>
        {/* ローディング中表示 */}
        {loading && <p className="text-gray-700">読み込み中...</p>}
        {/* エラー表示 */}
        {error && <p className="text-red-600">{error}</p>}
        {/* ユーザー情報表示 */}
        {user && (
          <div className="w-full space-y-4">
            {/* ユーザー基本情報 */}
            <div className="bg-white rounded shadow p-4">
              <p className="text-gray-800">ユーザー名: {user.username}</p>
              <p className="text-gray-600">メール: {user.email}</p>
            </div>
            {/* 過去記録のグラフ表示 */}
            <div className="bg-white rounded shadow p-4">
              <h2 className="font-semibold mb-2 text-black">過去10回の推移</h2>
              {user.records?.length ? (
                <LineChart data={user.records} />
              ) : (
                <p className="text-gray-600">データがありません</p>
              )}
            </div>
          </div>
        )}
      </main>
      {/* フッター */}
      <Footer />
    </div>
  );
}

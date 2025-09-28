"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { login, me } from "@/lib/auth";


// ログインページコンポーネント
export default function LoginPage() {
  // 入力値や状態の管理
  const [identifier, setIdentifier] = useState(""); // メールまたはユーザー名
  const [password, setPassword] = useState(""); // パスワード
  const [msg, setMsg] = useState<string | null>(null); // エラーメッセージ等
  const [loading, setLoading] = useState(false); // ローディング状態
  const [currentUser, setCurrentUser] = useState<any>(null); // 現在のユーザー
  const router = useRouter(); // ルーター

  // フォーム送信時の処理
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      // ログインAPI呼び出し
      const user = await login({ identifier, password });
      setCurrentUser(user);
      // 成功したらトップへ遷移
      router.push("/");
    } catch (e: any) {
      // エラー時はメッセージ表示
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };


  // 画面の描画
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-black">ログイン</h1>
        {/* ログインフォーム */}
        <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">メールまたはユーザー名</label>
            <input value={identifier} onChange={e => setIdentifier(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">パスワード</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
        {/* エラーメッセージ表示 */}
        {msg && <p className="mt-4 text-gray-800">{msg}</p>}
      </main>
      <Footer />
    </div>
  );
}

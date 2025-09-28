
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/auth";
import Header from "../components/Header";
import Footer from "../components/Footer";


// サインアップページ本体
export default function SignupPage() {
  // フォーム入力値の状態管理
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // メッセージ表示用
  const [msg, setMsg] = useState<string | null>(null);
  // ローディング状態
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  // フォーム送信時の処理
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ページリロード防止
    setLoading(true);
    setMsg(null);
    try {
      // サインアップAPI呼び出し
      const user = await signup({ email, password, username: username || undefined });
      // 成功したらトップへ遷移
      router.push("/");
    } catch (e: any) {
      // エラーメッセージ表示
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 画面全体のレイアウト
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Header /> {/* ヘッダー */}
      <main className="flex flex-col items-center justify-center flex-1 w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-black">サインアップ</h1>
        {/* サインアップフォーム */}
        <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
          <div className="mb-4">
            {/* メールアドレス入力欄 */}
            <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-black" />
          </div>
          <div className="mb-4">
            {/* ユーザー名入力欄（任意） */}
            <label className="block text-sm font-medium text-gray-700">ユーザー名（任意）</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-black" />
          </div>
          <div className="mb-6">
            {/* パスワード入力欄 */}
            <label className="block text-sm font-medium text-gray-700">パスワード</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-black" />
          </div>
          {/* 送信ボタン */}
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
            {loading ? '作成中...' : 'アカウント作成'}
          </button>
        </form>
        {/* メッセージ表示欄 */}
        {msg && <p className="mt-4 text-gray-800">{msg}</p>}
      </main>
      <Footer /> {/* フッター */}
    </div>
  );
}

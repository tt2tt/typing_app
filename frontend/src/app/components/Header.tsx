"use client";


import React, { useEffect, useState } from "react";
import Link from "next/link";
import { me, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";


// ユーザー型の定義
type User = { id: number; username: string; email: string } | null;


// ヘッダーコンポーネント
const Header = () => {
  // ユーザー情報の状態管理
  const [user, setUser] = useState<User>(null);
  const router = useRouter();


  // マウント時にユーザー情報を取得
  useEffect(() => {
    let mounted = true;
    me().then((u) => { if (mounted) setUser(u); }).catch(() => {});
    return () => { mounted = false; };
  }, []);


  // ログアウト処理
  const onLogout = async () => {
    try {
      await logout();
      setUser(null);
      router.push("/");
    } catch (e) {
      // 失敗時もとりあえず状態を未ログインに
      setUser(null);
    }
  };


  // ヘッダーのJSXを返す
  return (
    <header className="w-full py-4 bg-blue-600 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {/* タイトルをトップページへのリンクに */}
          <Link href="/" className="hover:underline text-white">タイピングアプリ</Link>
        </h1>
        {/* ナビゲーション：ログイン状態で表示を切り替え */}
        <nav className="space-x-4">
          {user ? (
            <>
              {/* ログイン時のリンク */}
              <Link href="/api/auth/me/" className="underline hover:text-gray-200">me</Link>
              <button onClick={onLogout} className="underline hover:text-gray-200">ログアウト</button>
            </>
          ) : (
            <>
              {/* 未ログイン時のリンク */}
              <Link href="/signup" className="underline hover:text-gray-200">サインアップ</Link>
              <Link href="/login" className="underline hover:text-gray-200">ログイン</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

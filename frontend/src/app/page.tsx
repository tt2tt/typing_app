"use client";

import { CATEGORY_LINKS, CategoryLink } from "./constants/categories";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CustomCategoryInput from "./components/CustomCategoryInput";

// Homeコンポーネント（アプリのトップページ）
import type { FC } from "react";

const Home: FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* ヘッダー表示 */}
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 w-full px-4 py-8">
        {/* タイトル */}
        <h2 className="text-xl font-semibold mb-4 text-black">ようこそ！タイピングアプリへ</h2>
        {/* 説明文 */}
        <p className="mb-6 text-gray-700">
          カテゴリーごとにAIが練習する文章を生成します。<br />
          ※生成された文字列には誤りがあることがあります。<br />
          練習するカテゴリーを選んでください。
        </p>
        {/* カスタムカテゴリ入力（20文字まで） */}
        <CustomCategoryInput />
        {/* カテゴリー選択ボタン一覧 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-xl">
          {CATEGORY_LINKS.map((c: CategoryLink) => (
            // カテゴリごとのリンクボタン
            <a
              key={c.slug}
              href={`/typing?category=${encodeURIComponent(c.slug)}`}
              className={`text-center text-white px-4 py-2 rounded shadow transition ${c.bgClass} ${c.hoverClass}`}
            >
              {c.label}
            </a>
          ))}
        </div>
      </main>
      {/* フッター表示 */}
      <Footer />
    </div>
)};
export default Home;

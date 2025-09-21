"use client";

import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 w-full px-4 py-8">
        <h2 className="text-xl font-semibold mb-4 text-black">ようこそ！タイピングアプリへ</h2>
        <p className="mb-6 text-gray-700">
          カテゴリーごとにAIが練習する文章を生成します。<br />
          ※生成された文字列には誤りがあることがあります。<br />
          練習するカテゴリーを選んでください。
        </p>
        {/* カスタムカテゴリ入力（20文字まで） */}
        <CustomCategoryInput />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-xl">
          <a href="/typing?category=animal" className="text-center bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">動物</a>
          <a href="/typing?category=fish" className="text-center bg-cyan-600 text-white px-4 py-2 rounded shadow hover:bg-cyan-700 transition">魚</a>
          <a href="/typing?category=insect" className="text-center bg-emerald-600 text-white px-4 py-2 rounded shadow hover:bg-emerald-700 transition">昆虫</a>
          <a href="/typing?category=bird" className="text-center bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition">鳥</a>
          <a href="/typing?category=food" className="text-center bg-orange-600 text-white px-4 py-2 rounded shadow hover:bg-orange-700 transition">食べ物</a>
          <a href="/typing?category=sports" className="text-center bg-rose-600 text-white px-4 py-2 rounded shadow hover:bg-rose-700 transition">スポーツ</a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function CustomCategoryInput() {
  const [customCategory, setCustomCategory] = useState("");
  const trimmed = customCategory.trim();
  const href = trimmed
    ? `/typing?category=${encodeURIComponent(trimmed)}`
    : "#";

  const isEmpty = trimmed.length === 0;

  return (
    <div className="w-full max-w-xl mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        カスタムカテゴリー（20文字まで）
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value.slice(0, 20))}
          maxLength={20}
          placeholder="例: programming, travel, music"
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <a
          href={href}
          aria-disabled={isEmpty}
          onClick={(e) => {
            if (isEmpty) e.preventDefault();
          }}
          className={`px-4 py-2 rounded shadow text-white transition ${
            isEmpty
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          title={isEmpty ? "カテゴリを入力してください" : `カテゴリ: ${trimmed}`}
        >
          入力したカテゴリで開始
        </a>
      </div>
    </div>
  );
}

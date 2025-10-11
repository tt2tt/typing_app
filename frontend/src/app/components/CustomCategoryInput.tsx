"use client";

import React, { useState } from "react";

// カスタムカテゴリー入力用コンポーネント
const CustomCategoryInput: React.FC = () => {
  // 入力値の状態管理
  const [customCategory, setCustomCategory] = useState("");
  // 前後の空白を除去した値
  const trimmed = customCategory.trim();
  // 入力があれば遷移先URLを生成、なければ#
  const href = trimmed ? `/typing?category=${encodeURIComponent(trimmed)}` : "#";
  // 入力が空かどうか
  const isEmpty = trimmed.length === 0;

  return (
    <div className="w-full max-w-xl mb-6">
      {/* ラベル表示 */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        カスタムカテゴリー（20文字まで）
      </label>
      <div className="flex gap-2">
        {/* テキスト入力欄（20文字制限） */}
        <input
          type="text"
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value.slice(0, 20))}
          maxLength={20}
          placeholder="例: programming, travel, music"
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* 入力値でタイピング開始ボタン。未入力時は無効化 */}
        <a
          href={href}
          aria-disabled={isEmpty}
          onClick={(e) => {
            if (isEmpty) e.preventDefault(); // 未入力時は遷移しない
          }}
          className={`px-4 py-2 rounded shadow text-white transition ${
            isEmpty ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
          title={isEmpty ? "カテゴリを入力してください" : `カテゴリ: ${trimmed}`}
        >
          入力したカテゴリで開始
        </a>
      </div>
    </div>
  );
};

export default CustomCategoryInput;

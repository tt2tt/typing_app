"use client";

import React from "react";


type Props = {
  cps: number;           // 1秒間の文字数
  accuracy: number;      // 正答率（%）
  evalStr: string;       // 評価（S~Fなど）
  onRetry: () => void;   // 再挑戦時のコールバック
  onBack: () => void;    // 戻るボタンのコールバック
  categoryLabel?: string;// カテゴリー名（任意）
};

// タイピング結果表示コンポーネント
const TypingResult: React.FC<Props> = ({ cps, accuracy, evalStr, onRetry, onBack, categoryLabel }) => {
  return (
    <div style={{ textAlign: "center", color: "#222" }}>
      {/* 結果タイトル */}
      <h3 style={{ fontSize: 22, marginBottom: 18, color: "#222" }}>結果</h3>
      {/* 1秒間の文字数 */}
      <p style={{ fontSize: 18, color: "#222" }}>
        1秒間の文字入力数: <b style={{ color: "#222" }}>{cps}</b>
      </p>
      {/* 正答率 */}
      <p style={{ fontSize: 18, color: "#222" }}>
        正答率: <b style={{ color: "#222" }}>{accuracy}%</b>
      </p>
      {/* 評価 */}
      <p style={{ fontSize: 18, color: "#222" }}>
        評価: <b style={{ color: "#222" }}>{evalStr}</b>
      </p>
      {/* 再挑戦・戻るボタン */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
        <button
          style={{
            padding: "10px 24px",
            fontSize: 16,
            background: "#4f9cff",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 700,
          }}
          onClick={onRetry}
          title={categoryLabel ? `同じカテゴリー(${categoryLabel})で再開` : undefined}
        >
          同じカテゴリーで続ける
        </button>
        <button
          style={{
            padding: "10px 24px",
            fontSize: 16,
            background: "#ffe066",
            color: "#222",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 700,
          }}
          onClick={onBack}
        >
          戻る
        </button>
      </div>
    </div>
  );
};

export default TypingResult;

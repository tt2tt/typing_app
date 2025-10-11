"use client";

import React from "react";


// タイピング問題の表示用props型
type Props = {
  targetKanji: string;    // 問題の漢字
  targetRomaji: string;  // 問題のローマ字
  input: string;         // ユーザーの入力
  isCorrect: boolean;    // 正解判定
};

// タイピング問題の表示コンポーネント
const TypingPrompt: React.FC<Props> = ({ targetKanji, targetRomaji, input, isCorrect }) => {
  return (
    <div
      style={{
        padding: "14px 18px",
        background: isCorrect ? "#e6fff2" : "#f7f7f7", // 正解時は緑系、未正解はグレー
        border: isCorrect ? "1.5px solid #7be495" : "1.5px solid #eaeaea",
        borderRadius: 8,
        fontSize: 26,
        marginBottom: 8,
        letterSpacing: "0.05em",
        textAlign: "center",
        color: "#222",
      }}
    >
      {/* 問題の漢字 */}
      <div style={{ fontWeight: 700 }}>{targetKanji}</div>
      {/* ローマ字の各文字を1文字ずつ表示。正解部分はハイライト */}
      <div style={{ fontWeight: 700, marginTop: 4, wordBreak: "break-all", overflowWrap: "anywhere" }}>
        {targetRomaji?.split("").map((char, idx) => (
          <span
            key={idx}
            style={{
              display: "inline-block",
              backgroundColor: input[idx] === char ? "#ffe066" : "transparent", // 正解部分を黄色でハイライト
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TypingPrompt;

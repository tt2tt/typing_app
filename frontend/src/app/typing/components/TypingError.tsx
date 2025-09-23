"use client";

import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";


// エラー表示用のprops型
type Props = { message?: string };


// タイピングデータ取得エラー時の画面コンポーネント
const TypingError: React.FC<Props> = ({ message }) => {
  return (
    <div
      style={{
        minHeight: "100vh", // 画面全体を覆う
        display: "flex",
        flexDirection: "column",
        background: "#fafbfc", // 薄い背景色
      }}
    >
      {/* ヘッダー */}
      <Header />
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* エラーメッセージ表示 */}
        <div style={{ textAlign: "center", color: "#222" }}>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>読み込みエラー</div>
          <div style={{ fontSize: 14 }}>{message ?? "データが見つかりませんでした。"}</div>
        </div>
      </main>
      {/* フッター */}
      <Footer />
    </div>
  );
};

export default TypingError;


import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";


// タイピング画面用ローディングアニメーションコンポーネント（ヘッダー・フッター付き）
const TypingLoading: React.FC = () => {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fafbfc" }}>
      {/* ヘッダー */}
      <Header />
      <main style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        {/* ローディングアニメーション（1文字ずつバウンド） */}
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "0.05em", color: "#222", textAlign: "center" }}>
          {"Loading".split("").map((ch, i) => (
            <span
              key={i}
              className="loading-bounce"
              style={{
                display: "inline-block",
                animationDelay: `${i * 0.1}s`, // 文字ごとにアニメーション遅延
                marginRight: ch === "g" ? 0 : 2,
              }}
            >
              {ch}
            </span>
          ))}
        </div>
      </main>
      {/* フッター */}
      <Footer />
    </div>
  );
};

export default TypingLoading;

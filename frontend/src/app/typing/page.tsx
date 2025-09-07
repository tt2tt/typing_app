"use client";

// 日本語とローマ字をJSON形式で管理
const typingData = [
  { jp: "こんにちは", roma: "konnichiwa" },
  { jp: "おはようございます", roma: "ohayougozaimasu" },
  { jp: "タイピング練習", roma: "taipingu renshuu" },
  { jp: "プログラミング", roma: "puroguramingu" },
  { jp: "人工知能", roma: "jinkou chinou" },
  { jp: "日本語入力", roma: "nihongo nyuuryoku" },
  { jp: "開発環境", roma: "kaihatsu kankyou" }
];
import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

const getEvaluation = (cps: number) => {
  if (cps >= 7) return "S";
  if (cps >= 6) return "A";
  if (cps >= 5) return "B";
  if (cps >= 4) return "C";
  if (cps >= 3) return "D";
  if (cps >= 2) return "E";
  return "F";
};

const TypingPractice: React.FC = () => {
  const [currentLine, setCurrentLine] = useState(0);
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [lineCorrect, setLineCorrect] = useState(false);
  const [isStarted, setIsStarted] = useState(false); // 練習開始状態
  const inputRef = useRef<HTMLInputElement>(null);

  const target = typingData[currentLine].jp;
  const targetRoma = typingData[currentLine].roma;
  const isCorrect = input === targetRoma;

  React.useEffect(() => {
    if (inputRef.current && isStarted) inputRef.current.focus();
  }, [currentLine, isStarted]);

  const handleInputChange = (val: string) => {
    if (!isStarted) return; // 開始前は入力不可
    setInput(val);
    setTotalCount(totalCount + 1);
    setLineCorrect(val === targetRoma.substring(0, val.length));
    // 正しい文字数カウント（日本語1文字単位）
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetRoma[i]) correct++;
    }
    setCorrectCount(correctCount + (correct - input.length));
    if (!startTime && val.length > 0) setStartTime(Date.now());
    if (val === targetRoma) {
      if (currentLine < typingData.length - 1) {
        setTimeout(() => {
          setCurrentLine(currentLine + 1);
          setInput("");
        }, 500);
      } else {
        setEndTime(Date.now());
        setFinished(true);
      }
    }
  };

  // エンターキー押下で練習開始
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isStarted && e.key === "Enter") {
      setIsStarted(true);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  };

  // 終了後の集計
  let cps = 0, accuracy = 0, evalStr = "";
  if (finished && startTime && endTime) {
    const sec = (endTime - startTime) / 1000;
    const totalRomaChars = typingData.map(d => d.roma).join("").length;
    cps = Math.round(totalRomaChars / sec);
    accuracy = Math.round((correctCount / totalRomaChars) * 100);
    evalStr = getEvaluation(cps);
  }

  // キーボードハイライト用CSSを追加
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `.hg-button-active { background: #ffe066 !important; color: #222 !important; box-shadow: 0 0 8px #ffe066; }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fafbfc" }}>
      <Header />
      <main style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ maxWidth: 480, width: "100%", background: "#fff", border: "1px solid #eaeaea", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 32, color: "#222" }}>
          <h2 style={{ fontFamily: "var(--font-geist-sans)", fontWeight: 700, fontSize: 28, marginBottom: 24, textAlign: "center", color: "#222" }}>タイピング練習</h2>
          {!finished ? (
            <>
              <div style={{ marginBottom: 12, textAlign: "center", color: "#222" }}>
                <span>練習 {currentLine + 1} / {typingData.length}</span>
              </div>
              <div style={{
                padding: "14px 18px",
                background: isCorrect ? "#e6fff2" : "#f7f7f7",
                border: isCorrect ? "1.5px solid #7be495" : "1.5px solid #eaeaea",
                borderRadius: 8,
                fontSize: 26,
                marginBottom: 8,
                letterSpacing: "0.05em",
                textAlign: "center",
                color: "#222"
              }}>
                <div style={{ fontWeight: 700 }}>{target}</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>
                  {targetRoma.split('').map((char, idx) => (
                    <span key={idx} style={{ backgroundColor: input[idx] === char ? "#ffe066" : "transparent" }}>{char}</span>
                  ))}
                </div>
              </div>
              <input
                ref={inputRef}
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ fontSize: 22, width: "100%", padding: "10px 12px", marginBottom: 18, borderRadius: 6, border: "1px solid #eaeaea", outline: "none", boxSizing: "border-box" }}
                disabled={finished}
                placeholder={isStarted ? "ここに入力..." : "エンターキーで開始"}
              />
              <div style={{ marginBottom: 12 }}>
                <Keyboard
                  layout={{
                    default: [
                      "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                      "{tab} q w e r t y u i o p [ ] \\",
                      "{lock} a s d f g h j k l ; ' {enter}",
                      "{shift} z x c v b n m , . / {shift}"
                    ]
                  }}
                  display={typeof target === "string" ? target.split("").reduce((acc, c) => ({ ...acc, [c]: c }), {}) : {}}
                  onChange={handleInputChange}
                  value={input}
                  theme={"hg-theme-default hg-layout-default myTheme"}
                  buttonTheme={(() => {
                    // 開始前はエンターキーのみ色変更
                    if (!isStarted) {
                      return [{ class: "hg-button-active", buttons: "{enter}" }];
                    }
                    // キーボード上に存在するキーのみハイライト
                    const keyboardKeys = "`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./".split("");
                    const latestChar = input.slice(-1);
                    if (!latestChar) return [];
                    if (keyboardKeys.includes(latestChar.toLowerCase())) {
                      return [{ class: "hg-button-active", buttons: latestChar.toLowerCase() }];
                    }
                    return [];
                  })()}
                />
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", color: "#222" }}>
              <h3 style={{ fontSize: 22, marginBottom: 18, color: "#222" }}>結果</h3>
              <p style={{ fontSize: 18, color: "#222" }}>1秒間の文字入力数: <b style={{ color: "#222" }}>{cps}</b></p>
              <p style={{ fontSize: 18, color: "#222" }}>正答率: <b style={{ color: "#222" }}>{accuracy}%</b></p>
              <p style={{ fontSize: 18, color: "#222" }}>評価: <b style={{ color: "#222" }}>{evalStr}</b></p>
              <button
                style={{
                  marginTop: 24,
                  padding: "10px 32px",
                  fontSize: 18,
                  background: "#ffe066",
                  color: "#222",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 700
                }}
                onClick={() => window.location.href = "/"}
              >戻る</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TypingPractice;

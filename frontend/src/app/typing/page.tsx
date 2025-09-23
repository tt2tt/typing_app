"use client";

// 必要なReactフックやコンポーネントをインポート
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TypingPrompt from "./components/TypingPrompt";
import TypingKeyboard from "./components/TypingKeyboard";
import TypingResult from "./components/TypingResult";
import TypingLoading from "./components/TypingLoading";
import TypingError from "./components/TypingError";

// 型定義：タイピング1行分のデータ
type TypingItem = { kanji: string; romaji: string };

// スコア評価関数
const getEvaluation = (cps: number) => {
  if (cps >= 7) return "S";
  if (cps >= 6) return "A";
  if (cps >= 5) return "B";
  if (cps >= 4) return "C";
  if (cps >= 3) return "D";
  if (cps >= 2) return "E";
  return "F";
};

// APIレスポンスを安全にパースする関数
const parseTypingResponse = (response: any): TypingItem[] => {
  // レスポンスの成形
  try {
    // 配列ならそのまま使用
    if (Array.isArray(response)) return response as TypingItem[];

    // テキストをJsonに変更
    if (response && typeof response.text === "string") {
      let jsonText = response.text.trim();
      if (jsonText.startsWith("```json")) jsonText = jsonText.replace(/^```json\n?/, "");
      if (jsonText.endsWith("```")) jsonText = jsonText.replace(/```$/, "");
      const data = JSON.parse(jsonText);
      return Array.isArray(data) ? (data as TypingItem[]) : [];
    }
  } catch (e) {
    console.error("Error parsing typing data:", e, response);
  }
  return [];
};

// タイピングデータを取得するカスタムフック（中断・エラー対応）
const useTypingData = (category: string) => {
  // useStateの定義
  const [data, setData] = useState<TypingItem[]>([]); // タイピングデータ
  const [loading, setLoading] = useState(true); // ローディング状態
  const [error, setError] = useState<string | null>(null); // タイピングデータの取得エラー

  useEffect(() => {
    // AbortControllerのインスタンスを作成
    const ac = new AbortController();
    const fetchData = async () => {

      // useStateの初期化
      setLoading(true);
      setError(null);

      try {
        // タイピングデータの取得
        const url = `${process.env.NEXT_PUBLIC_API_BASE}/api/prompt?category=${encodeURIComponent(category)}`;
        const res = await fetch(url, { signal: ac.signal });
        const body = await res.json();

        // レスポンスの成形
        const items = parseTypingResponse(body);

        // タイピングデータの更新
        setData(items);
      
      // エラーの場合はローディングを中止
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Error fetching typing data:", err);
        setError("データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => ac.abort();
  }, [category]);

  return { data, loading, error } as const;
};

// タイピング進行・状態管理用カスタムフック
const useTypingSession = (typingData: TypingItem[]) => {
  // useStateの定義
  const [currentLine, setCurrentLine] = useState(0); // 現在の行番号
  const [input, setInput] = useState(""); // 入力中の文字列
  const [startTime, setStartTime] = useState<number | null>(null); // 開始時刻（ミリ秒）
  const [endTime, setEndTime] = useState<number | null>(null); // 終了時刻（ミリ秒）
  const [correctCount, setCorrectCount] = useState(0); // 正しく入力できた文字数の合計
  const [finished, setFinished] = useState(false); // タイピング終了フラグ
  const [isStarted, setIsStarted] = useState(false); // タイピング開始フラグ
  const inputRef = useRef<HTMLInputElement>(null); // 入力欄への参照
  const prevCorrectRef = useRef(0); // 現在の行における直近の正答数（差分更新用）

  // useStateの初期化
  useEffect(() => {
    setCurrentLine(0);
    setInput("");
    setStartTime(null);
    setEndTime(null);
    setCorrectCount(0);
    setFinished(false);
    setIsStarted(false);
    prevCorrectRef.current = 0;
  }, [typingData]);

  // 現在の行のデータを設定
  const target = typingData[currentLine]?.kanji ?? "";
  const targetRoma = typingData[currentLine]?.romaji ?? "";
  const isCorrect = input === targetRoma;

  // 常に入力欄にフォーカスする
  useEffect(() => {
    if (inputRef.current && isStarted) inputRef.current.focus();
  }, [currentLine, isStarted]);

  // ユーザー入力を受け取るコールバック関数
  const handleInputChange = useCallback(
    (val: string) => {
      // 開始前は処理しない
      if (!isStarted) return;
      setInput(val);

  // 先頭から一致する正しい文字数をカウント
  let correct = 0;
      const len = Math.min(val.length, targetRoma.length);
      for (let i = 0; i < len; i++) {
        if (val[i] === targetRoma[i]) correct++;
        else break; // 先頭一致のみをカウント
      }

      // 差分だけ全体正答数に加算
      const delta = correct - prevCorrectRef.current;
      if (delta !== 0) setCorrectCount((c) => c + delta);
      prevCorrectRef.current = correct;
      
      // 開始時間の設定
      if (!startTime && val.length > 0) setStartTime(Date.now());

      // 完全一致した場合、次の行へ（最後の行なら終了）
      if (val === targetRoma) {
        if (currentLine < typingData.length - 1) {
          setTimeout(() => {
            setCurrentLine((i) => i + 1);
            setInput("");
            prevCorrectRef.current = 0; // 次の行用にリセット
          }, 500);
        } else {
          setEndTime(Date.now());
          setFinished(true);
        }
      }
    },
    [isStarted, startTime, targetRoma, currentLine, typingData.length]
  );

  // タイピングの開始
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isStarted && e.key === "Enter") {
      setIsStarted(true);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  }, [isStarted]);

  // 集計（スコア・正答率など）
  const stats = useMemo(() => {
    if (!finished || !startTime || !endTime) return { cps: 0, accuracy: 0, evalStr: "" };
    const sec = (endTime - startTime) / 1000;
    const totalRomaChars = typingData.map((d) => d.romaji).join("").length;
    const cps = Math.round(totalRomaChars / sec);
    const accuracy = Math.round((correctCount / totalRomaChars) * 100);
    const evalStr = getEvaluation(cps);
    return { cps, accuracy, evalStr };
  }, [finished, startTime, endTime, typingData, correctCount]);

  return {
    // state
    currentLine,
    input,
    startTime,
    endTime,
    correctCount,
    finished,
    isStarted,
    inputRef,
    // derived
    target,
    targetRoma,
    isCorrect,
    stats,
    // handlers
    handleInputChange,
    handleKeyDown,
    setIsStarted,
  } as const;
};

// メインのタイピング練習ページコンポーネント
const TypingPractice: React.FC = () => {
  // 使用するカテゴリーの取得
  const searchParams = useSearchParams();
  const category = (searchParams.get("category") || "animal").trim();

  const { data: typingData, loading, error } = useTypingData(category);
  const session = useTypingSession(typingData);

  // キーボードハイライト用のスタイルを動的に追加
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML =
      ".hg-button-active { background: #ffe066 !important; color: #222 !important; box-shadow: 0 0 8px #ffe066; }";
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ローディング・エラー時の分岐
  if (loading) return <TypingLoading />;
  if (error || typingData.length === 0) return <TypingError message={error ?? "データが見つかりませんでした。"} />;

  // JSX: タイピング練習画面のレイアウト
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#fafbfc",
      }}
    >
      <Header />
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            background: "#fff",
            border: "1px solid #eaeaea",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: 32,
            color: "#222",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontWeight: 700,
              fontSize: 28,
              marginBottom: 24,
              textAlign: "center",
              color: "#222",
            }}
          >
            タイピング練習
          </h2>
          {!session.finished ? (
            <>
              <div
                style={{
                  marginBottom: 12,
                  textAlign: "center",
                  color: "#222",
                }}
              >
                <span>
                  練習 {session.currentLine + 1} / {typingData.length}
                </span>
              </div>
              <TypingPrompt
                targetKanji={session.target}
                targetRomaji={session.targetRoma}
                input={session.input}
                isCorrect={session.isCorrect}
              />
              <input
                ref={session.inputRef}
                value={session.input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  session.handleInputChange(e.target.value)
                }
                onKeyDown={session.handleKeyDown}
                style={{
                  fontSize: 22,
                  width: "100%",
                  padding: "10px 12px",
                  marginBottom: 18,
                  borderRadius: 6,
                  border: "1px solid #eaeaea",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                disabled={session.finished}
                placeholder={session.isStarted ? "ここに入力..." : "エンターキーで開始"}
              />
              <div style={{ marginBottom: 12 }}>
                <TypingKeyboard
                  targetLabel={session.target}
                  input={session.input}
                  isStarted={session.isStarted}
                  onChange={session.handleInputChange}
                />
              </div>
            </>
          ) : (
            <TypingResult
              cps={session.stats.cps}
              accuracy={session.stats.accuracy}
              evalStr={session.stats.evalStr}
              onRetry={() => (window.location.href = `/typing?category=${encodeURIComponent(category)}`)}
              onBack={() => (window.location.href = "/")}
              categoryLabel={category}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TypingPractice;
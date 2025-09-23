"use client";

import React, { useMemo } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

type Props = {
  targetLabel?: string;
  input: string;
  isStarted: boolean;
  onChange: (value: string) => void;
};


// タイピング用カスタムキーボードコンポーネント
const TypingKeyboard: React.FC<Props> = ({ targetLabel, input, isStarted, onChange }) => {
  // アクティブなキーに色を付けるためのテーマ設定
  const buttonTheme = useMemo(() => {
    // 開始時はエンターキーをハイライト
    if (!isStarted) return [{ class: "hg-button-active", buttons: "{enter}" }];

    const keyboardKeys = "`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./".split(""); // キーボードのキー一覧
    const latestChar = input.slice(-1); // 入力中の最後の文字

    // 入力中のキーをハイライト
    if (!latestChar) return [];
    if (keyboardKeys.includes(latestChar.toLowerCase())) {
      return [{ class: "hg-button-active", buttons: latestChar.toLowerCase() }];
    }
    return [];
  }, [isStarted, input]);

  // 問題文の文字をキーボード上に表示するためのマッピング
  // react-simple-keyboardデフォルトの引数今回は使用していない
  const display = useMemo(() => {
    if (!targetLabel) return {} as Record<string, string>;
    return targetLabel.split("").reduce((acc, c) => ({ ...acc, [c]: c }), {} as Record<string, string>);
  }, [targetLabel]);

  return (
    <Keyboard
      layout={{
        default: [
          "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
          "{tab} q w e r t y u i o p [ ] \\",
          "{lock} a s d f g h j k l ; ' {enter}",
          "{shift} z x c v b n m , . / {shift}",
        ],
      }}
      display={display}
      onChange={onChange} // 入力値変更時のコールバック
      value={input}
      theme={"hg-theme-default hg-layout-default myTheme"}
      buttonTheme={buttonTheme}
    />
  );
};

export default TypingKeyboard;

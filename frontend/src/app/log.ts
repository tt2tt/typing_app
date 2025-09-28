// 開発・検証用のログ出力関数
// 本番環境（production）以外でのみconsole.logを出力
export const log = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[app]', ...args);
  }
};

// ファイル操作用モジュール
import { appendFile } from "fs";
import { join } from "path";

// エラー内容をlog/error.logファイルに追記する関数
export function writeErrorLog(error: unknown) {
  const logPath = join(process.cwd(), "log", "error.log");
  const message =
    `[${new Date().toISOString()}] ` +
    (error instanceof Error ? error.stack || error.message : String(error));
  appendFile(logPath, message + "\n", (err) => {
    if (err) console.error("ログ書き込みエラー:", err);
  });
}

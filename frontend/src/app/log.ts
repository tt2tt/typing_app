import { appendFile } from "fs";
import { join } from "path";

// エラーログをファイルに追記
export function writeErrorLog(error: unknown) {
  const logPath = join(process.cwd(), "log", "error.log");
  const message =
    `[${new Date().toISOString()}] ` +
    (error instanceof Error ? error.stack || error.message : String(error));
  appendFile(logPath, message + "\n", (err) => {
    if (err) console.error("ログ書き込みエラー:", err);
  });
}

// Node.jsのパス操作用モジュールをインポート
import { dirname } from "path";
import { fileURLToPath } from "url";
// ESLintの互換性レイヤーをインポート
import { FlatCompat } from "@eslint/eslintrc";


// 現在のファイル・ディレクトリ名を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// 旧形式のESLint設定を新形式に変換するためのインスタンス
const compat = new FlatCompat({
  baseDirectory: __dirname,
});


// ESLintの設定内容
const eslintConfig = [
  // Next.js推奨設定とTypeScript対応
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // 無視するファイル・ディレクトリ
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];


// 設定をエクスポート
export default eslintConfig;

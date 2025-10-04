import tailwind from '@tailwindcss/postcss'

// PostCSSの設定オブジェクト
const config = {
  // 使用するPostCSSプラグインの一覧（関数を渡す）
  plugins: [tailwind],
}

// 設定をエクスポート
export default config

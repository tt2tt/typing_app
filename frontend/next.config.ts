// Next.jsの型定義をインポート
import type { NextConfig } from "next";

// NEXT_PUBLIC_API_BASE 環境変数を利用してAPIリライト先を動的に切り替え
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://backend:8000";
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_BASE}/api/:path*` },
    ];
  },
};

// 設定をエクスポート
export default nextConfig;

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// next/navigationのルーター関連メソッドをモック化
vi.mock('next/navigation', () => {
  const mockRouter = {
    push: vi.fn(), // ページ遷移(push)のモック
    replace: vi.fn(), // ページ遷移(replace)のモック
    prefetch: vi.fn().mockResolvedValue(undefined), // prefetchのモック
  }
  return {
    useRouter() {
      return mockRouter // useRouterでモックを返す
    },
    useSearchParams() {
      const params = new URLSearchParams('')
      return {
        get: (key: string) => params.get(key), // クエリ取得のモック
      }
    },
    // テストで呼び出し回数などを検証するためのexport
    mockRouter,
  }
})

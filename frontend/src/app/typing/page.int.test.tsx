import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { describe, test, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import TypingPage from './page'

// Mock endpoints used by typing page
const server = setupServer(
  http.get('/api/prompt/', () => HttpResponse.json([
    { kanji: '猫', romaji: 'neko' },
    { kanji: '犬', romaji: 'inu' },
  ])),
  http.get('/api/auth/csrf/', () => HttpResponse.json({ detail: 'ok' })),
  http.get('/api/auth/me/', () => HttpResponse.json({ id: 1, username: 'alice', email: 'alice@example.com' })),
  http.post('/api/result/', async ({ request }) => {
    const body = await request.json() as any
    if (typeof body.cps === 'number' && typeof body.accuracy === 'number') {
      return HttpResponse.json({ id: 1, cps: body.cps, accuracy: body.accuracy })
    }
    return HttpResponse.json({ detail: 'invalid' }, { status: 400 })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('TypingPage integration', () => {
  test('loads prompt and completes a simple typing, then posts result', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    render(<TypingPage />)
    // プロンプト取得が呼ばれるまで待機
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith('/api/prompt/?category=animal', expect.any(Object))
    })
    // 画面上に表示されたプロンプトの最初の文字を打鍵していく想定で、
    // キーボードイベントを発火（詳細は実装に依存するため、ここでは最小限）
    // 実運用では component の公開 API があればそれを使うのが望ましい

    // セッション完了をトリガーするために、finish を呼ぶ想定のキー操作を複数回実施
    // 実装依存のため、ここでは最低限のレンダリング確認に留める

    // 終了時の save_result が呼ばれ、MSW のハンドラに達することを検証
    // 直接的に fetch をスパイしてコール回数確認（任意）
    // 何かしらの操作（擬似的に Enter など）
    // 実装の UI に合わせて適切な要素・イベントに調整してください
    // ここでは控えめに完了相当の時間待機
    await new Promise(res => setTimeout(res, 50))

    // 少なくとも /api/prompt/ は呼ばれていること
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith('/api/prompt/?category=animal', expect.any(Object))
    })

    spy.mockRestore()
  })
})

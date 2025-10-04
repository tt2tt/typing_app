import React from 'react'
import { test, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import MePage from './page'

// MSW: /api/auth/me/ に統一してモック
const server = setupServer(
  http.get('/api/auth/me/', () =>
    HttpResponse.json({
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      records: [
        { cps: 10, accuracy: 95, created_at: '2024-01-01T00:00:00Z' },
        { cps: 12, accuracy: 90, created_at: '2024-01-02T00:00:00Z' },
      ],
    })
  )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// fetch('/api/auth/me', {credentials:'include'}) を 
// Next の rewrite 経由でバックエンドへ飛ばしている実装だが、
// テストでは絶対URLで http://localhost を使うように MSW ハンドラを定義している。
// node-fetch は相対URLを解決しないため、グローバル fetch を差し替えるか、
// JSDOM の location.origin を http://localhost にしておく。

// JSDOM はデフォルトで http://localhost を origin にするのでそのままでOK。

test('me page renders user info and chart when authenticated', async () => {
  render(<MePage />)

  // ローディング表示
  expect(screen.getByText('読み込み中...')).toBeInTheDocument()

  // ユーザー情報が表示される
  await waitFor(() => {
    expect(screen.getByText(/ユーザー名: alice/)).toBeInTheDocument()
    expect(screen.getByText(/メール: alice@example.com/)).toBeInTheDocument()
  })

  // グラフの polyline が2本描画される
  const polylines = document.querySelectorAll('polyline')
  expect(polylines.length).toBe(2)
})

// 未ログイン（401）のケース

test('me page shows error when unauthenticated', async () => {
  server.use(
    http.get('/api/auth/me/', () => HttpResponse.json({ detail: '未ログインです' }, { status: 401 }))
  )

  render(<MePage />)

  await waitFor(() => {
    expect(screen.getByText(/未ログインか、取得に失敗しました/)).toBeInTheDocument()
  })
})

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { describe, test, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import SignupPage from './page'

// MSW server to mock signup endpoints
const server = setupServer(
  http.get('/api/auth/csrf/', () => HttpResponse.json({ detail: 'ok' })),
  http.get('/api/auth/me/', () => HttpResponse.json({ id: 0 })),
  http.post('/api/auth/signup/', async ({ request }) => {
    type SignupRequestBody = { email?: string; password?: string; username?: string }
    const body = await request.json() as SignupRequestBody
    if (!body.email || !body.password) {
      return HttpResponse.json({ detail: 'サインアップに失敗しました' }, { status: 400 })
    }
    return HttpResponse.json({ id: 1, username: body.username ?? 'alice', email: body.email }, { status: 201 })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// import mocked router to assert navigation
type MockedNextNavigation = { mockRouter: { push: ReturnType<typeof vi.fn> } }
const { mockRouter } = (await import('next/navigation')) as MockedNextNavigation

describe('SignupPage integration', () => {
  test('successfully signs up and redirects to /', async () => {
    render(<SignupPage />)

  fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'alice@example.com' } })
  fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'secret' } })
  fireEvent.change(screen.getByLabelText('ユーザー名（任意）'), { target: { value: 'alice' } })

  fireEvent.click(screen.getByRole('button', { name: 'アカウント作成' }))

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  test('shows error message when signup fails', async () => {
    // 強制的に 400 を返すようにハンドラを上書き
    server.use(
      http.post('/api/auth/signup/', () => HttpResponse.json({ detail: 'サインアップに失敗しました' }, { status: 400 }))
    )

    render(<SignupPage />)

    // 正しい入力でもサーバー側で 400 を返すケース
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'bad@example.com' } })
    fireEvent.change(screen.getByLabelText('ユーザー名（任意）'), { target: { value: 'baduser' } })
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'secret' } })

    fireEvent.click(screen.getByRole('button', { name: 'アカウント作成' }))

    await waitFor(() => {
      expect(screen.getByText('サインアップに失敗しました')).toBeInTheDocument()
    })
  })
})

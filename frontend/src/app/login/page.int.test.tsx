import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { describe, test, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import LoginPage from './page'

// MSW server to mock auth endpoints
const server = setupServer(
  http.get('/api/auth/csrf/', () => HttpResponse.json({ detail: 'ok' })),
  http.get('/api/auth/me/', () => HttpResponse.json({ id: 0 })),
  http.post('/api/auth/login/', async ({ request }) => {
    type LoginRequestBody = { identifier: string; password: string }
    const body = await request.json() as LoginRequestBody
    if ((body.identifier === 'alice' || body.identifier === 'alice@example.com') && body.password === 'secret') {
      return HttpResponse.json({ id: 1, username: 'alice', email: 'alice@example.com' })
    }
    return HttpResponse.json({ detail: 'ログインに失敗しました' }, { status: 400 })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// get mocked router from setup to assert navigation
type MockedNextNavigation = { mockRouter: { push: ReturnType<typeof vi.fn> } }
const { mockRouter } = (await import('next/navigation')) as MockedNextNavigation

describe('LoginPage integration', () => {
  test('successfully logs in and redirects to /', async () => {
    render(<LoginPage />)

    // Fill form
    fireEvent.change(screen.getByLabelText('メールまたはユーザー名'), { target: { value: 'alice' } })
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'secret' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    // Wait redirect
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  test('shows error message on invalid credentials', async () => {
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('メールまたはユーザー名'), { target: { value: 'bob' } })
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'wrong' } })

    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(screen.getByText('ログインに失敗しました')).toBeInTheDocument()
    })
  })
})

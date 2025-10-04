import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation if needed
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: () => {},
      replace: () => {},
      prefetch: () => Promise.resolve(),
    }
  },
}))

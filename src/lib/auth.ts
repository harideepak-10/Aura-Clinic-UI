import { create } from 'zustand'
import { api, tokenStore, USE_MOCKS } from './api'
import { mockUser } from './mockData'
import type { User } from './types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hydrate: () => Promise<void>
}

// Computed once at module load (before the first render) so a direct
// navigation or refresh on any route doesn't briefly render as
// "logged out" and bounce through /login — that race is what causes a
// hard refresh on, say, /appointments to land back on the dashboard.
const initialToken = tokenStore.getAccess()

export const useAuth = create<AuthState>((set) => ({
  user: initialToken && USE_MOCKS ? mockUser : null,
  isAuthenticated: !!initialToken,
  isLoading: false,
  error: null,

  // Confirms/refreshes the real user object once the API is reachable.
  // In mock mode there's nothing more to fetch. On a real backend, an
  // invalid/expired token logs the user back out.
  hydrate: async () => {
    if (!initialToken || USE_MOCKS) return
    try {
      const me = await api.get('/users/me/')
      set({ user: me.data, isAuthenticated: true })
    } catch {
      tokenStore.clear()
      set({ user: null, isAuthenticated: false })
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      if (USE_MOCKS) {
        await new Promise((r) => setTimeout(r, 500))
        tokenStore.set('mock-access-token', 'mock-refresh-token')
        set({ user: mockUser, isAuthenticated: true, isLoading: false })
        return
      }
      const { data } = await api.post('/token/', { email, password })
      tokenStore.set(data.access, data.refresh)
      const me = await api.get('/users/me/')
      set({ user: me.data, isAuthenticated: true, isLoading: false })
    } catch {
      set({ error: 'Invalid email or password. Please try again.', isLoading: false })
    }
  },

  logout: () => {
    tokenStore.clear()
    set({ user: null, isAuthenticated: false })
  },
}))

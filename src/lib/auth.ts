import { create } from 'zustand'
import { api, apiErrorMessage, tokenStore } from './api'
import type { AuthUser } from './types'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hydrate: () => Promise<void>
}

// Computed once at module load (before the first render) so a direct
// navigation or refresh on any route doesn't briefly render as
// "logged out" and bounce through /login before hydrate() confirms the
// token — that race is what causes a hard refresh on, say,
// /appointments to land back on the dashboard.
const initialToken = tokenStore.getAccess()

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!initialToken,
  isLoading: false,
  error: null,

  // Confirms the token against /users/me/ once the app mounts. An
  // invalid/expired token (backend restarted, blacklisted, etc.) logs
  // the user back out instead of leaving a broken "authenticated" shell.
  hydrate: async () => {
    if (!initialToken) return
    try {
      const { data } = await api.get('/users/me/')
      set({ user: data, isAuthenticated: true })
    } catch {
      tokenStore.clear()
      set({ user: null, isAuthenticated: false })
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/users/login/', { email, password })
      tokenStore.set(data.token, data.refresh_token)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      set({ error: apiErrorMessage(err, 'Invalid email or password.'), isLoading: false })
    }
  },

  logout: () => {
    const refreshToken = tokenStore.getRefresh()
    tokenStore.clear()
    set({ user: null, isAuthenticated: false })
    if (refreshToken) {
      // Best-effort blacklist — fine if it fails, the tokens are already gone client-side.
      api.post('/users/logout/', { refresh_token: refreshToken }).catch(() => {})
    }
  },
}))

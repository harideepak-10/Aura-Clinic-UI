import axios from 'axios'

// The real Aura Django/DRF backend, mounted at /api on Render.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://auro-backend-api.onrender.com/api'

const ACCESS_TOKEN_KEY = 'aura.accessToken'
const REFRESH_TOKEN_KEY = 'aura.refreshToken'

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (access: string, refresh?: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Aura's own /users/refresh/ endpoint (not DRF SimpleJWT's default path):
// POST { refresh_token } -> { token, role_id, role, user }
let refreshing: Promise<string | null> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && tokenStore.getRefresh()) {
      original._retry = true
      refreshing =
        refreshing ??
        api
          .post('/users/refresh/', { refresh_token: tokenStore.getRefresh() })
          .then((res) => {
            tokenStore.set(res.data.token)
            return res.data.token as string
          })
          .catch(() => {
            tokenStore.clear()
            return null
          })
          .finally(() => {
            refreshing = null
          })

      const newToken = await refreshing
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }
    }
    return Promise.reject(error)
  },
)

// Aura's DRF error bodies are usually { error: "..." } (custom views) or
// field-keyed validation errors (ModelSerializer defaults). This pulls a
// single human-readable message out of either shape.
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (typeof data === 'string') return data
    if (data?.error) return data.error
    if (data?.detail) return data.detail
    if (data && typeof data === 'object') {
      const firstKey = Object.keys(data)[0]
      const firstVal = firstKey ? (data as Record<string, unknown>)[firstKey] : null
      if (Array.isArray(firstVal)) return String(firstVal[0])
      if (typeof firstVal === 'string') return firstVal
    }
    if (err.message === 'Network Error') return "Can't reach the Aura backend right now. Check your connection or try again shortly."
  }
  return fallback
}

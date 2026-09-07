import axios from 'axios'

// Point this at the real Aura Django/DRF backend when it's ready:
//   VITE_API_BASE_URL=https://your-render-app.onrender.com/api
// Until then, or whenever it's unreachable, the app runs on mock data
// (see lib/dataSource.ts) so the UI is fully explorable standalone.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
export const USE_MOCKS = !API_BASE_URL || import.meta.env.VITE_USE_MOCKS === 'true'

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

// Simple JWT refresh-on-401 flow matching DRF SimpleJWT's
// /token/ and /token/refresh/ endpoints.
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
          .post('/token/refresh/', { refresh: tokenStore.getRefresh() })
          .then((res) => {
            tokenStore.set(res.data.access)
            return res.data.access as string
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

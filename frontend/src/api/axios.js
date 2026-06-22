import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({ baseURL })

// Attach the access token to every request if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If a request fails with 401, try refreshing the token once, then retry
let isRefreshing = false
let refreshQueue = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    if (!response || response.status !== 401 || config._retried) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      return Promise.reject(error)
    }

    config._retried = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject, config })
      })
    }

    isRefreshing = true
    try {
      const { data } = await axios.post(`${baseURL}/auth/login/refresh/`, {
        refresh: refreshToken,
      })
      localStorage.setItem('access_token', data.access)
      refreshQueue.forEach(({ resolve, config: queuedConfig }) => {
        queuedConfig.headers.Authorization = `Bearer ${data.access}`
        resolve(api(queuedConfig))
      })
      refreshQueue = []
      config.headers.Authorization = `Bearer ${data.access}`
      return api(config)
    } catch (refreshError) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      refreshQueue.forEach(({ reject }) => reject(refreshError))
      refreshQueue = []
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api

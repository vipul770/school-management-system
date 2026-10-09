import axios from 'axios'
import { tokenManager } from '../store/tokenManager'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api/v1', withCredentials: true })
api.interceptors.request.use((config) => { const token = tokenManager.get(); if (token) config.headers.Authorization = `Bearer ${token}`; return config })
api.interceptors.response.use((response) => response, async (error) => {
  const request = error.config
  if (error.response?.status === 401 && request && !request._refreshAttempt && !request.url?.includes('/auth/refresh/')) {
    request._refreshAttempt = true
    try { const { data } = await api.post('/auth/refresh/'); tokenManager.set(data.access); request.headers.Authorization = `Bearer ${data.access}`; return api(request) }
    catch { tokenManager.clear() }
  }
  return Promise.reject(error)
})

import { api } from './api'
export const login = (credentials) => api.post('/auth/login/', credentials)
export const logout = () => api.post('/auth/logout/')
export const refresh = () => api.post('/auth/refresh/')
export const currentUser = () => api.get('/auth/me/')

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { tokenManager } from '../tokenManager'

export const api = createApi({ reducerPath: 'api', baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL || '/api/v1', credentials: 'include', prepareHeaders: (headers) => { const token = tokenManager.get(); if (token) headers.set('authorization', `Bearer ${token}`); return headers } }), endpoints: () => ({}) })

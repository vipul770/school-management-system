import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import schoolReducer from './slices/schoolSlice'
import { api } from './services/api'

export const store = configureStore({ reducer: { auth: authReducer, ui: uiReducer, school: schoolReducer, [api.reducerPath]: api.reducer }, middleware: (getDefault) => getDefault().concat(api.middleware) })

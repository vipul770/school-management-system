import { createSlice } from '@reduxjs/toolkit'
import { tokenManager } from '../tokenManager'

const authSlice = createSlice({ name: 'auth', initialState: { user: null, authenticated: false, restored: false }, reducers: {
  signedIn(state, action) { state.user = action.payload.user; state.authenticated = true; state.restored = true; tokenManager.set(action.payload.access) },
  signedOut(state) { state.user = null; state.authenticated = false; state.restored = true; tokenManager.clear() },
} })
export const { signedIn, signedOut } = authSlice.actions
export default authSlice.reducer

import { createSlice } from '@reduxjs/toolkit'
const slice=createSlice({name:'ui',initialState:{sidebarOpen:false,toast:null},reducers:{setSidebarOpen(s,a){s.sidebarOpen=a.payload},showToast(s,a){s.toast=a.payload},clearToast(s){s.toast=null}}})
export const {setSidebarOpen,showToast,clearToast}=slice.actions
export default slice.reducer

import { createSlice } from '@reduxjs/toolkit'
const slice=createSlice({name:'school',initialState:{activeSchool:null},reducers:{setActiveSchool(s,a){s.activeSchool=a.payload},clearActiveSchool(s){s.activeSchool=null}}})
export const {setActiveSchool,clearActiveSchool}=slice.actions
export default slice.reducer

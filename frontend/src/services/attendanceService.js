import { api } from './api'
export const attendanceService={sessions:()=>api.get('/attendance/sessions/'),createSession:(data)=>api.post('/attendance/sessions/',data),students:(id)=>api.get(`/attendance/sessions/${id}/students/`),submit:(id,records)=>api.post(`/attendance/sessions/${id}/submit/`,{records})}

import { api } from './api'
export const studentService={list:(params)=>api.get('/students/',{params}),create:(data)=>api.post('/students/',data),detail:(id)=>api.get(`/students/${id}/`),attendance:(id)=>api.get(`/students/${id}/attendance-summary/`),fees:(id)=>api.get(`/students/${id}/fee-account/`),results:(id)=>api.get(`/students/${id}/results/`)}

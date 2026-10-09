import { api } from '../services/api'
export const studentsApi=api.injectEndpoints({endpoints:(build)=>({getStudents:build.query({query:(params='')=>`/students/${params}`}),createStudent:build.mutation({query:(body)=>({url:'/students/',method:'POST',body})})})})
export const {useGetStudentsQuery,useCreateStudentMutation}=studentsApi

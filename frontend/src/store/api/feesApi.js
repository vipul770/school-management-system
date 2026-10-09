import { api } from '../services/api'
export const feesApi=api.injectEndpoints({endpoints:(build)=>({getFeeTransactions:build.query({query:()=>'/fees/transactions/'}),createFeeTransaction:build.mutation({query:(body)=>({url:'/fees/transactions/',method:'POST',body})}),getDefaulters:build.query({query:()=>'/fees/accounts/defaulters/'})})})
export const {useGetFeeTransactionsQuery,useCreateFeeTransactionMutation,useGetDefaultersQuery}=feesApi

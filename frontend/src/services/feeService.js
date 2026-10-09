import { api } from './api'
export const feeService={transactions:()=>api.get('/fees/transactions/'),recordPayment:(data)=>api.post('/fees/transactions/',data),defaulters:()=>api.get('/fees/defaulters/'),sendReminders:()=>api.post('/fees/send-reminders/')}

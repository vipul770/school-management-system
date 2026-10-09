import { CartesianGrid, Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function LineChart({data=[],dataKey='value',nameKey='name',color='#416d82'}){return <ResponsiveContainer width="100%" height={220}><RechartsLineChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey={nameKey}/><YAxis/><Tooltip/><Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false}/></RechartsLineChart></ResponsiveContainer>}

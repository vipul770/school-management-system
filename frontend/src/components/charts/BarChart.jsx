import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function BarChart({data=[],dataKey='value',nameKey='name',color='#75aa9d'}){return <ResponsiveContainer width="100%" height={220}><RechartsBarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey={nameKey}/><YAxis/><Tooltip/><Bar dataKey={dataKey} fill={color} radius={[5,5,0,0]}/></RechartsBarChart></ResponsiveContainer>}

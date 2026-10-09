import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Users, GraduationCap, DoorOpen, CalendarCheck, Wallet, ArrowUpRight } from 'lucide-react'
import { api } from '../../services/api'
import { navigation } from '../../config/modules'
import { NavLink } from 'react-router-dom'
import { signedOut } from '../../store/slices/authSlice'
const AttendanceChart = lazy(() => import('../../components/charts/AttendanceChart'))

export default function DashboardPage() {
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [summary,setSummary] = useState(null)
  useEffect(()=>{api.get('/dashboard/summary/').then(({data})=>setSummary(data)).catch(()=>setSummary({}))},[])
  function logout() { dispatch(signedOut()); navigate('/login') }
  const metrics=[['Students',summary?.students,Users],['Teachers',summary?.teachers,GraduationCap],['Classes',summary?.classes,DoorOpen],['Attendance today',`${summary?.attendance_rate||0}%`,CalendarCheck],['Collected this month',summary?.fee_collected_month,Wallet]]
  return <main className="dashboard-home"><div className="welcome-row"><div><div className="eyebrow page-eyebrow">SCHOOL OVERVIEW</div><h1>Good day{user?.first_name ? `, ${user.first_name}` : ''}.</h1><p>Here is what is happening at {user?.organization_id || 'your school'}.</p></div></div><div className="metric-grid">{metrics.map(([title,value,Icon])=><article className="metric-card" key={title}><div className="metric-icon"><Icon size={18}/></div><span>{title}</span><strong>{value===undefined?'—':value}</strong></article>)}</div><div className="dashboard-sections"><section className="module-shortcuts"><div className="section-title"><div><h2>Your modules</h2><p>Keep the school day moving.</p></div></div><div className="shortcut-grid">{navigation.filter(([, , ,roles])=>roles==='all'||roles.split(',').includes(user?.role)).filter(([key])=>key!=='dashboard').map(([key,title,path])=><NavLink className="shortcut-card" key={key} to={path}><span>{title}</span><ArrowUpRight size={17}/></NavLink>)}</div></section><section className="due-card dashboard-attendance"><div className="eyebrow page-eyebrow">TODAY</div><h2>Attendance rate</h2><Suspense fallback={<div className="attendance-chart"/>}><AttendanceChart rate={summary?.attendance_rate||0}/></Suspense><p>{summary?.upcoming_assignments?`${summary.upcoming_assignments} assignments due soon.`:'Attendance and learning progress at a glance.'}</p>{user?.role==='school_admin'||user?.role==='accountant'?<><div className="eyebrow page-eyebrow">FEE SUMMARY</div><strong>{summary?.pending_dues===undefined?'—':summary.pending_dues}</strong><p>Outstanding fee balances.</p><NavLink to="/fees">Open fee management <ArrowUpRight size={15}/></NavLink></>:null}</section></div></main>
}

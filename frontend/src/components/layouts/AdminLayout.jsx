import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { navigation } from '../../config/modules'
import useAuth from '../../hooks/useAuth'
import { signedOut } from '../../store/slices/authSlice'
import { logout } from '../../services/authService'
import Brand from '../ui/Brand'

export default function AdminLayout() {
  const { user } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const visible = navigation.filter(([, , , roles]) => roles === 'all' || roles.split(',').includes(user?.role))
  async function signOut() { try { await logout() } catch {} dispatch(signedOut()); navigate('/login') }
  return <div className="app-shell"><aside className="sidebar"><Brand/><div className="side-school"><span className="side-school-icon">{(user?.organization_id||'S')[0].toUpperCase()}</span><div><strong>{user?.organization_id||'Your school'}</strong><small>School workspace</small></div></div><nav className="side-nav">{visible.map(([key,title,path])=><NavLink key={key} to={path} className={({isActive})=>`nav-link ${isActive?'selected':''}`}><span className="nav-bullet"/>{title}</NavLink>)}</nav><div className="sidebar-bottom"><div className="profile-chip"><span className="avatar">{(user?.first_name||user?.email||'U')[0].toUpperCase()}</span><span><strong>{user?.first_name||user?.email||'User'}</strong><small>{user?.role?.replace('_',' ')}</small></span></div><button className="logout side-logout" onClick={signOut}>Sign out</button></div></aside><main className="app-main"><header className="topbar"><span>{user?.organization_id||'School management'}</span><span className="topbar-dot">●</span></header><div className="page-content"><Outlet/></div></main></div>
}

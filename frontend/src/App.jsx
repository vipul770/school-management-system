import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ProtectedRoute from './components/guards/ProtectedRoute'
import RoleGuard from './components/guards/RoleGuard'
import AdminLayout from './components/layouts/AdminLayout'
import ModulePage from './pages/ModulePage'
import { currentUser, refresh } from './services/authService'
import { signedIn, signedOut } from './store/slices/authSlice'
import { modules } from './config/modules'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import SchoolOnboardingPage from './pages/auth/SchoolOnboardingPage'
import UsersRolesPage from './pages/UsersRolesPage'
import PlatformAdminPage from './pages/PlatformAdminPage'
import useAuth from './hooks/useAuth'

function SessionBootstrap() {
  const dispatch = useDispatch()
  useEffect(() => { let mounted = true; refresh().then(({data}) => currentUser().then((profile) => { if(mounted) dispatch(signedIn({access:data.access,user:profile.data})) })).catch(() => { if(mounted) dispatch(signedOut()) }); return () => { mounted = false } }, [dispatch])
  return null
}

function DashboardRoute() {
  const { user } = useAuth()
  return user?.role === 'super_admin' ? <PlatformAdminPage/> : <DashboardPage/>
}

export default function App() {
  return <><SessionBootstrap/><Routes><Route path="/login" element={<LoginPage />} /><Route path="/forgot-password" element={<ForgotPasswordPage/>}/><Route path="/register-school" element={<SchoolOnboardingPage/>}/><Route element={<ProtectedRoute><AdminLayout/></ProtectedRoute>}><Route path="/dashboard" element={<DashboardRoute/>}/><Route path="/platform/schools" element={<RoleGuard allowedRoles={['super_admin']}><PlatformAdminPage section="schools"/></RoleGuard>}/><Route path="/platform/users" element={<RoleGuard allowedRoles={['super_admin']}><PlatformAdminPage section="users"/></RoleGuard>}/><Route path="/platform/plans" element={<RoleGuard allowedRoles={['super_admin']}><PlatformAdminPage section="plans"/></RoleGuard>}/><Route path="/platform/audit" element={<RoleGuard allowedRoles={['super_admin']}><PlatformAdminPage section="audit"/></RoleGuard>}/><Route path="/users" element={<RoleGuard allowedRoles={['school_admin']}><UsersRolesPage/></RoleGuard>}/>{Object.entries(modules).map(([key])=><Route key={key} path={`/${key}`} element={<RoleGuard allowedRoles={key==='students'?['school_admin','teacher']:key==='teachers'||key==='settings'?['school_admin']:key==='fees'?['school_admin','accountant']:key==='reports'?['school_admin','accountant']:key==='my-school'?['student','parent']:key==='notifications'?['school_admin','teacher','student','parent']:['school_admin','teacher']}><ModulePage moduleKey={key}/></RoleGuard>}/>)}</Route><Route path="/" element={<Navigate to="/login" replace />} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></>
}

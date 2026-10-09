import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth()
  return allowedRoles.includes(user?.role) ? children : <Navigate to="/dashboard" replace />
}

import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import LoadingState from '../ui/LoadingState'

export default function ProtectedRoute({ children }) {
  const { authenticated, restored } = useSelector((state) => state.auth)
  return !restored ? <LoadingState label="Restoring your school session…"/> : authenticated ? children : <Navigate to="/login" replace />
}

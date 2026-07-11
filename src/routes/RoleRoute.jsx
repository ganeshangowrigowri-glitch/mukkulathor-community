import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageLoader from '../components/ui/PageLoader'

/**
 * Guards a route to a specific set of roles, e.g. <RoleRoute allow={['admin']} />.
 * Must be nested inside <ProtectedRoute /> so a session is already guaranteed.
 */
export default function RoleRoute({ allow = [] }) {
  const { role, loading, profile } = useAuth()

  if (loading) return <PageLoader />
  if (!profile) return <Navigate to="/login" replace />
  if (!allow.includes(role)) return <Navigate to="/unauthorized" replace />

  return <Outlet />
}

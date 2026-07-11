import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageLoader from '../components/ui/PageLoader'

/**
 * Guards any route that requires a signed-in user. Unauthenticated visitors
 * are redirected to /login with the original destination preserved so they
 * can be sent back after signing in.
 */
export default function ProtectedRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />

  return <Outlet />
}

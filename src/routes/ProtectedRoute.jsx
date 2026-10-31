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
   const loginPath = location.pathname.startsWith('/admin')
    ? '/admin-login'
    : location.pathname.startsWith('/referee')
      ? '/referee-login'
      : '/login'
  if (!session) return <Navigate to={loginPath} state={{ from: location }} replace />

  return <Outlet />
}

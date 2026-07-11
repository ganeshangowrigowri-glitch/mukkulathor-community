import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageLoader from '../components/ui/PageLoader'

export default function ApprovedRoute() {
  const { profile, loading } = useAuth()
  if (loading) return <PageLoader />
  if (profile?.registration_status !== 'approved') return <Navigate to="/member/status" replace />
  return <Outlet />
}

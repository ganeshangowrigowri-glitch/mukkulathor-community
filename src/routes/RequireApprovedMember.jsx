import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageLoader from '../components/ui/PageLoader'

export default function RequireApprovedMember() {
  const { profile, role, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!profile) return <Navigate to="/login" replace />
  const exempt = role === 'admin' || role === 'referee'
  if (!exempt && profile.registration_status !== 'approved') {
    return <Navigate to="/member/status" replace />
  }
  return <Outlet />
}
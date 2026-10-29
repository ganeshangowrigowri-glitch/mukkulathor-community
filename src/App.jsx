import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import RequireApprovedMember from './routes/RequireApprovedMember'
import ApprovedRoute from './routes/ApprovedRoute'
import PageLoader from './components/ui/PageLoader'

import PublicLayout from './components/layout/PublicLayout'
import Home from './pages/public/Home'
import About from './pages/public/About'
import History from './pages/public/History'
import Objectives from './pages/public/Objectives'
import EventsPublic from './pages/public/EventsPublic'
import GalleryPublic from './pages/public/GalleryPublic'
import Contact from './pages/public/Contact'
import Login from './pages/public/Login'

import RegistrationWizard from './components/registration/RegistrationWizard'
import DashboardLayout from './components/layout/DashboardLayout'

// Dashboard pages are lazy-loaded — they're only needed after a member signs
// in, and splitting them out keeps the public-site + auth bundle small for
// fast first load on mobile connections.
const MemberDashboard = lazy(() => import('./pages/member/Dashboard'))
const MemberProfile = lazy(() => import('./pages/member/Profile'))
const EditProfile = lazy(() => import('./pages/member/EditProfile'))
const CommunityDetails = lazy(() => import('./pages/member/CommunityDetails'))
const FamilyTree = lazy(() => import('./pages/member/FamilyTree'))
const FamilyMembers = lazy(() => import('./pages/member/FamilyMembers'))
const MemberEvents = lazy(() => import('./pages/member/Events'))
const Notices = lazy(() => import('./pages/member/Notices'))
const Gallery = lazy(() => import('./pages/member/Gallery'))
const MembershipStatus = lazy(() => import('./pages/member/MembershipStatus'))
const Notifications = lazy(() => import('./pages/member/Notifications'))
const Settings = lazy(() => import('./pages/member/Settings'))
const MatrimonyLayout = lazy(() => import('./pages/member/matrimony/MatrimonyLayout'))
const MatrimonyDashboard = lazy(() => import('./pages/member/matrimony/MatrimonyDashboard'))
const MatrimonyBrowse = lazy(() => import('./pages/member/matrimony/MatrimonyBrowse'))
const MatrimonyMyProfile = lazy(() => import('./pages/member/matrimony/MatrimonyMyProfile'))
const MatrimonyShortlist = lazy(() => import('./pages/member/matrimony/MatrimonyShortlist'))
const MatrimonyRequests = lazy(() => import('./pages/member/matrimony/MatrimonyRequests'))
const MatrimonyPrivacy = lazy(() => import('./pages/member/matrimony/MatrimonyPrivacy'))
const RefereeDashboard = lazy(() => import('./pages/referee/Dashboard'))
const ReviewApplicants = lazy(() => import('./pages/referee/Review'))

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const PendingRegistrations = lazy(() => import('./pages/admin/PendingRegistrations'))
const ManageMembers = lazy(() => import('./pages/admin/ManageMembers'))
const ManageReferees = lazy(() => import('./pages/admin/ManageReferees'))
const ManageServices = lazy(() => import('./pages/admin/ManageServices'))
const ManageAchievers = lazy(() => import('./pages/admin/ManageAchievers'))
const ManageSocieties = lazy(() => import('./pages/admin/ManageSocieties'))
const ManageEvents = lazy(() => import('./pages/admin/ManageEvents'))
const ManageNotices = lazy(() => import('./pages/admin/ManageNotices'))
const ManageGallery = lazy(() => import('./pages/admin/ManageGallery'))
const SearchMembers = lazy(() => import('./pages/admin/SearchMembers'))
const Reports = lazy(() => import('./pages/admin/Reports'))
const Analytics = lazy(() => import('./pages/admin/Analytics'))
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'))
const ExportMembers = lazy(() => import('./pages/admin/ExportMembers'))
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'))

function Unauthorized() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-2xl font-semibold text-navy-900">Not authorized</h1>
      <p className="mt-2 text-slate-500">You don't have permission to view this page.</p>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-3xl font-semibold text-navy-900">404</h1>
      <p className="mt-2 text-slate-500">That page doesn't exist.</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' } }} />
      <Routes>
        {/* ---------------- Public site ---------------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/history" element={<History />} />
          <Route path="/objectives" element={<Objectives />} />
          <Route path="/events" element={<EventsPublic />} />
          <Route path="/gallery" element={<GalleryPublic />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* ---------------- Registration wizard (any signed-in user with a draft profile) ---------------- */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/member/register"
            element={
              <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <RegistrationWizard />
              </div>
            }
          />

          {/* ---------------- Member Dashboard (Module 3) ---------------- */}
          <Route element={<DashboardLayout />}>
            <Route path="/member" element={<Navigate to="/member/dashboard" replace />} />
            <Route path="/referee" element={<Navigate to="/referee/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route element={<ApprovedRoute />}>
              <Route
                path="/member/dashboard"
                element={<Suspense fallback={<PageLoader />}><MemberDashboard /></Suspense>}
              />
              <Route path="/member/family-tree" element={<Suspense fallback={<PageLoader />}><FamilyTree /></Suspense>} />
              <Route path="/member/family-members" element={<Suspense fallback={<PageLoader />}><FamilyMembers /></Suspense>} />
              <Route path="/member/events" element={<Suspense fallback={<PageLoader />}><MemberEvents /></Suspense>} />
              <Route path="/member/notices" element={<Suspense fallback={<PageLoader />}><Notices /></Suspense>} />
              <Route path="/member/gallery" element={<Suspense fallback={<PageLoader />}><Gallery /></Suspense>} />
              <Route path="/member/community" element={<Suspense fallback={<PageLoader />}><CommunityDetails /></Suspense>} />
            </Route>
                         <Route path="/member/status" element={<Suspense fallback={<PageLoader />}><MembershipStatus /></Suspense>} />
            <Route path="/member/notifications" element={<Suspense fallback={<PageLoader />}><Notifications /></Suspense>} />
            <Route path="/member/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />

            <Route element={<RequireApprovedMember />}>
              <Route path="/member/dashboard" element={<Suspense fallback={<PageLoader />}><MemberDashboard /></Suspense>} />
              <Route path="/member/profile" element={<Suspense fallback={<PageLoader />}><MemberProfile /></Suspense>} />
              <Route path="/member/edit-profile" element={<Suspense fallback={<PageLoader />}><EditProfile /></Suspense>} />
              <Route path="/member/community" element={<Suspense fallback={<PageLoader />}><CommunityDetails /></Suspense>} />
               <Route path="/member/matrimony" element={<Suspense fallback={<PageLoader />}><MatrimonyLayout /></Suspense>}>
                <Route index element={<Suspense fallback={<PageLoader />}><MatrimonyDashboard /></Suspense>} />
                <Route path="browse" element={<Suspense fallback={<PageLoader />}><MatrimonyBrowse /></Suspense>} />
                <Route path="my-profile" element={<Suspense fallback={<PageLoader />}><MatrimonyMyProfile /></Suspense>} />
                <Route path="shortlist" element={<Suspense fallback={<PageLoader />}><MatrimonyShortlist /></Suspense>} />
                <Route path="requests" element={<Suspense fallback={<PageLoader />}><MatrimonyRequests /></Suspense>} />
                <Route path="privacy" element={<Suspense fallback={<PageLoader />}><MatrimonyPrivacy /></Suspense>} />
              </Route>
              <Route path="/member/family-tree" element={<Suspense fallback={<PageLoader />}><FamilyTree /></Suspense>} />
              <Route path="/member/family-members" element={<Suspense fallback={<PageLoader />}><FamilyMembers /></Suspense>} />
              <Route path="/member/events" element={<Suspense fallback={<PageLoader />}><MemberEvents /></Suspense>} />
              <Route path="/member/notices" element={<Suspense fallback={<PageLoader />}><Notices /></Suspense>} />
              <Route path="/member/gallery" element={<Suspense fallback={<PageLoader />}><Gallery /></Suspense>} />
            </Route>
            {/* ---------------- Referee Dashboard (Module 4) ---------------- */}
            <Route element={<RoleRoute allow={['referee', 'admin']} />}>
              <Route path="/referee/dashboard" element={<Suspense fallback={<PageLoader />}><RefereeDashboard /></Suspense>} />
              <Route path="/referee/review" element={<Suspense fallback={<PageLoader />}><ReviewApplicants /></Suspense>} />
            </Route>
            <Route element={<RoleRoute allow={['admin']} />}>
              <Route path="/admin/dashboard" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
              <Route path="/admin/pending-registrations" element={<Suspense fallback={<PageLoader />}><PendingRegistrations /></Suspense>} />
              <Route path="/admin/manage-members" element={<Suspense fallback={<PageLoader />}><ManageMembers /></Suspense>} />
              <Route path="/admin/manage-referees" element={<Suspense fallback={<PageLoader />}><ManageReferees /></Suspense>} />
              <Route path="/admin/services" element={<Suspense fallback={<PageLoader />}><ManageServices /></Suspense>} />
<Route path="/admin/achievers" element={<Suspense fallback={<PageLoader />}><ManageAchievers /></Suspense>} />
<Route path="/admin/societies" element={<Suspense fallback={<PageLoader />}><ManageSocieties /></Suspense>} />
              <Route path="/admin/manage-events" element={<Suspense fallback={<PageLoader />}><ManageEvents /></Suspense>} />
              <Route path="/admin/manage-notices" element={<Suspense fallback={<PageLoader />}><ManageNotices /></Suspense>} />
              <Route path="/admin/manage-gallery" element={<Suspense fallback={<PageLoader />}><ManageGallery /></Suspense>} />
              <Route path="/admin/search-members" element={<Suspense fallback={<PageLoader />}><SearchMembers /></Suspense>} />
              <Route path="/admin/reports" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
              <Route path="/admin/analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
              <Route path="/admin/audit-logs" element={<Suspense fallback={<PageLoader />}><AuditLogs /></Suspense>} />
              <Route path="/admin/export" element={<Suspense fallback={<PageLoader />}><ExportMembers /></Suspense>} />
              <Route path="/admin/settings" element={<Suspense fallback={<PageLoader />}><SystemSettings /></Suspense>} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

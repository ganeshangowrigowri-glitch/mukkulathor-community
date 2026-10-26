import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import {
  LayoutDashboard, User, Users, GitBranch, Image, CalendarDays, Bell, ShieldCheck,
  Settings, ClipboardList, UserCheck, UserCog, Megaphone, BarChart3, Search, Download,
  Cog, FileText, History,Wrench, Award, Users2,
} from 'lucide-react'

const ICONS = {
  LayoutDashboard, User, Users, GitBranch, Image, CalendarDays, Bell, ShieldCheck,
  Settings, ClipboardList, UserCheck, UserCog, Megaphone, BarChart3, Search, Download,
  Cog, FileText, History,Wrench, Award, Users2,
}

export const NAV_BY_ROLE = {
  member: [
    { to: '/member/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { to: '/member/profile', label: 'My Profile', icon: 'User' },
    { to: '/member/community', label: 'Community Details', icon: 'ShieldCheck' },
    { to: '/member/family-tree', label: 'Family Tree', icon: 'GitBranch' },
    { to: '/member/family-members', label: 'Family Members', icon: 'Users' },
    { to: '/member/events', label: 'Events', icon: 'CalendarDays' },
    { to: '/member/notices', label: 'Notices', icon: 'Megaphone' },
    { to: '/member/gallery', label: 'Gallery', icon: 'Image' },
    { to: '/member/status', label: 'Membership Status', icon: 'ClipboardList' },
    { to: '/member/edit-profile', label: 'Edit Profile', icon: 'FileText' },
    { to: '/member/notifications', label: 'Notifications', icon: 'Bell' },
    { to: '/member/settings', label: 'Settings', icon: 'Settings' },
  ],
  referee: [
    { to: '/referee/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { to: '/referee/review', label: 'Review Applicants', icon: 'UserCheck' },
    { to: '/member/profile', label: 'My Profile', icon: 'User' },
    { to: '/member/notifications', label: 'Notifications', icon: 'Bell' },
    { to: '/member/settings', label: 'Settings', icon: 'Settings' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard Analytics', icon: 'LayoutDashboard' },
    { to: '/admin/pending-registrations', label: 'Registration Approval', icon: 'ClipboardList' },
    { to: '/admin/manage-members', label: 'Member Management', icon: 'Users' },
    { to: '/admin/manage-referees', label: 'Referee Management', icon: 'UserCog' },
    { to: '/admin/manage-events', label: 'Events', icon: 'CalendarDays' },
    { to: '/admin/manage-notices', label: 'Notices', icon: 'Megaphone' },
    { to: '/admin/manage-gallery', label: 'Gallery', icon: 'Image' },
    { to: '/admin/search-members', label: 'Search Members', icon: 'Search' },
    { to: '/admin/reports', label: 'Reports', icon: 'FileText' },
    { to: '/admin/analytics', label: 'Analytics', icon: 'BarChart3' },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: 'History' },
    { to: '/admin/export', label: 'Export Members', icon: 'Download' },
    { to: '/admin/settings', label: 'System Settings', icon: 'Cog' },
    { to: '/admin/services', label: 'Manage Services', icon: 'Wrench' },
    { to: '/admin/achievers', label: 'Manage Achievers', icon: 'Award' },
    { to: '/admin/societies', label: 'Connected Societies', icon: 'Users2' },
  ],
}

export default function DashboardSidebar({ role, open, onClose }) {
  const items = NAV_BY_ROLE[role] ?? []

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-navy-950/40 lg:hidden" onClick={onClose} />}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
       <div className="flex h-16 items-center gap-2.5 border-b border-gold-200 px-5">
          <svg width="28" height="28" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#173d5c"/><path d="M32 12v10M32 22 L20 34 M32 22 L44 34 M20 34 V46 M44 34 V46" stroke="#cda339" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
          <span className="font-display text-base font-semibold text-navy-900">Mukkulathor</span>
        </div>
        <nav className="flex flex-col gap-0.5 overflow-y-auto px-3 py-4" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {items.map((item) => {
            const Icon = ICONS[item.icon]
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 rounded-sm2 px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-navy-700 text-white' : 'text-slate-600 hover:bg-navy-50 hover:text-navy-800'
                  )
                }
              >
                <Icon size={17} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

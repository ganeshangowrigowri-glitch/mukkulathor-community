import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, Bell, LogOut } from 'lucide-react'
import DashboardSidebar from './DashboardSidebar'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Badge from '../ui/Badge'
import { REGISTRATION_STATUS_BADGE, REGISTRATION_STATUS_LABELS } from '../../lib/constants'

export default function DashboardLayout() {
  const { profile, role, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()
  const menuRef = useRef(null)

  useEffect(() => {
    if (!profile?.id) return
    let active = true

    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(8)
      if (active) setNotifications(data ?? [])
    }
    load()

    const channel = supabase
      .channel(`notifications-${profile.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `profile_id=eq.${profile.id}` }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev].slice(0, 8))
      })
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [profile?.id])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  async function markAllRead() {
    if (!profile?.id) return
    await supabase.from('notifications').update({ is_read: true }).eq('profile_id', profile.id).eq('is_read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <DashboardSidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            <button className="text-slate-500 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>

            <div className="hidden items-center gap-2 lg:flex">
              {profile?.registration_status && (
                <Badge tone={REGISTRATION_STATUS_BADGE[profile.registration_status]?.replace('badge-', '')}>
                  {REGISTRATION_STATUS_LABELS[profile.registration_status]}
                </Badge>
              )}
              {profile?.family_id && <span className="font-mono text-xs text-slate-400">ID: {profile.family_id}</span>}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen((o) => !o); if (!notifOpen) markAllRead() }}
                  className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Notifications"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-[88vw] max-w-80 rounded-lg border border-slate-200 bg-white shadow-lifted">
                    <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-navy-900">Notifications</div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-slate-400">You're all caught up.</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="border-b border-slate-50 px-4 py-3 text-sm last:border-none">
                            <p className="font-medium text-slate-800">{n.title}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div ref={menuRef} className="flex items-center gap-2">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-slate-800">{profile?.full_name}</p>
                  <p className="text-xs capitalize text-slate-400">{role}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700 text-sm font-semibold text-white">
                  {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <button onClick={handleSignOut} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500" aria-label="Log out">
                  <LogOut size={17} />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

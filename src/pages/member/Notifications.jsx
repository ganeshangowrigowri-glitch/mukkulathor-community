import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../../services/notificationService'
import FadeIn from '../../components/ui/FadeIn'
import { SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

const TYPE_COLORS = {
  approval: 'bg-emerald-500', rejection: 'bg-red-500', referee_action: 'bg-gold-500',
  registration: 'bg-navy-500', event: 'bg-indigo-500', notice: 'bg-amber-500', system: 'bg-slate-400',
}

export default function Notifications() {
  const { profile } = useAuth()
  const profileId = profile?.id

  const { data: notifications, loading, error, refetch, setData } = useSupabaseQuery(
    useCallback(() => (profileId ? listNotifications(profileId) : Promise.resolve([])), [profileId]),
    [profileId], { initialData: [] }
  )

  async function handleMarkRead(id) {
    await markNotificationRead(id)
    setData((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead(profileId)
    setData((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  async function handleDelete(id) {
    await deleteNotification(id)
    setData((prev) => prev.filter((n) => n.id !== id))
  }

  const unreadCount = (notifications ?? []).filter((n) => !n.is_read).length

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">{unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-outline w-full sm:w-auto">
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </FadeIn>

      {loading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load notifications." />
      ) : (notifications ?? []).length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You'll see referee updates, approvals, and announcements here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <FadeIn key={n.id} delay={i * 25}>
              <div className={clsx('flex items-start gap-3 rounded-lg border p-4 transition-colors', n.is_read ? 'border-slate-200 bg-white' : 'border-navy-200 bg-navy-50/40')}>
                <span className={clsx('mt-1.5 h-2 w-2 shrink-0 rounded-full', TYPE_COLORS[n.type] ?? 'bg-slate-400')} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={clsx('text-sm', n.is_read ? 'font-medium text-slate-700' : 'font-semibold text-navy-900')}>{n.title}</p>
                    <span className="shrink-0 text-xs text-slate-400">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                  </div>
                  {n.message && <p className="mt-1 text-sm text-slate-500">{n.message}</p>}
                  <div className="mt-2 flex items-center gap-3">
                    {n.link && <Link to={n.link} className="text-xs font-medium text-navy-700 hover:underline">View details</Link>}
                    {!n.is_read && (
                      <button onClick={() => handleMarkRead(n.id)} className="text-xs font-medium text-slate-400 hover:text-navy-700">Mark as read</button>
                    )}
                    <button onClick={() => handleDelete(n.id)} className="ml-auto rounded-full p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500" aria-label="Delete notification">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  )
}

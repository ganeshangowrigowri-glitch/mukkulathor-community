import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Inbox, Phone, Check, X, Undo2, Eye } from 'lucide-react'
import { useSupabaseQuery } from '../../../hooks/useSupabaseQuery'
import { listRequests, respondToInterest, withdrawInterest } from '../../../services/matrimonyService'
import { MATRIMONY_INTEREST_BADGE, MATRIMONY_INTEREST_LABEL } from '../../../lib/constants'
import Tabs from '../../../components/ui/Tabs'
import Badge from '../../../components/ui/Badge'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import { SkeletonList } from '../../../components/ui/Skeleton'
import ProfileDetailModal from '../../../components/matrimony/ProfileDetailModal'

export default function MatrimonyRequests() {
  const [tab, setTab] = useState('incoming')
  const [viewId, setViewId] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)
  const { data: rows, loading, error, refetch } = useSupabaseQuery(useCallback(() => listRequests(), []), [], { initialData: [] })

  const filtered = useMemo(() => {
    if (tab === 'connected') return rows.filter((r) => r.status === 'accepted')
    return rows.filter((r) => r.direction === tab && r.status !== 'accepted')
  }, [rows, tab])

  const counts = useMemo(() => ({
    incoming: rows.filter((r) => r.direction === 'incoming' && r.status === 'pending').length,
    connected: rows.filter((r) => r.status === 'accepted').length,
  }), [rows])

  async function act(fn, okMsg) {
    setBusy(true)
    try {
      await fn()
      toast.success(okMsg)
      setConfirm(null)
      refetch()
    } catch (e) {
      toast.error(e.message || 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { value: 'incoming', label: `Received${counts.incoming ? ` (${counts.incoming})` : ''}` },
          { value: 'outgoing', label: 'Sent' },
          { value: 'connected', label: `Connected${counts.connected ? ` (${counts.connected})` : ''}` },
        ]}
      />

      {loading ? (
        <SkeletonList count={3} />
      ) : error ? (
        <ErrorState message={error.message || "Couldn't load requests."} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Inbox} title="Nothing here yet" description="Interests you send and receive appear in these tabs." />
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r.interest_id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-navy-800">
                    {r.other_name || r.member_code || 'Member'}
                    {r.other_name && r.member_code && <span className="ml-2 text-xs font-normal text-slate-400">{r.member_code}</span>}
                  </p>
                  <p className="text-sm text-slate-600">
                    {r.age} yrs<span className="capitalize">{r.branch ? ` · ${r.branch}` : ''}</span>
                    {r.district ? ` · ${r.district}` : ''}{r.occupation_title ? ` · ${r.occupation_title}` : ''}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {r.direction === 'incoming' ? 'Received' : 'Sent'} {format(new Date(r.created_at), 'dd MMM yyyy')}
                  </p>
                </div>
                <Badge tone={MATRIMONY_INTEREST_BADGE[r.status]}>{MATRIMONY_INTEREST_LABEL[r.status]}</Badge>
              </div>

              {r.message && <p className="mt-3 rounded-lg bg-linen-100 p-2.5 text-sm italic text-slate-700">“{r.message}”</p>}

              {r.status === 'accepted' && r.other_contact && (
                <p className="mt-3 flex items-center gap-2 text-sm text-emerald-800">
                  <Phone size={15} /> <a className="font-semibold underline" href={`tel:${r.other_contact}`}>{r.other_contact}</a>
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-outline" onClick={() => setViewId(r.other_profile_id)}><Eye size={15} /> View profile</button>
                {r.direction === 'incoming' && r.status === 'pending' && (
                  <>
                    <button className="btn-primary" disabled={busy} onClick={() => act(() => respondToInterest(r.interest_id, true), 'Accepted — contact details shared')}>
                      <Check size={15} /> Accept & share contact
                    </button>
                    <button className="btn-ghost" disabled={busy} onClick={() => act(() => respondToInterest(r.interest_id, false), 'Request declined')}>
                      <X size={15} /> Decline
                    </button>
                  </>
                )}
                {r.direction === 'outgoing' && r.status === 'pending' && (
                  <button className="btn-ghost" disabled={busy} onClick={() => act(() => withdrawInterest(r.interest_id), 'Interest withdrawn')}>
                    <Undo2 size={15} /> Withdraw
                  </button>
                )}
                {r.status === 'accepted' && (
                  <button className="btn-ghost" onClick={() => setConfirm(r)}><Undo2 size={15} /> Stop sharing</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ProfileDetailModal open={!!viewId} profileId={viewId} onClose={() => setViewId(null)} />
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        loading={busy}
        title="Stop sharing details?"
        description="This hides your name, contact number, horoscope and (if private) photo from this member again."
        confirmLabel="Stop sharing"
        onConfirm={() => act(() => withdrawInterest(confirm.interest_id), 'Sharing stopped')}
      />
    </div>
  )
}

import { Search } from 'lucide-react'
import { BRANCHES } from '../../lib/constants'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_referee_verification', label: 'Pending Referee' },
  { value: 'pending_admin_approval', label: 'Pending Admin' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
]

export default function MemberFilterBar({ query, onQuery, status, onStatus, branch, onBranch }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search name, email, mobile, family ID…" className="input-field pl-9" />
      </div>
      <select value={status} onChange={(e) => onStatus(e.target.value)} className="input-field sm:w-48">
        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select value={branch} onChange={(e) => onBranch(e.target.value)} className="input-field sm:w-40">
        <option value="all">All Branches</option>
        {BRANCHES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
      </select>
    </div>
  )
}

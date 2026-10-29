import { Heart, Eye, Send, MapPin, Briefcase, GraduationCap, Home, Lock } from 'lucide-react'
import clsx from 'clsx'
import Badge from '../ui/Badge'
import SignedImage from './SignedImage'
import { MATRIMONY_BUCKETS } from '../../services/matrimonyService'
import { MATRIMONY_JATHAKAM, MATRIMONY_INTEREST_BADGE, MATRIMONY_INTEREST_LABEL } from '../../lib/constants'

const jathakamLabel = (v) => MATRIMONY_JATHAKAM.find((j) => j.value === v)?.label

export default function ProfileCard({ item, onView, onToggleShortlist, onInterest }) {
  const canSend = !item.interest_status || ['withdrawn', 'revoked'].includes(item.interest_status)
  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="relative h-44 w-full bg-linen-100">
        {item.photo_path ? (
          <SignedImage bucket={MATRIMONY_BUCKETS.PHOTOS} path={item.photo_path} alt="" className="h-44 w-full" />
        ) : (
          <div className="flex h-44 flex-col items-center justify-center gap-1 text-slate-400">
            <Lock size={22} />
            <span className="text-xs">Photo shared after acceptance</span>
          </div>
        )}
        <button
          onClick={() => onToggleShortlist(item)}
          aria-label={item.is_shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
        >
          <Heart size={18} className={clsx(item.is_shortlisted ? 'fill-navy-600 text-navy-600' : 'text-slate-500')} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg font-semibold text-navy-800">{item.member_code}</span>
          {item.interest_status && (
            <Badge tone={MATRIMONY_INTEREST_BADGE[item.interest_status]}>{MATRIMONY_INTEREST_LABEL[item.interest_status]}</Badge>
          )}
        </div>
        <p className="text-sm font-medium text-slate-700">
          {item.age} yrs{item.height_cm ? ` · ${item.height_cm} cm` : ''}
          <span className="capitalize">{item.branch ? ` · ${item.branch}` : ''}</span>
        </p>
        <ul className="space-y-1 text-xs text-slate-500">
          {item.occupation_title && <li className="flex items-center gap-1.5"><Briefcase size={13} /> {item.occupation_title}</li>}
          {item.education_summary && <li className="flex items-center gap-1.5"><GraduationCap size={13} /> {item.education_summary}</li>}
          {item.district && <li className="flex items-center gap-1.5"><MapPin size={13} /> {item.district}</li>}
          {item.veettu_peyar && <li className="flex items-center gap-1.5"><Home size={13} /> Veettu Peyar: {item.veettu_peyar}</li>}
        </ul>
        {item.jathakam_type && <Badge tone="navy" className="self-start">{jathakamLabel(item.jathakam_type)}</Badge>}

        <div className="mt-auto flex gap-2 pt-2">
          <button className="btn-outline flex-1" onClick={() => onView(item)}><Eye size={15} /> View</button>
          {canSend && (
            <button className="btn-primary flex-1" onClick={() => onInterest(item)}><Send size={15} /> Interest</button>
          )}
        </div>
      </div>
    </div>
  )
}

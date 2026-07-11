import clsx from 'clsx'
import { differenceInYears } from 'date-fns'

export default function MemberNode({ member }) {
  const age = member.dob ? differenceInYears(member.dod ? new Date(member.dod) : new Date(), new Date(member.dob)) : null

  return (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-sm2 border p-3',
        member.isSelf ? 'border-gold-300 bg-gold-50' : 'border-slate-150 bg-slate-25'
      )}
    >
      <div
        className={clsx(
          'flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold',
          member.isSelf ? 'bg-gold-500 text-navy-900' : 'bg-navy-100 text-navy-700'
        )}
      >
        {member.photo_url ? (
          <img src={member.photo_url} alt="" className="h-full w-full object-cover" />
        ) : (
          member.full_name?.[0]?.toUpperCase() ?? '?'
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-navy-900">{member.full_name}</p>
        <p className="truncate text-xs text-slate-500">
          {member.relationLabel}
          {age !== null && ` · ${member.is_living === false ? 'd. ' : ''}${age} yrs`}
        </p>
        {member.occupation && <p className="truncate text-[11px] text-slate-400">{member.occupation}</p>}
      </div>
    </div>
  )
}

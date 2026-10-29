import { useState } from 'react'
import toast from 'react-hot-toast'
import { Send, Heart } from 'lucide-react'
import ProfileCard from './ProfileCard'
import ProfileDetailModal from './ProfileDetailModal'
import InterestDialog from './InterestDialog'
import { toggleShortlist, sendInterest } from '../../services/matrimonyService'

/** Cards + the view / shortlist / interest actions shared by Browse and Shortlist. */
export default function ProfileGrid({ items, onChanged }) {
  const [viewId, setViewId] = useState(null)
  const [interestFor, setInterestFor] = useState(null)

  async function handleShortlist(item) {
    try {
      const now = await toggleShortlist(item.profile_id)
      toast.success(now ? 'Added to shortlist' : 'Removed from shortlist')
      onChanged?.()
    } catch (e) {
      toast.error(e.message || 'Could not update shortlist')
    }
  }

  async function handleSend(item, message) {
    try {
      await sendInterest(item.profile_id, message)
      toast.success('Interest sent')
      setInterestFor(null)
      setViewId(null)
      onChanged?.()
    } catch (e) {
      toast.error(e.message || 'Could not send interest')
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ProfileCard
            key={item.profile_id}
            item={item}
            onView={(i) => setViewId(i.profile_id)}
            onToggleShortlist={handleShortlist}
            onInterest={setInterestFor}
          />
        ))}
      </div>

      <ProfileDetailModal
        open={!!viewId}
        profileId={viewId}
        onClose={() => setViewId(null)}
        footer={(p) =>
          p && !p.is_connected && (!p.interest_status || ['withdrawn', 'revoked'].includes(p.interest_status)) ? (
            <>
              <button className="btn-outline" onClick={() => handleShortlist({ profile_id: p.profile_id })}>
                <Heart size={15} /> {p.is_shortlisted ? 'Unshortlist' : 'Shortlist'}
              </button>
              <button className="btn-primary" onClick={() => setInterestFor({ profile_id: p.profile_id, member_code: p.member_code })}>
                <Send size={15} /> Express interest
              </button>
            </>
          ) : null
        }
      />
      <InterestDialog open={!!interestFor} target={interestFor} onClose={() => setInterestFor(null)} onSend={handleSend} />
    </>
  )
}

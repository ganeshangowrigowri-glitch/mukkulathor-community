import { useCallback } from 'react'
import { Heart } from 'lucide-react'
import { useSupabaseQuery } from '../../../hooks/useSupabaseQuery'
import { browseProfiles } from '../../../services/matrimonyService'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import { SkeletonList } from '../../../components/ui/Skeleton'
import ProfileGrid from '../../../components/matrimony/ProfileGrid'

export default function MatrimonyShortlist() {
  const { data: items, loading, error, refetch } = useSupabaseQuery(
    useCallback(() => browseProfiles({ onlyShortlist: true, limit: 60 }), []), [], { initialData: [] }
  )
  if (loading) return <SkeletonList count={3} />
  if (error) return <ErrorState message={error.message || "Couldn't load your shortlist."} onRetry={refetch} />
  if (items.length === 0) {
    return <EmptyState icon={Heart} title="No shortlisted profiles" description="Tap the heart on any profile to save it here for family discussion." />
  }
  return <ProfileGrid items={items} onChanged={refetch} />
}

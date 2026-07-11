import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { GitBranch, Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listFamilyMembers } from '../../services/familyService'
import { groupMembersByGeneration } from '../../lib/familyTreeBuilder'
import FadeIn from '../../components/ui/FadeIn'
import { SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import GenerationGroup from '../../components/familytree/GenerationGroup'

export default function FamilyTree() {
  const { profile } = useAuth()
  const profileId = profile?.id

  const { data: members, loading, error, refetch } = useSupabaseQuery(
    useCallback(() => (profileId ? listFamilyMembers(profileId) : Promise.resolve([])), [profileId]),
    [profileId],
    { initialData: [] }
  )

  const generations = profile ? groupMembersByGeneration(profile, members ?? []) : []
  const hasRelatives = (members ?? []).length > 0

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Family Tree</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tap a generation to expand or collapse it. Your tree grows automatically as you add relatives.
          </p>
        </div>
        <Link to="/member/family-members" className="btn-primary w-full sm:w-auto">
          <Plus size={15} /> Add Relative
        </Link>
      </FadeIn>

      {loading ? (
        <SkeletonList count={4} />
      ) : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load your family tree." />
      ) : !hasRelatives ? (
        <EmptyState
          icon={GitBranch}
          title="Your tree starts with you"
          description="Add family members — great grandfather, grandfather, father, mother, children, and more — to build a multi-generation family tree."
          action={<Link to="/member/family-members" className="btn-primary">Add Family Member</Link>}
        />
      ) : (
        <div className="space-y-4">
          {generations.map((gen) => (
            <FadeIn key={gen.level} delay={gen.level * 40 + 80}>
              <GenerationGroup label={gen.label} level={gen.level} members={gen.members} defaultOpen={Math.abs(gen.level) <= 1} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  )
}

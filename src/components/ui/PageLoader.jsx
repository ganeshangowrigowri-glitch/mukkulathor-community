export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3 py-16">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-navy-100 border-t-navy-700" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}

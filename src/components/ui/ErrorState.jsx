import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function ErrorState({ message = 'Something went wrong while loading this data.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-100 bg-red-50/50 py-12 text-center">
      <AlertTriangle className="mb-3 text-red-400" size={28} />
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline mt-4">
          <RotateCcw size={14} /> Try again
        </button>
      )}
    </div>
  )
}

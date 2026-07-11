import { useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Check, X, Loader2 } from 'lucide-react'

/**
 * A self-contained "edit-in-place" section: renders fields as read-only,
 * with an Edit button that swaps to a form (children render-prop receives
 * a `register`-like getValue/setValue pair) and Save/Cancel actions.
 *
 * This avoids one giant form for the whole profile — sections save (and can
 * fail) independently, which is friendlier on mobile and for partial saves.
 */
export default function EditableSection({ title, description, values, onSave, renderForm, renderView }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(values)
  const [saving, setSaving] = useState(false)

  function startEdit() {
    setDraft(values)
    setEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(draft)
      toast.success(`${title} updated`)
      setEditing(false)
    } catch (err) {
      toast.error(err.message || 'Could not save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-navy-900">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
        {!editing && (
          <button onClick={startEdit} className="btn-ghost shrink-0 px-3 py-2" aria-label={`Edit ${title}`}>
            <Pencil size={15} />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          {renderForm(draft, setDraft)}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button onClick={() => setEditing(false)} className="btn-outline" disabled={saving}>
              <X size={15} /> Cancel
            </button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        renderView(values)
      )}
    </div>
  )
}

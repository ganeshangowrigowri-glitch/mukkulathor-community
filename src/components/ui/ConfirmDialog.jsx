import { AlertTriangle, Loader2 } from 'lucide-react'
import Modal from './Modal'

/**
 * Reusable confirmation dialog for destructive/important admin actions
 * (suspend member, delete event/notice/gallery item, deactivate referee).
 * Replaces window.confirm() with a touch-friendly, on-brand modal.
 */
export default function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', tone = 'danger', loading = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
          <button className={tone === 'danger' ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <AlertTriangle size={15} />}
            {loading ? 'Working…' : confirmLabel}
          </button>
        </>
      }
      size="sm"
    >
      <p className="text-sm text-slate-600">{description}</p>
    </Modal>
  )
}

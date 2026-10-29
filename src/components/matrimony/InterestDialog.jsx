import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import Modal from '../ui/Modal'
import Textarea from '../ui/Textarea'

export default function InterestDialog({ open, target, onClose, onSend }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  async function submit() {
    setSending(true)
    try {
      await onSend(target, message)
      setMessage('')
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Express interest${target?.member_code ? ` — ${target.member_code}` : ''}`}
      size="sm"
      footer={
        <>
          <button className="btn-outline" onClick={onClose} disabled={sending}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={sending}>
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send interest
          </button>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-600">
        Your name and contact are shared with this member only if they accept. Add an optional note from you or your family.
      </p>
      <Textarea label="Message (optional)" rows={4} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />
    </Modal>
  )
}

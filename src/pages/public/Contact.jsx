import { useState } from 'react'
import toast from 'react-hot-toast'
import PageHero from '../../components/layout/PageHero'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Contact() {
  const [sending, setSending] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    // NOTE: Wire this up to a Supabase Edge Function + Resend (or a `contact_messages`
    // table) in production. Kept as a simple front-end stub here.
    setTimeout(() => {
      setSending(false)
      toast.success("Message sent — we'll get back to you soon.")
      e.target.reset()
    }, 700)
  }

  return (
    <div>
      <PageHero eyebrow="Get in touch" title="Contact" description="Questions about membership, referees, or the registry?" />
      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <Input label="Full Name" required name="name" />
          <Input label="Email Address" type="email" required name="email" />
          <Input label="Subject" required name="subject" />
          <Textarea label="Message" required name="message" rows={5} />
          <button type="submit" disabled={sending} className="btn-primary w-full justify-center">
            {sending ? 'Sending…' : 'Send Message'}
          </button>
        </form>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-display text-xl font-semibold text-navy-900">Union Admin</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2"><MapPin size={16} className="text-gold-700" /> Badulla, Uva, Sri Lanka</li>
              <li className="flex items-center gap-2"><Mail size={16} className="text-gold-700" /> contactsasatravel27@gmail.com</li>
              <li className="flex items-center gap-2"><Phone size={16} className="text-gold-700" /> +94 0773444462</li>
            </ul>
          </div>
          <div className="card border-l-4 border-l-gold-400 p-6">
            <h3 className="font-display text-xl font-semibold text-navy-900">Want to become a referee?</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Referees are approved members designated by the administrator. Reach out to the community office to
              express interest after your own membership is approved.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
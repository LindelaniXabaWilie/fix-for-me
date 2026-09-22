import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SuggestServiceForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setStatus('sending')

    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('service_suggestions').insert({
      user_id: user?.id ?? null,
      name: name.trim(),
      description: description.trim() || null,
    })

    if (error) {
      setStatus('error')
      return
    }
    setName('')
    setDescription('')
    setStatus('sent')
  }

  if (status === 'sent') return <p className="page-success">Thanks — we&rsquo;ll take a look.</p>

  return (
    <form onSubmit={handleSubmit} className="suggest-service-form">
      <label>
        Service name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pool maintenance" />
      </label>
      <label>
        Why do you need it? (optional)
        <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      {status === 'error' && <p className="page-error">Couldn&rsquo;t send that — try again.</p>}
      <button type="submit" className="btn-secondary" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Suggest a service'}
      </button>
    </form>
  )
}
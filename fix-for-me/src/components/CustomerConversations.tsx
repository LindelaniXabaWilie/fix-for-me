import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { serviceName } from '../data/services'
import ConversationThread from './ConversationThread'
import './CustomerConversations.css'

type ConversationRow = {
  id: string
  created_at: string
  request_id: string
  provider_id: string
  provider_profiles: { business_name: string } | null
  service_requests: { service_id: string } | null
}

function formatWhen(iso: string) {
  const d = new Date(iso)
  return d.toDateString() === new Date().toDateString()
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

export default function CustomerConversations() {
  const [conversations, setConversations] = useState<ConversationRow[]>([])
  const [open, setOpen] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    supabase
      .from('conversations')
     .select('id, created_at, request_id, provider_id, provider_profiles(business_name), service_requests(service_id)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return
        if (error) setError(error.message)
        else setConversations((data ?? []) as unknown as ConversationRow[])
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) return <p className="msgs-status">Loading conversations…</p>
  if (error) return <p className="page-error">{error}</p>

  if (conversations.length === 0) {
    return (
      <div className="msgs-empty">
        <h2>No messages yet</h2>
        <p>Conversations with providers about your requests will appear here.</p>
      </div>
    )
  }
    const current = conversations.find((c) => c.id === open) ?? null
  const currentName = current?.provider_profiles?.business_name ?? 'Provider'
  const currentService = current?.service_requests ? serviceName(current.service_requests.service_id) : ''

  return (
    <div className={`msgs${open ? ' has-open' : ''}`}>
      <aside className="msgs-list" aria-label="Conversations">
        <div className="msgs-list-head">Conversations</div>
        <ul>
          {conversations.map((c) => {
            const name = c.provider_profiles?.business_name ?? 'Provider'
            const service = c.service_requests ? serviceName(c.service_requests.service_id) : ''
            const isActive = open === c.id
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className={`msgs-item${isActive ? ' active' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => setOpen(c.id)}
                >
                  <span className="msgs-avatar">{name[0]?.toUpperCase() ?? '?'}</span>
                  <span className="msgs-item-text">
                    <span className="msgs-item-name">{name}</span>
                    {service && <span className="msgs-item-service">{service}</span>}
                  </span>
                   <span className="msgs-item-when">{formatWhen(c.created_at)}</span>
                  <span className="msgs-item-chevron" aria-hidden="true">›</span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

            <section className="msgs-thread">
        {current && (
          <header className="msgs-thread-head">
            <button
              type="button"
              className="msgs-back"
              onClick={() => setOpen(null)}
              aria-label="Back to conversations"
            >
              ‹
            </button>
            <span className="msgs-avatar">{currentName[0]?.toUpperCase() ?? '?'}</span>
            <span className="msgs-item-text">
              <span className="msgs-item-name">{currentName}</span>
              {currentService && <span className="msgs-item-service">{currentService}</span>}
            </span>
          </header>
        )}
        {open ? (
          <ConversationThread key={open} conversationId={open} onClose={() => setOpen(null)} />
        ) : (
          <div className="msgs-placeholder">
            <strong>Select a conversation</strong>
            <span>Choose a provider on the left to view your messages.</span>
          </div>
        )}
      </section>
    </div>
  )
}
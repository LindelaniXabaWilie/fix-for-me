import { useEffect, useRef, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
}

type Props = {
  conversationId: string
  onClose: () => void
}

export default function ConversationThread({ conversationId, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  useEffect(() => {
    let active = true
    supabase
      .from('messages')
      .select('id, conversation_id, sender_id, body, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (active && !error && data) setMessages(data as Message[])
      })
    return () => {
      active = false
    }
  }, [conversationId])

  useEffect(() => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message]),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!body.trim() || !userId) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      body: body.trim(),
    })
    if (!error) setBody('')
    setSending(false)
  }

  return (
    <div className="conversation-overlay" onClick={onClose}>
      <div className="conversation-thread" onClick={(e) => e.stopPropagation()}>
        <div className="conversation-thread-head">
  
          <button type="button" onClick={onClose} aria-label="Close conversation">&times;</button>
        </div>

        <div className="conversation-messages">
          {messages.map((m) => (
            <div key={m.id} className={`conversation-message${m.sender_id === userId ? ' own' : ''}`}>
              <p>{m.body}</p>
              <span>{new Date(m.created_at).toLocaleTimeString()}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="conversation-input">
          <input type="text" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message…" />
          <button type="submit" disabled={sending || !body.trim()}>Send</button>
        </form>
      </div>
    </div>
  )
}
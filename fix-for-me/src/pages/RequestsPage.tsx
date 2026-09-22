import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { serviceName } from '../data/services'
import './PageShell.css'

type RequestRow = {
  id: string
  service_id: string
  status: string
  created_at: string
  details: string | null
  address: string | null
  preferred_date: string | null
}

export default function RequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (active) setLoading(false); return }
      const { data, error } = await supabase
        .from('service_requests')
        .select('id, service_id, status, created_at, details, address, preferred_date')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!active) return
      if (error) setError(error.message)
      else setRows((data ?? []) as RequestRow[])
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])

  return (
    <div className="pg">
      <header className="pg-head">
        <h1>My requests</h1>
        <p>Everything you've asked for, newest first.</p>
      </header>

      {loading && <p className="pg-empty">Loading…</p>}
      {error && <p className="page-error">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <div className="pg-card pg-empty">No requests yet. Pick a service to get started.</div>
      )}

      <ul className="req-list">
        {rows.map((r) => (
          <li key={r.id} className="req-item">
            <div className="req-item-top">
              <strong>{serviceName(r.service_id)}</strong>
              <span className={`recent-status recent-status-${r.status}`}>{r.status}</span>
            </div>
            {r.details && <p className="req-item-details">{r.details}</p>}
            <div className="req-item-meta">
              {r.address && <>{r.address} · </>}
              {r.preferred_date && <>Preferred {new Date(r.preferred_date).toLocaleDateString()} · </>}
              Sent {new Date(r.created_at).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './AdminPage.css'

type ProviderRow = {
  user_id: string
  business_name: string
  services: string[]
  service_area: string | null
  phone: string | null
  status: 'pending' | 'approved' | 'rejected'
}

export default function AdminPage() {
  const [providers, setProviders] = useState<ProviderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')

  async function load() {
    setLoading(true)
    let query = supabase
      .from('provider_profiles')
      .select('user_id, business_name, services, service_area, phone, status')
      .order('business_name')
    if (filter === 'pending') query = query.eq('status', 'pending')

    const { data, error } = await query
    if (error) setError(error.message)
    else setProviders((data ?? []) as ProviderRow[])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function updateStatus(user_id: string, status: 'approved' | 'rejected') {
    const { error } = await supabase.from('provider_profiles').update({ status }).eq('user_id', user_id)
    if (error) {
      setError(error.message)
      return
    }
    setProviders((prev) => prev.filter((p) => p.user_id !== user_id))
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>Provider applications</h1>
        <div className="admin-filter">
          <button type="button" className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
            Pending
          </button>
          <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            All
          </button>
        </div>
      </header>

      {error && <p className="page-error">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : providers.length === 0 ? (
        <p>No {filter === 'pending' ? 'pending ' : ''}applications.</p>
      ) : (
        <ul className="admin-list">
          {providers.map((p) => (
            <li key={p.user_id} className="admin-row">
              <div className="admin-row-main">
                <strong>{p.business_name}</strong>
                <span className={`status-badge status-${p.status}`}>{p.status}</span>
              </div>
              <div className="admin-row-meta">
                <span>{p.services?.join(', ')}</span>
                {p.service_area && <span>{p.service_area}</span>}
                {p.phone && <span>{p.phone}</span>}
              </div>
              {p.status !== 'approved' && (
                <div className="admin-row-actions">
                  <button type="button" className="page-submit" onClick={() => updateStatus(p.user_id, 'approved')}>
                    Approve
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => updateStatus(p.user_id, 'rejected')}>
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
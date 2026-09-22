import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { isWithinCoverage } from '../lib/geo'
import { serviceName } from '../data/services'
import { getOrCreateConversation } from '../lib/conversations'
import ConversationThread from './ConversationThread'

type RequestDetail = {
  id: string
  user_id: string
  service_id: string
  details: string | null
  address: string | null
  photo_urls: string[] | null
  latitude: number | null
  longitude: number | null
  preferred_date: string | null
  status: string
  created_at: string
}

type Props = {
  services: string[]
  coverageArea: GeoJSON.Polygon | null
  active: boolean
}

export default function ProviderRequestsPanel({ services, coverageArea, active }: Props) {
  const [requests, setRequests] = useState<RequestDetail[]>([])
  const [loading, setLoading] = useState(true)

  const [openConversation, setOpenConversation] = useState<string | null>(null)

async function openThread(request: RequestDetail) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const id = await getOrCreateConversation(request.id, request.user_id, user.id)
  setOpenConversation(id)
}
  async function load() {
    if (!active || services.length === 0) {
      setRequests([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('service_requests')
     .select('id, user_id, service_id, details, address, photo_urls, latitude, longitude, preferred_date, status, created_at')
      .in('service_id', services)
      .order('created_at', { ascending: false })
      .limit(30)

    if (!error && data) {
      const inCoverage = (r: RequestDetail) =>
        r.latitude == null || r.longitude == null
          ? true
          : isWithinCoverage({ lat: r.latitude, lng: r.longitude }, coverageArea)
      setRequests((data as RequestDetail[]).filter(inCoverage))
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, services.join(','), JSON.stringify(coverageArea)])

  useEffect(() => {
    if (!active || services.length === 0) return
    const channel = supabase
      .channel('service-requests-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'service_requests' },
        () => load(), // simplest correct approach: re-fetch so RLS/filters stay authoritative
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, services.join(','), JSON.stringify(coverageArea)])

  if (!active) return null

  return (
    <section className="settings-section">
      <h2>Requests near you</h2>
      {loading ? (
        <p>Loading…</p>
      ) : requests.length === 0 ? (
        <p className="settings-section-sub">No matching requests right now.</p>
      ) : (
        <ul className="provider-requests-list">
          {requests.map((r) => (
            <li key={r.id} className="provider-request-card">
              <div className="provider-request-head">
                <strong>{serviceName(r.service_id)}</strong>
                <span className={`recent-status recent-status-${r.status}`}>{r.status}</span>
              </div>
              {r.details && <p>{r.details}</p>}
              <div className="provider-request-meta">
                {r.address && <span>📍 {r.address}</span>}
                {r.preferred_date && <span>📅 {r.preferred_date}</span>}
                <span>{new Date(r.created_at).toLocaleString()}</span>
              </div>
              {r.photo_urls && r.photo_urls.length > 0 && (
                <div className="provider-request-photos">
                  {r.photo_urls.map((url) => (
                    <img key={url} src={url} alt="" />
                  ))}
                  <button type="button" className="btn-secondary" onClick={() => openThread(r)}>
  Message customer
</button>
{openConversation && (
  <ConversationThread conversationId={openConversation} onClose={() => setOpenConversation(null)} />
)}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
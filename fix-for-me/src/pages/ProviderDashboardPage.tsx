import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ProviderRequestsPanel from '../components/ProviderRequestsPanel'
import './PageShell.css'

export default function ProviderDashboardPage() {
  const [services, setServices] = useState<string[]>([])
  const [coverage, setCoverage] = useState<GeoJSON.Polygon | null>(null)
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (alive) setLoading(false); return }
      const { data } = await supabase
        .from('provider_profiles')
        .select('services, coverage_area, status')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!alive) return
      setServices(data?.services ?? [])
      setCoverage(data?.coverage_area ?? null)
      setActive(data?.status === 'approved')
      setLoading(false)
    }
    load()
    return () => { alive = false }
  }, [])

  return (
    <div className="pg">
      <header className="pg-head">
        <h1>Provider dashboard</h1>
        <p>New requests in your area and services.</p>
      </header>
      {loading ? (
        <p className="pg-empty">Loading…</p>
      ) : (
        <ProviderRequestsPanel services={services} coverageArea={coverage} active={active} />
      )}
    </div>
  )
}
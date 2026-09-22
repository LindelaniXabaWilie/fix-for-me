import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { isWithinCoverage } from '../lib/geo'
import { serviceName } from '../data/services'

type Broadcast = {
  id: string
  service_id: string
  latitude: number | null
  longitude: number | null
}

type Props = {
  services: string[]
  coverageArea: GeoJSON.Polygon | null
  active: boolean
}

export default function CoverageAlertListener({ services, coverageArea, active }: Props) {
  const [alerts, setAlerts] = useState<Broadcast[]>([])

  useEffect(() => {
    if (!active || services.length === 0) return

    const channel = supabase
  .channel('request-broadcasts')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'request_broadcasts' },
    (payload) => {
      console.log('[coverage-alert] received', payload.new)
      const row = payload.new as Broadcast
      if (!services.includes(row.service_id)) return
      if (row.latitude == null || row.longitude == null) return
      if (!isWithinCoverage({ lat: row.latitude, lng: row.longitude }, coverageArea)) return
      setAlerts((prev) => [row, ...prev].slice(0, 5))
    },
  )
  .subscribe((status) => console.log('[coverage-alert] channel status:', status))
    

    return () => {
      supabase.removeChannel(channel)
    }
  }, [active, services, coverageArea])

  if (alerts.length === 0) return null

  return (
    <div className="coverage-alerts">
      {alerts.map((a) => (
        <div key={a.id} className="coverage-alert">
          New {serviceName(a.service_id)} request just came in near you.
          <button type="button" onClick={() => setAlerts((prev) => prev.filter((x) => x.id !== a.id))}>
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}
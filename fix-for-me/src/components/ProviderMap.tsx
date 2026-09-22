import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { supabase } from '../lib/supabaseClient'
import { isWithinCoverage } from '../lib/geo'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

type ProviderPin = {
  user_id: string
  business_name: string
  latitude: number
  longitude: number
  coverage_area: GeoJSON.Polygon | null
}

type Props = {
  serviceId: string
  center: { lat: number; lng: number }
  selected: string[]
  onToggle: (providerId: string) => void
}

export default function ProviderMap({ serviceId, center, selected, onToggle }: Props) {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({})
  const [providers, setProviders] = useState<ProviderPin[]>([])

  useEffect(() => {
    supabase
      .from('provider_profiles')
      .select('user_id, business_name, latitude, longitude, coverage_area')
      .contains('services', [serviceId])
      .eq('status', 'approved')
      .not('latitude', 'is', null)
      .then(({ data, error }) => {
        if (!error && data) setProviders(data as ProviderPin[])
      })
  }, [serviceId])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [center.lng, center.lat],
      zoom: 11,
    })
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    new mapboxgl.Marker({ color: '#1f6feb' })
      .setLngLat([center.lng, center.lat])
      .setPopup(new mapboxgl.Popup().setText('Your location'))
      .addTo(mapRef.current)
  }, [center.lat, center.lng])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    providers.forEach((p) => {
      const inCoverage = isWithinCoverage(center, p.coverage_area)
      const el = document.createElement('button')
      el.type = 'button'
      el.className = [
        'provider-pin',
        selected.includes(p.user_id) ? 'selected' : '',
        inCoverage ? '' : 'out-of-coverage',
      ].join(' ')
      el.title = inCoverage ? p.business_name : `${p.business_name} (outside their usual coverage area)`
      el.onclick = () => onToggle(p.user_id)

      markersRef.current[p.user_id] = new mapboxgl.Marker({ element: el })
        .setLngLat([p.longitude, p.latitude])
        .addTo(map)
    })
  }, [providers, selected, onToggle, center])

  useEffect(() => {
  const map = mapRef.current
  if (!map) return

  const featureCollection: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: providers
      .filter((p) => p.coverage_area)
      .map((p) => ({
        type: 'Feature',
        geometry: p.coverage_area as GeoJSON.Polygon,
        properties: { provider_id: p.user_id, selected: selected.includes(p.user_id) },
      })),
  }

  const applyLayers = () => {
    const source = map.getSource('coverage-areas') as mapboxgl.GeoJSONSource | undefined
    if (source) {
      source.setData(featureCollection)
      return
    }
    map.addSource('coverage-areas', { type: 'geojson', data: featureCollection })
    map.addLayer({
      id: 'coverage-fill',
      type: 'fill',
      source: 'coverage-areas',
      paint: {
        'fill-color': ['case', ['get', 'selected'], '#16a34a', '#2563eb'],
        'fill-opacity': 0.12,
      },
    })
    map.addLayer({
      id: 'coverage-outline',
      type: 'line',
      source: 'coverage-areas',
      paint: {
        'line-color': ['case', ['get', 'selected'], '#16a34a', '#2563eb'],
        'line-width': 1.5,
      },
    })
  }

  if (map.isStyleLoaded()) applyLayers()
  else map.once('load', applyLayers)
}, [providers, selected])

return (
  <div
    ref={containerRef}
    className="provider-map"
    style={{ width: '100%', height: '320px', borderRadius: 12, overflow: 'hidden', margin: '0.5rem 0 1rem' }}
  />
)
}
import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

type Props = {
  center: { lat: number; lng: number }
  value: GeoJSON.Polygon | null
  onChange: (polygon: GeoJSON.Polygon | null) => void
}

export default function CoverageAreaMap({ center, value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [center.lng, center.lat],
      zoom: 11,
    })
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
    })
    map.addControl(draw, 'top-left')

   map.on('load', () => {
  map.resize()
  if (value) draw.add(value)
})

    const update = () => {
      const data = draw.getAll()
      onChange((data.features[0]?.geometry as GeoJSON.Polygon) ?? null)
    }
    map.on('draw.create', update)
    map.on('draw.update', update)
    map.on('draw.delete', update)

    mapRef.current = map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

return (
  <div>
    <div
      ref={containerRef}
      className="coverage-map"
      style={{ width: '100%', height: '320px', borderRadius: 12, overflow: 'hidden', margin: '0.5rem 0' }}
    />
    <p className="coverage-hint">Draw the area you cover, then save your settings.</p>
  </div>
)
}
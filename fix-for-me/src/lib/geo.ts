import { booleanPointInPolygon, point } from '@turf/turf'

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address,
  )}.json?access_token=${token}&limit=1`

  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const [lng, lat] = data.features?.[0]?.center ?? []
  return lng != null ? { lat, lng } : null
}
export async function suggestAddresses(
  query: string,
): Promise<{ label: string; lat: number; lng: number }[]> {
  if (query.trim().length < 3) return []
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query,
  )}.json?access_token=${token}&autocomplete=true&country=za&limit=5`

  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  return (data.features ?? []).map((f: { place_name: string; center: [number, number] }) => ({
    label: f.place_name,
    lat: f.center[1],
    lng: f.center[0],
  }))
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1`

  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  return data.features?.[0]?.place_name ?? null
}
export function isWithinCoverage(
  loc: { lat: number; lng: number },
  polygon: GeoJSON.Polygon | null,
) {
  if (!polygon) return true // no declared area = assume they cover everywhere
  return booleanPointInPolygon(point([loc.lng, loc.lat]), polygon)
}
import { useEffect, useRef, useState } from 'react'
import { suggestAddresses, reverseGeocode } from '../lib/geo'

export type Location = { address: string; lat: number; lng: number }

type Props = {
  label: string
  value: Location | null
  onChange: (loc: Location | null) => void
  placeholder?: string
}

export default function LocationPicker({ label, value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState(value?.address ?? '')
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [open, setOpen] = useState(false)
  const [locating, setLocating] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setQuery(value?.address ?? '')
  }, [value?.address])

  function useMyLocation() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const address = (await reverseGeocode(lat, lng)) ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        setLocating(false)
        selectSuggestion({ address, lat, lng })
      },
      () => setLocating(false),
    )
  }

  // Silently prefill if permission was already granted previously — no prompt shown.
  useEffect(() => {
    if (value || !('permissions' in navigator)) return
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((status) => {
        if (status.state === 'granted') useMyLocation()
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleQueryChange(next: string) {
    setQuery(next)
    onChange(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const results = await suggestAddresses(next)
      setSuggestions(results.map((r) => ({ address: r.label, lat: r.lat, lng: r.lng })))
      setOpen(results.length > 0)
    }, 300)
  }

  function selectSuggestion(loc: Location) {
    setQuery(loc.address)
    setSuggestions([])
    setOpen(false)
    onChange(loc)
  }

  return (
    <div className="location-picker">
      <label>
        {label}
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setOpen(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder ?? 'Start typing a street or suburb…'}
          autoComplete="off"
        />
      </label>

      {open && suggestions.length > 0 && (
        <ul className="location-suggestions">
          {suggestions.map((s) => (
            <li key={`${s.lat}-${s.lng}`}>
              <button type="button" onMouseDown={() => selectSuggestion(s)}>
                {s.address}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="btn-secondary location-use-current"
        onClick={useMyLocation}
        disabled={locating}
      >
        {locating ? 'Finding you…' : 'Use my current location'}
      </button>

      {value && <p className="location-confirmed">📍 {value.address}</p>}
    </div>
  )
}
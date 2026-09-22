// src/pages/ServicesPage.tsx
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import { SERVICES, type Service } from '../data/services'
import ServiceIcon from '../components/ServiceIcon'
import './ServicesPage.css'
import ImageUpload from '../components/ImageUpload'
import ProviderMap from '../components/ProviderMap'
import SuggestServiceForm from '../components/SuggestServiceForm'

import LocationPicker, { type Location } from '../components/LocationPicker'

type RequestRow = {
  id: string
  service_id: string
  status: string
  created_at: string
}

export default function ServicesPage() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Service | null>(null)

  const [details, setDetails] = useState('')

  const [date, setDate] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
const [, setRequests] = useState<RequestRow[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])

  // remove: import { geocodeAddress } from '../lib/geo'  (no longer used directly here)

  const [location, setLocation] = useState<Location | null>(null)
  // remove: const [address, setAddress] = useState('')
  // remove: const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  // remove handleAddressBlur entirely
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])

  const panelRef = useRef<HTMLElement | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SERVICES
    return SERVICES.filter(
      (s) => s.name.toLowerCase().includes(q) || s.blurb.toLowerCase().includes(q),
    )
  }, [query])

  useEffect(() => {
    let active = true
    supabase
      .from('service_requests')
      .select('id, service_id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (active && !error && data) setRequests(data as RequestRow[])
      })
    return () => {
      active = false
    }
  }, [])

  function openService(service: Service) {
    setSelected(service)
    setError(null)
    setSuccess(null)
    setSelectedProviders([])
    setLocation(null)
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selected) return

    setError(null)
    setSuccess(null)
    setSubmitting(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You need to be signed in to send a request.')
      setSubmitting(false)
      return
    }
    const { data: inserted, error: insertError } = await supabase
      .from('service_requests')
      .insert({
        user_id: user.id,
        service_id: selected.id,
        details: details.trim() || null,
        address: location?.address ?? null,
        preferred_date: date || null,
        photo_urls: photoUrls.length ? photoUrls : null,
        latitude: location?.lat ?? null,
        longitude: location?.lng ?? null,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      setError(insertError?.message ?? 'Something went wrong.')
      setSubmitting(false)
      return
    }

    if (selectedProviders.length > 0) {
      await supabase.from('request_providers').insert(
        selectedProviders.map((provider_id) => ({ request_id: inserted.id, provider_id })),
      )
    }

    // const { error: insertError } = await supabase.from('service_requests').insert({
    //   user_id: user.id,
    //   service_id: selected.id,
    //   details: details.trim() || null,
    //   address: address.trim() || null,
    //   preferred_date: date || null,
    // })

    // if (insertError) {
    //   setError(insertError.message)
    //   setSubmitting(false)
    //   return
    // }

    setSuccess(`Request sent — we'll match you with a ${selected.name.toLowerCase()} pro shortly.`)
    setDetails('')
    setLocation(null)
    setDate('')
    setSubmitting(false)

    const { data } = await supabase
      .from('service_requests')
      .select('id, service_id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setRequests(data as RequestRow[])
  }

  //   async function handleAddressBlur() {
  //   if (coords || !address.trim()) return
  //   const geo = await geocodeAddress(address)
  //   if (geo) setCoords(geo)
  // }

  return (
    <div className="services-page">
      <header className="services-head">
        <p className="services-eyebrow">FixForMe</p>
        <h1>What needs fixing?</h1>
        <p>
          Pick a service below and tell us what&rsquo;s wrong. Vetted pros near you will send a
          quote — usually within the hour.
        </p>
      </header>

      <div className="services-search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services — plumbing, moving, electrical…"
          aria-label="Search services"
        />
      </div>

      {selected && (
        <div className="request-overlay" onClick={() => setSelected(null)}>
        <section
          className="request-panel"
          role="dialog"
          aria-modal="true"
          aria-live="polite"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="request-panel-head">
            <span className="request-panel-icon">
              <ServiceIcon id={selected.id} size={22} />
            </span>
            <div className="request-panel-title">
              <h2>{selected.name}</h2>
              <p>{selected.blurb}</p>
            </div>
            <button
              type="button"
              className="request-panel-close"
              onClick={() => setSelected(null)}
              aria-label="Close request form"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="request-form">
            <label>
              What needs doing?
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g. Kitchen tap drips constantly and the pipe under the sink is wet."
              />
            </label>

            <div className="request-form-row">
              <LocationPicker label="Address" value={location} onChange={setLocation} />

              <label>
                Preferred date
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
            </div>
            <ImageUpload
              bucket="request-photos"
              pathPrefix="requests"
              onChange={setPhotoUrls}
            />

            {location && (
              <ProviderMap
                serviceId={selected.id}
                center={{ lat: location.lat, lng: location.lng }}
                selected={selectedProviders}
                onToggle={(id) =>
                  setSelectedProviders((prev) =>
                    prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
                  )
                }
              />
            )}

            {error && <p className="page-error">{error}</p>}
            {success && <p className="page-success">{success}</p>}

            <button type="submit" className="page-submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send request'}
            </button>
          </form>

        </section>
      </div>
      )}

      {filtered.length === 0 ? (
        <div className="services-empty">
          <p>No services match &ldquo;{query}&rdquo;. Try a different word.</p>
          <SuggestServiceForm />
        </div>
      ) : (
        <div className="services-grid">
          {filtered.map((service) => (
            <button
              key={service.id}
              type="button"
              className={`service-card${selected?.id === service.id ? ' selected' : ''}`}
              onClick={() => openService(service)}
            >
              <span className="service-card-icon">
                <ServiceIcon id={service.id} />
              </span>
              <h3>{service.name}</h3>
              <p>{service.blurb}</p>
              <span className="service-card-cta">Request &rarr;</span>
            </button>
          ))}
        </div>
      )}

      

    </div>
  )
}
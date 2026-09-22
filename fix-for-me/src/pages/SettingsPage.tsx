// src/pages/SettingsPage.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import { SERVICES } from '../data/services'
import ServiceIcon from '../components/ServiceIcon'
import './SettingsPage.css'
import CoverageAreaMap from '../components/CoverageAreaMap'
import LocationPicker, { type Location } from '../components/LocationPicker'

const MAX_SERVICES = 6

type ProviderStatus = 'pending' | 'approved' | 'rejected'
type Tab = 'account' | 'provider'

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('account')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState<ProviderStatus | null>(null)

  const [businessName, setBusinessName] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [serviceArea, setServiceArea] = useState('')
  const [phone, setPhone] = useState('')
  const [years, setYears] = useState('')
  const [rate, setRate] = useState('')
  const [bio, setBio] = useState('')

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const [coveragePolygon, setCoveragePolygon] = useState<GeoJSON.Polygon | null>(null)
  const [physicalLocation, setPhysicalLocation] = useState<Location | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!active) return

      if (!user) {
        setLoading(false)
        return
      }

      setEmail(user.email ?? '')

      const { data, error } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!active) return

      if (error) {
        setPageError(error.message)
      } else if (data) {
        setBusinessName(data.business_name ?? '')
        setSelectedServices(data.services ?? [])
        setServiceArea(data.service_area ?? '')
        setPhone(data.phone ?? '')
        setYears(data.years_experience != null ? String(data.years_experience) : '')
        setRate(data.hourly_rate != null ? String(data.hourly_rate) : '')
        setBio(data.bio ?? '')
        setStatus((data.status as ProviderStatus) ?? 'pending')
        if (data.latitude != null && data.longitude != null) {
          setPhysicalLocation({
            address: data.physical_address ?? '',
            lat: data.latitude,
            lng: data.longitude,
          })
        }
        setCoveragePolygon(data.coverage_area ?? null)
        setShowForm(true)
      }

      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  function toggleService(id: string) {
    setSelectedServices((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id)
      if (prev.length >= MAX_SERVICES) return prev
      return [...prev, id]
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!businessName.trim()) {
      setFormError('Add a business or trading name.')
      return
    }

    if (selectedServices.length === 0) {
      setFormError('Choose at least one service you provide.')
      return
    }

    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setFormError('You need to be signed in.')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('provider_profiles').upsert(
      {
        user_id: user.id,
        business_name: businessName.trim(),
        services: selectedServices,
        service_area: serviceArea.trim() || null,
        phone: phone.trim() || null,
        years_experience: years === '' ? null : Number(years),
        hourly_rate: rate === '' ? null : Number(rate),
        bio: bio.trim() || null,
        physical_address: physicalLocation?.address ?? null,
        latitude: physicalLocation?.lat ?? null,
        longitude: physicalLocation?.lng ?? null,
        coverage_area: coveragePolygon,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

    setSaving(false)

    if (error) {
      setFormError(error.message)
      return
    }

    setStatus((prev) => prev ?? 'pending')
    setFormSuccess(
      status === 'approved'
        ? 'Profile updated.'
        : 'Application submitted — we\u2019ll review it and email you within 2 working days.',
    )
  }

  if (loading) return <div className="settings-loading">Loading settings…</div>

  return (
    <div className="settings-page">
      <header className="settings-head">
        <p className="settings-eyebrow">Settings</p>
        <h1>Your account</h1>
        <p>Manage your details and apply to work as a FixForMe service provider.</p>
      </header>

      {pageError && <p className="page-error">{pageError}</p>}

      <div className="settings-layout">
        <nav className="settings-tabs" aria-label="Settings sections">
          <button
            type="button"
            className={tab === 'account' ? 'active' : ''}
            onClick={() => setTab('account')}
          >
            Account
          </button>
          <button
            type="button"
            className={tab === 'provider' ? 'active' : ''}
            onClick={() => setTab('provider')}
          >
            Provider profile
          </button>
        </nav>

        <div className="settings-content">
          {/* ---------- Account ---------- */}
          {tab === 'account' && (
            <section className="settings-section">
              <h2>Account</h2>
              <dl className="account-list">
                <div>
                  <dt>Email</dt>
                  <dd>{email || '—'}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{status ? 'Service provider' : 'Customer'}</dd>
                </div>
              </dl>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => supabase.auth.signOut()}
              >
                Sign out
              </button>
            </section>
          )}

          {/* ---------- Provider application ---------- */}
          {tab === 'provider' && (
            <section className="settings-section">
              <div className="settings-section-head">
                <div>
                  <h2>Work as a service provider</h2>
                  <p className="settings-section-sub">
                    Tell us what you do and where you work. Approved providers appear in customer
                    searches and can quote on requests.
                  </p>
                </div>
                {status && (
                  <span className={`status-badge status-${status}`}>
                    {status === 'approved'
                      ? 'Approved'
                      : status === 'rejected'
                        ? 'Not approved'
                        : 'Pending review'}
                  </span>
                )}
              </div>

              {!showForm ? (
                <button type="button" className="page-submit" onClick={() => setShowForm(true)}>
                  Apply to become a provider
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="provider-form">
                  <div className="form-card">
                    <h3>Business</h3>

                    <label>
                      Business / trading name
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Thabo's Plumbing &amp; Drains"
                        required
                      />
                    </label>

                    <fieldset className="service-picker">
                      <legend>
                        Services you provide{' '}
                        <span className="service-picker-hint">
                          ({selectedServices.length}/{MAX_SERVICES} selected)
                        </span>
                      </legend>

                      <div className="service-picker-grid">
                        {SERVICES.map((service) => {
                          const checked = selectedServices.includes(service.id)
                          const disabled = !checked && selectedServices.length >= MAX_SERVICES
                          return (
                            <label
                              key={service.id}
                              className={`service-check${checked ? ' checked' : ''}${
                                disabled ? ' disabled' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={() => toggleService(service.id)}
                              />
                              <ServiceIcon id={service.id} size={18} />
                              <span>{service.name}</span>
                            </label>
                          )
                        })}
                      </div>
                    </fieldset>

                    <div className="provider-form-row">
                      <label>
                        Service area
                        <input
                          type="text"
                          value={serviceArea}
                          onChange={(e) => setServiceArea(e.target.value)}
                          placeholder="e.g. Cape Town, Southern Suburbs"
                        />
                      </label>

                      <label>
                        Contact number
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+27 82 000 0000"
                          autoComplete="tel"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="form-card">
                    <h3>Location &amp; coverage</h3>

                    <LocationPicker
                      label="Your business location"
                      value={physicalLocation}
                      onChange={setPhysicalLocation}
                    />

                    {physicalLocation && (
                      <CoverageAreaMap
                        center={{ lat: physicalLocation.lat, lng: physicalLocation.lng }}
                        value={coveragePolygon}
                        onChange={setCoveragePolygon}
                      />
                    )}
                  </div>

                  <div className="form-card">
                    <h3>Experience &amp; pricing</h3>

                    <div className="provider-form-row">
                      <label>
                        Years of experience
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={years}
                          onChange={(e) => setYears(e.target.value)}
                          placeholder="5"
                        />
                      </label>

                      <label>
                        Hourly rate (optional)
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={rate}
                          onChange={(e) => setRate(e.target.value)}
                          placeholder="350"
                        />
                      </label>
                    </div>

                    <label>
                      About your work
                      <textarea
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Briefly describe your experience, qualifications and the jobs you take on."
                      />
                    </label>
                  </div>

                  {formError && <p className="page-error">{formError}</p>}
                  {formSuccess && <p className="page-success">{formSuccess}</p>}

                  <div className="provider-form-actions">
                    <button type="submit" className="page-submit" disabled={saving}>
                      {saving ? 'Saving…' : status ? 'Save changes' : 'Submit application'}
                    </button>
                    {!status && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
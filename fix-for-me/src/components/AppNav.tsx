import { useEffect, useRef, useState } from 'react'
import './AppNav.css'

export type View = 'services' | 'requests' | 'messages' | 'provider' | 'settings' | 'admin'

type Props = {
  view: View
  onChange: (view: View) => void
  email: string
  onSignOut: () => void
  isAdmin?: boolean
  isProvider?: boolean
}

export default function AppNav({ view, onChange, email, onSignOut, isAdmin, isProvider }: Props) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const initials = email ? email[0].toUpperCase() : '?'

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const links: { id: View; label: string }[] = [
    { id: 'services', label: 'Services' },
    { id: 'requests', label: 'My requests' },
    { id: 'messages', label: 'Messages' },
    ...(isProvider ? [{ id: 'provider' as View, label: 'Provider dashboard' }] : []),
    ...(isAdmin ? [{ id: 'admin' as View, label: 'Admin' }] : []),
  ]

  return (
    <header className="topnav">
      <button type="button" className="topnav-brand" onClick={() => onChange('services')}>
        <span className="topnav-logo">FF</span>
        <span className="topnav-name">FixForMe</span>
      </button>

      <nav className="topnav-links">
        {links.map((l) => (
          <button
            key={l.id}
            type="button"
            className={view === l.id ? 'active' : ''}
            onClick={() => onChange(l.id)}
          >
            {l.label}
          </button>
        ))}
      </nav>

      <div className="topnav-user" ref={menuRef}>
        <button
          type="button"
          className={`topnav-avatar${view === 'settings' ? ' active' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {initials}
        </button>
        {open && (
          <div className="topnav-menu" role="menu">
            <div className="topnav-menu-email">{email}</div>
            <button type="button" role="menuitem" onClick={() => { onChange('settings'); setOpen(false) }}>
              Settings
            </button>
            <button type="button" role="menuitem" onClick={() => { setOpen(false); onSignOut() }}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
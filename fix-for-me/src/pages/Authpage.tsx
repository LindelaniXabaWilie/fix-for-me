import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import './AuthPage.css'

type Mode = 'login' | 'signup'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const isSignup = mode === 'signup'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (isSignup && password !== confirmPassword) {
      setError('Passwords don\u2019t match.')
      return
    }

    setLoading(true)

    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your inbox to confirm your email, then log in.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      }
      // On success, your router/auth listener should redirect the user.
    }

    setLoading(false)
  }

  async function handleGoogle() {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <div className="auth-brand-mark">FixForMe</div>

        <svg
          className="auth-illustration"
          viewBox="0 0 360 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="0.5" y="0.5" width="359" height="299" stroke="#3E6272" strokeOpacity="0.4" />
          {[...Array(9)].map((_, i) => (
            <line key={`v${i}`} x1={i * 45} y1="0" x2={i * 45} y2="300" stroke="#3E6272" strokeOpacity="0.18" />
          ))}
          {[...Array(7)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 45} x2="360" y2={i * 45} stroke="#3E6272" strokeOpacity="0.18" />
          ))}

          {/* house outline */}
          <path
            d="M60 190 L60 120 L180 55 L300 120 L300 190"
            stroke="#EAF3F5"
            strokeWidth="2.5"
            fill="none"
          />
          <rect x="60" y="190" width="240" height="70" stroke="#EAF3F5" strokeWidth="2.5" fill="none" />

          {/* wrench */}
          <g transform="translate(96,208)">
            <circle cx="0" cy="0" r="12" stroke="#E3922B" strokeWidth="3" fill="none" />
            <path d="M8 8 L34 34" stroke="#E3922B" strokeWidth="5" strokeLinecap="round" />
            <circle cx="34" cy="34" r="7" stroke="#E3922B" strokeWidth="3" fill="none" />
          </g>

          {/* pipe / plumbing */}
          <g transform="translate(160,205)" stroke="#7FB8C4" strokeWidth="4" fill="none" strokeLinecap="round">
            <path d="M0 0 L0 20 L26 20 L26 40" />
            <circle cx="0" cy="0" r="4" fill="#7FB8C4" stroke="none" />
          </g>

          {/* moving truck */}
          <g transform="translate(210,222)">
            <rect x="0" y="-18" width="34" height="18" stroke="#B6512E" strokeWidth="2.5" fill="none" />
            <path d="M34 -12 H50 L58 -2 V0 H34 Z" stroke="#B6512E" strokeWidth="2.5" fill="none" />
            <circle cx="10" cy="2" r="5" stroke="#B6512E" strokeWidth="2.5" fill="none" />
            <circle cx="46" cy="2" r="5" stroke="#B6512E" strokeWidth="2.5" fill="none" />
          </g>
        </svg>

        <div className="auth-brand-copy">
          <h1>Get it fixed, fast.</h1>
          <p>Vetted plumbers, movers and handymen near you &mdash; booked in minutes.</p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={mode === 'login' ? 'active' : ''}
              onClick={() => { setMode('login'); setError(null); setMessage(null) }}
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => { setMode('signup'); setError(null); setMessage(null) }}
            >
              Sign up
            </button>
          </div>

        
          <div className="auth-divider"><span>or</span></div>

          <form onSubmit={handleSubmit} noValidate>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
              />
            </label>

            {isSignup && (
              <label>
                Confirm password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </label>
            )}
  <button type="button" className="google-btn" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>

            {error && <p className="auth-error">{error}</p>}
            {message && <p className="auth-message">{message}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Please wait\u2026' : isSignup ? 'Create account' : 'Log in'}
            </button>
          </form>

          <p className="auth-switch">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => setMode(isSignup ? 'login' : 'signup')}>
              {isSignup ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
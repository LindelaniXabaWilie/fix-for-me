import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabaseClient'
import AuthPage from './pages/Authpage'
import ServicesPage from './pages/ServicesPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'
import AppNav, { type View } from './components/AppNav'
import './App.css'
import MessagesPage from './pages/MessagesPage'
import RequestsPage from './pages/RequestsPage'
import ProviderDashboardPage from './pages/ProviderDashboardPage'

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean)

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('services')
   
 const [providerStatus, setProviderStatus] = useState<string | null>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (event === 'SIGNED_OUT') setView('services')
      if (event === 'SIGNED_IN') setView('services')
    })

    return () => sub.subscription.unsubscribe()
  }, [])

    useEffect(() => {
    const uid = session?.user.id
    if (!uid) { setProviderStatus(null); return }
    supabase
      .from('provider_profiles')
      .select('status')
      .eq('user_id', uid)
      .maybeSingle()
      .then(({ data }) => setProviderStatus(data?.status ?? null))
  }, [session?.user.id, view])

  if (loading) return <div className="app-loading">Loading…</div>
  if (!session) return <AuthPage />

  const isAdmin = ADMIN_EMAILS.includes((session.user.email ?? '').toLowerCase())
 const isProvider = providerStatus === 'approved'
  return (
    <div className="app-shell">
      <AppNav
        view={view}
        onChange={setView}
        email={session.user.email ?? ''}
        onSignOut={() => supabase.auth.signOut()}
        isAdmin={isAdmin}
        isProvider={isProvider}
      />

      <main>
   
                 {view === 'services' && <ServicesPage />}
        {view === 'requests' && <RequestsPage />}
        {view === 'messages' && <MessagesPage />}
        {view === 'provider' && isProvider && <ProviderDashboardPage />}
         {view === 'settings' && <SettingsPage />}
        {view === 'admin' && isAdmin && <AdminPage />}
  
      </main>
    </div>
  )
}
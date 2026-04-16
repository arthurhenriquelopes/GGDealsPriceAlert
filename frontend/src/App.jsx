import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Auth from './components/Auth'
import { LogOut, LayoutDashboard } from 'lucide-react'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return <Auth />
  }

  return (
    <div className="dashboard-layout" style={styles.layout}>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <LayoutDashboard size={24} color="#10b981" />
          <span style={styles.brandText}>GGDeals Price Alert</span>
        </div>
        <button onClick={() => supabase.auth.signOut()} style={styles.logoutBtn}>
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <main style={styles.main}>
        <header style={styles.header}>
          <h2>Dashboard</h2>
          <p style={styles.welcome}>Welcome back, {session.user.email}</p>
        </header>
        
        <div style={styles.placeholderCard}>
          <p>Dashboard content migration from legacy HTML starting soon...</p>
        </div>
      </main>
    </div>
  )
}

const styles = {
  layout: { minHeight: '100vh', background: '#0f1113', color: '#fff', fontFamily: 'Segoe UI, sans-serif' },
  navbar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '20px 40px',
    background: '#1a1d1f',
    borderBottom: '1px solid #2f3336'
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '12px' },
  brandText: { fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #ef4444',
    color: '#ef4444',
    padding: '8px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  main: { padding: '40px' },
  header: { marginBottom: '30px' },
  welcome: { color: '#9ca3af', fontSize: '14px', marginTop: '4px' },
  placeholderCard: {
    padding: '60px',
    textAlign: 'center',
    background: '#1a1d1f',
    borderRadius: '16px',
    border: '2px dashed #2f3336',
    color: '#6b7280'
  }
}

export default App

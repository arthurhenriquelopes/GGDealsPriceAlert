import Dashboard from './components/Dashboard'

function App() {
  const [session, setSession] = useState(null)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchConfig(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchConfig(session.user.id)
      else {
        setConfig(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchConfig = async (userId) => {
    try {
      const { data } = await axios.get(`http://localhost:8080/api/config/${userId}`)
      setConfig(data)
    } catch (e) {
      console.log("No config found for user yet.")
      setConfig(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={styles.loader}>INITIALIZING SYSTEM...</div>
  if (!session) return <Auth />
  
  if (!config || !config.groqApiKey) {
    return <GroqSetup userId={session.user.id} onConfigSaved={(newConfig) => setConfig(newConfig)} />
  }

  return (
    <div className="dashboard-layout" style={styles.layout}>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <LayoutDashboard size={22} color="#04f06a" />
          <span style={styles.brandText}>GGDEALS PRICE ALERT</span>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button style={styles.settingsBtn} onClick={() => setConfig(null)}>
            <Settings size={18} /> API KEYS
          </button>
          <button onClick={() => supabase.auth.signOut()} style={styles.logoutBtn}>
            <LogOut size={18} /> LOGOUT
          </button>
        </div>
      </nav>

      <main style={styles.main}>
        <header style={styles.header}>
          <h2>DASHBOARD OVERVIEW</h2>
          <div style={styles.badge}>
            <span style={styles.statusDot}></span>
            AI ACTIVE: GROQ LINKED
          </div>
        </header>
        
        <Dashboard userId={session.user.id} initialConfig={config} />
      </main>
    </div>
  )
}

const styles = {
  loader: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0f1113', color: '#10b981' },
  layout: { minHeight: '100vh', background: '#0f1113', color: '#fff', fontFamily: 'Segoe UI, sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: '#1a1d1f', borderBottom: '1px solid #2f3336' },
  navBrand: { display: 'flex', alignItems: 'center', gap: '12px' },
  brandText: { fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' },
  settingsBtn: { background: 'transparent', border: '1px solid #2f3336', color: '#9ca3af', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  logoutBtn: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  main: { padding: '40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  badge: { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' },
  statusDot: { width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  card: { background: '#1a1d1f', padding: '25px', borderRadius: '16px', border: '1px solid #2f3336' }
}

export default App
